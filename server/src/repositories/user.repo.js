import Friendship, {FriendState} from "../models/friendship.model.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";
import mongoose from "mongoose";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {User} from "../models/user.model.js";
import {unSelectUserFieldToPublic} from "../utils/global.utils.js";
import {deleteAssetResourceWithRef} from "../services/assetResource.service.js";
import Major from "../models/major.model.js";
import Faculty from "../models/faculty.model.js";
import EnrollmentYear from "../models/enrollmentYear.model.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";

const respondFriendRequest = async ({friendshipId, receiverId, status}) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const existingFriendShip = await Friendship.findOne({
            _id: new mongoose.Types.ObjectId(friendshipId),
            receiver: new mongoose.Types.ObjectId(receiverId),
            status: "Pending"
        })
            .populate("sender receiver");
        if (!existingFriendShip) throw new BadRequestError("Invalid request");
        if (!existingFriendShip.sender || !existingFriendShip.receiver) {
            throw NotFoundError("An error occurred, the user does not exist")
        }
        existingFriendShip.status = status;
        await existingFriendShip.save({session});
        if (status === 'Accepted') {
            const sender = existingFriendShip.sender
            const receiver = existingFriendShip.receiver
            if (receiver.friends.findIndex(f => f.equals(sender._id)) === -1) {
                receiver.friends.push(sender._id)
                receiver.friendCount++
                await receiver.save({session})
            }
            if (sender.friends.findIndex(f => f.equals(receiver._id)) === -1) {
                sender.friends.push(receiver._id)
                sender.friendCount++
                await sender.save({session})
            }
        }

        await session.commitTransaction()
        return existingFriendShip.receiver.friendCount
    } catch (err) {
        await session.abortTransaction()
        throw err
    } finally {
        await session.endSession()
    }
}

const sendFriendRequest = async ({senderId, receiverId}) => {
    const existingFriendship = await Friendship.findOne({
        $or: [{sender: senderId, receiver: receiverId}, {sender: receiverId, receiver: senderId}]
    });
    if (existingFriendship) {
        if (existingFriendship.status === 'Rejected') {
            existingFriendship.status = "Pending"
            await existingFriendship.save()
            return "Send request success";
        }
        throw new BadRequestError("Friendships existed")
    }

    const newFriendship = new Friendship({
        sender: new mongoose.Types.ObjectId(senderId),
        receiver: new mongoose.Types.ObjectId(receiverId),
        status: "Pending"
    });
    await newFriendship.save();
    return "Send request success";
}

const getFriendsList = async (userId, {search = "", limit = 20, page = 1, select = []}) => {
    const skip = (page - 1) * limit
    const extend = ["__v", "friends"]

    const query = User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "friends",
                foreignField: "_id",
                as: "friends",
                let: {i: "$friends"},
                pipeline: [
                    {
                        $match: {
                            $or: [
                                {'username': new RegExp(search, 'i')},
                                {
                                    $expr: {
                                        $regexMatch: {
                                            input: {
                                                $concat: ['$firstName', " ", "$lastName"]
                                            },
                                            regex: new RegExp(search, 'i')
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                      $lookup: {
                          from: "resourcestorages",
                          localField: "avatar",
                          foreignField: "_id",
                          as: "avatar"
                      }
                    },
                    {
                        $set: {
                            // avatar: {
                            //     $ifNull: [{$first: "$avatar"}, {}],
                            // },
                            avatar: {
                                $ifNull: [
                                    {
                                        _id: { $first: "$avatar._id"},
                                        url: { $first: "$avatar.url"}
                                    },
                                    {}
                                ]
                            }
                        }
                    },
                    {
                        $project: unSelectUserFieldToPublic({extend})
                    }
                ]
            }
        },
        {
            $unwind: "$friends",
        },
        {
            $facet: {
                friendResults: [
                    {
                        $group: {
                            _id: '$_id',
                            friends: {$push: '$friends'},
                        }
                    },
                    {
                        $skip: parseInt(skip, 10),
                    },
                    {
                        $limit: parseInt(limit, 10),
                    },
                    {
                        $project: {
                            _id: 0
                        }
                    }
                ],
                totalCount: [
                    {
                        $group: {
                            _id: null,
                            count: {
                                $sum: 1
                            }
                        }
                    }
                ]
            }
        },
        {
            $replaceWith: {

                friends: {
                    $ifNull: [{$first: "$friendResults.friends"}, []],
                },
                totalCount: {
                    $ifNull: [{$first: "$totalCount.count"}, 0]
                }
            }
        }
    ]);

    const result = await query.exec()
    let formattedResult = {
        friends: [],
        totalCount: 0
    }
    if (result.length !== 0 && result[0]) {

        let uniqueMajorIds = new Set()
        let uniqueFacultyIds = new Set()
        let uniqueEnrollmentYearIds = new Set()

        result[0].friends.forEach(user => {
            if (user.details.major) {
                uniqueMajorIds.add(user.details.major)
            }
            if (user.details.faculty) {
                uniqueFacultyIds.add(user.details.faculty)
            }
            if (user.details.enrollmentYear) {
                uniqueEnrollmentYearIds.add(user.details.enrollmentYear)
            }
        })
        uniqueMajorIds = Array.from(uniqueMajorIds)
        uniqueFacultyIds = Array.from(uniqueFacultyIds)
        uniqueEnrollmentYearIds = Array.from(uniqueEnrollmentYearIds)
        let [majors, faculties, enrollmentYears] = await Promise.all([
            Major.find({_id: {$in: uniqueMajorIds}})
                .select("code name")
                .lean(),
            Faculty.find({_id: {$in: uniqueFacultyIds}})
                .select("code name")
                .lean(),
            EnrollmentYear.find({_id: {$in: uniqueEnrollmentYearIds}})
                .select("name startYear")
                .lean()
        ])
        majors = majors.reduce((acc, major) => {
            acc[major._id.toString()] = major
            return acc
        }, {})
        faculties = faculties.reduce((acc, faculty) => {
            acc[faculty._id.toString()] = faculty
            return acc
        }, {})
        enrollmentYears = enrollmentYears.reduce((acc, enrollmentYear) => {
            acc[enrollmentYear._id.toString()] = enrollmentYear
            return acc
        }, {})
        result[0].friends = result[0].friends.map(user => {
            if (user.details.major) {
                const majorId = user.details.major.toString()
                if (majors[majorId]) {
                    user.details.major = majors[majorId]
                } else {
                    user.details.major = {}
                }
            }
            if (user.details.faculty) {
                const facultyId = user.details.faculty.toString()
                if (faculties[facultyId]) {
                    user.details.faculty = faculties[facultyId]
                } else {
                    user.details.faculty = {}
                }
            }
            if (user.details.enrollmentYear) {
                const enrollmentYearId = user.details.enrollmentYear.toString()
                if (enrollmentYears[enrollmentYearId]) {
                    user.details.enrollmentYear = enrollmentYears[enrollmentYearId]
                } else {
                    user.details.enrollmentYear = {}
                }
            }
            return user
        })

        formattedResult.friends = result[0].friends
        formattedResult.totalCount = result[0].totalCount
    }
    return formattedResult
}

const findUsers = async ({userId, search = "", limit = 20, page = 1, select = []}) => {
    const skip = (page - 1) * limit
    const filter = {
        $and: [
            {
                $or: [
                    {
                        username: new RegExp(search, 'i')
                    },
                    {
                        $expr: {
                            $regexMatch: {
                                input: {
                                    $concat: ["$firstName", " ", "$lastName"]
                                },
                                regex: new RegExp(search, 'i')
                            }
                        }
                    }
                ]
            },
            {
                _id: {$ne: new mongoose.Types.ObjectId(userId)}
            }
        ]
    }
    let users = await User.find(filter)
        .select("-password -updatedAt -createdAt -birthdate -status -friends -email")
        .limit(limit)
        .skip(skip)
        .lean()
    const userIds = users.map(user => user._id.toString())
    const friendshipUserStates = await Friendship.find({
        $or: [
            {sender: userId, status: {$in: [FriendState.PENDING, FriendState.ACCEPTED]}, receiver: {$in: userIds}},
            {receiver: userId, status: {$in: [FriendState.PENDING, FriendState.ACCEPTED]}, sender: {$in: userIds}}
        ]
    })
    const friendshipMap = {}
    for (const friendshipState of friendshipUserStates) {
        let friendId
        if (friendshipState.sender.toString() !== userId) {
            friendId = friendshipState.sender.toString()
        } else if (friendshipState.receiver.toString() !== userId) {
            friendId = friendshipState.receiver.toString()
        }
        if (friendId) {
            friendshipMap[friendId] = friendshipState.status
        }
    }
    let uniqueMajorIds = new Set()
    let uniqueFacultyIds = new Set()
    let uniqueEnrollmentYearIds = new Set()

    users.forEach(user => {
        if (user.details.major) {
            uniqueMajorIds.add(user.details.major)
        }
        if (user.details.faculty) {
            uniqueFacultyIds.add(user.details.faculty)
        }
        if (user.details.enrollmentYear) {
            uniqueEnrollmentYearIds.add(user.details.enrollmentYear)
        }
    })
    uniqueMajorIds = Array.from(uniqueMajorIds)
    uniqueFacultyIds = Array.from(uniqueFacultyIds)
    uniqueEnrollmentYearIds = Array.from(uniqueEnrollmentYearIds)
    let [majors, faculties, enrollmentYears] = await Promise.all([
        Major.find({_id: {$in: uniqueMajorIds}})
            .select("code name")
            .lean(),
        Faculty.find({_id: {$in: uniqueFacultyIds}})
            .select("code name")
            .lean(),
        EnrollmentYear.find({_id: {$in: uniqueEnrollmentYearIds}})
            .select("name startYear")
            .lean()
    ])
    majors = majors.reduce((acc, major) => {
        acc[major._id.toString()] = major
        return acc
    }, {})
    faculties = faculties.reduce((acc, faculty) => {
        acc[faculty._id.toString()] = faculty
        return acc
    }, {})
    enrollmentYears = enrollmentYears.reduce((acc, enrollmentYear) => {
        acc[enrollmentYear._id.toString()] = enrollmentYear
        return acc
    }, {})
    users = users.map(user => {
        let friendState = ""
        if (friendshipMap.hasOwnProperty(user._id)) {
            friendState = friendshipMap[user._id]
        }
        if (user.details.major) {
            const majorId = user.details.major.toString()
            if (majors[majorId]) {
                user.details.major = majors[majorId]
            } else {
                user.details.major = {}
            }
        }
        if (user.details.faculty) {
            const facultyId = user.details.faculty.toString()
            if (faculties[facultyId]) {
                user.details.faculty = faculties[facultyId]
            } else {
                user.details.faculty = {}
            }
        }
        if (user.details.enrollmentYear) {
            const enrollmentYearId = user.details.enrollmentYear.toString()
            if (enrollmentYears[enrollmentYearId]) {
                user.details.enrollmentYear = enrollmentYears[enrollmentYearId]
            } else {
                user.details.enrollmentYear = {}
            }
        }
        return {userId: user._id, user, friendState}
    })
    const count = await User.countDocuments(filter)
    return {
        users,
        totalCount: count
    }

}

const getFriendRequests = async ({userId, search = "", limit = 20, page = 1, select = []}) => {
    const skip = (page - 1) * limit
    const extend = ["__v", "birthdate", "status", "friends", "email"]
    console.log(search)
    const query = Friendship
        .aggregate([
            {
                $match: {
                    receiver: new mongoose.Types.ObjectId(userId),
                    status: "Pending",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderInfo",
                    let: {i: "$senderInfo"},
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    {"username": new RegExp(search, 'i')},
                                    {
                                        $expr: {
                                            $regexMatch: {
                                                input: {
                                                    $concat: ["$firstName", " ", "$lastName"]
                                                },
                                                regex: new RegExp(search, 'i')
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $project: unSelectUserFieldToPublic({extend})
                        }
                    ]
                },
            },
            {
                $unwind: "$senderInfo",
            },
            {
                $facet: {
                    requests: [
                        {
                            $group: {
                                _id: "$_id",
                                sender: {
                                    "$first": "$senderInfo"
                                },
                                status: {
                                    "$first": "$status"
                                },
                                createdAt: {
                                    "$first": "$createdAt"
                                },
                                updatedAt: {
                                    "$first": "$updatedAt"
                                },

                            }
                        },
                        {
                            $sort: {createdAt: -1}
                        },
                        {
                            $skip: parseInt(skip, 10),
                        },
                        {
                            $limit: parseInt(limit, 10),
                        },
                    ],
                    count: [
                        {
                            $group: {
                                _id: null,
                                count: {
                                    $sum: 1
                                }
                            }
                        }
                    ]
                }
            },
            {
                $replaceWith: {
                    requests: "$requests",
                    totalCount: {$first: "$count.count"},
                }
            },
        ])
    const result = await query.exec()
    // return result
    if (result.length !== 0 && result[0]) {
        let uniqueMajorIds = new Set()
        let uniqueFacultyIds = new Set()
        let uniqueEnrollmentYearIds = new Set()
        result[0].requests.forEach((request) => {
            if (request.sender.details.major) {
                uniqueMajorIds.add(request.sender.details.major)
            }
            if (request.sender.details.faculty) {
                uniqueFacultyIds.add(request.sender.details.faculty)
            }
            if (request.sender.details.enrollmentYear) {
                uniqueEnrollmentYearIds.add(request.sender.details.enrollmentYear)
            }
            if(request.sender.details.registeredMajor) {
                uniqueMajorIds.add(request.sender.details.registeredMajor)
            }
        })
        uniqueMajorIds = Array.from(uniqueMajorIds)
        uniqueFacultyIds = Array.from(uniqueFacultyIds)
        uniqueEnrollmentYearIds = Array.from(uniqueEnrollmentYearIds)
        let [majors, faculties, enrollmentYears] = await Promise.all([
            Major.find({_id: {$in: uniqueMajorIds}})
                .select("code name")
                .lean(),
            Faculty.find({_id: {$in: uniqueFacultyIds}})
                .select("code name")
                .lean(),
            EnrollmentYear.find({_id: {$in: uniqueEnrollmentYearIds}})
                .select("name startYear")
                .lean()
        ])
        majors = majors.reduce((acc, major) => {
            acc[major._id.toString()] = major
            return acc
        }, {})
        faculties = faculties.reduce((acc, faculty) => {
            acc[faculty._id.toString()] = faculty
            return acc
        }, {})
        enrollmentYears = enrollmentYears.reduce((acc, enrollmentYear) => {
            acc[enrollmentYear._id.toString()] = enrollmentYear
            return acc
        }, {})
        result[0].requests = result[0].requests.map((request) => {
            if (request.sender.details.major) {
                const majorId = request.sender.details.major.toString()
                if (majors[majorId]) {
                    request.sender.details.major = majors[majorId]
                } else {
                    request.sender.details.major = {}
                }
            }
            if (request.sender.details.faculty) {
                const facultyId = request.sender.details.faculty.toString()
                if (faculties[facultyId]) {
                    request.sender.details.faculty = faculties[facultyId]
                } else {
                    request.sender.details.faculty = {}
                }
            }
            if (request.sender.details.enrollmentYear) {
                const enrollmentYearId = request.sender.details.enrollmentYear.toString()
                if (enrollmentYears[enrollmentYearId]) {
                    request.sender.details.enrollmentYear = enrollmentYears[enrollmentYearId]
                } else {
                    request.sender.details.enrollmentYear = {}
                }
            }
            if(request.sender.details.registeredMajor) {
                const registeredMajorId = request.sender.details.registeredMajor.toString()
                if(majors[registeredMajorId]) {
                    request.sender.details.registeredMajor = majors[registeredMajorId]
                } else {
                    request.sender.details.registeredMajor = {}
                }
            }
            return request
        })
    }

    let formattedResult = {
        requests: [],
        totalCount: 0
    }
    if (result.length !== 0 && result[0]) {
        formattedResult.requests = result[0].requests
        formattedResult.totalCount = result[0].totalCount
    }
    return formattedResult
}

const findUserById = async(user, id) => {
    let findUser = await User.findById(id)
    findUser = findUser.toPublicData()
    let friendState = ""
    if(findUser.friends && findUser.friends.includes(id)) {
        friendState = "Accepted"
    }
    if (!findUser) throw new NotFoundError()
    if(friendState === "") {
        const friendShipUserState = await Friendship.findOne({
            $or: [
                { sender: user._id, status: { $in: [FriendState.PENDING, FriendState.ACCEPTED]}, receiver: { $in: [id]}},
                { sender: id, status: { $in: [FriendState.PENDING, FriendState.ACCEPTED]}, receiver: { $in: [user._id]}},
            ]
        }).select("status")
        if(friendShipUserState) {
            friendState = friendShipUserState.status
        }
    }

    let uniqueMajorIds = new Set()
    let uniqueFacultyIds = new Set()
    let uniqueEnrollmentYearIds = new Set()
    if (findUser.details.major) {
        uniqueMajorIds = Array.from([findUser.details.major])
    }
    if (findUser.details.faculty) {
        uniqueFacultyIds = Array.from([findUser.details.faculty])
    }
    if (findUser.details.registeredMajor) {
        uniqueMajorIds = Array.from([findUser.details.registeredMajor])
    }
    if (findUser.details.enrollmentYear) {
        uniqueEnrollmentYearIds = Array.from([findUser.details.enrollmentYear])
    }
    let [majors, faculties, enrollmentYears] = await Promise.all([
        Major.find({_id: {$in: uniqueMajorIds}})
            .select("code name")
            .lean(),
        Faculty.find({_id: {$in: uniqueFacultyIds}})
            .select("code name")
            .lean(),
        EnrollmentYear.find({_id: {$in: uniqueEnrollmentYearIds}})
            .select("name startYear")
            .lean()
    ])
    majors = majors.reduce((acc, major) => {
        acc[major._id.toString()] = major
        return acc
    }, {})
    faculties = faculties.reduce((acc, faculty) => {
        acc[faculty._id.toString()] = faculty
        return acc
    }, {})
    enrollmentYears = enrollmentYears.reduce((acc, enrollmentYear) => {
        acc[enrollmentYear._id.toString()] = enrollmentYear
        return acc
    }, {})
    if (findUser.details.major) {
        const majorId = findUser.details.major.toString()
        if (majors[majorId]) {
            findUser.details.major = majors[majorId]
        } else {
            findUser.details.major = {}
        }
    }
    if (findUser.details.faculty) {
        const facultyId = findUser.details.faculty.toString()
        if (faculties[facultyId]) {
            findUser.details.faculty = faculties[facultyId]
        } else {
            findUser.details.faculty = {}
        }
    }
    if (findUser.details.registeredMajor) {
        const registeredMajorId = findUser.details.registeredMajor.toString()
        if (majors[registeredMajorId]) {
            findUser.details.registeredMajor = majors[registeredMajorId]
        } else {
            findUser.details.registeredMajor = {}
        }
    }
    if (findUser.details.enrollmentYear) {
        const enrollmentYearId = findUser.details.enrollmentYear.toString()
        if (enrollmentYears[enrollmentYearId]) {
            findUser.details.enrollmentYear = enrollmentYears[enrollmentYearId]
        } else {
            findUser.details.enrollmentYear = {}
        }
    }
    return {
        user: findUser,
        friendState
    }
}

const findByEmail = async (email) => {
    let user = await User.findOne({email})
    if (!user) throw new NotFoundError()
    let uniqueMajorIds = new Set()
    let uniqueFacultyIds = new Set()
    let uniqueEnrollmentYearIds = new Set()
    if (user.details.major) {
        uniqueMajorIds = Array.from([user.details.major])
    }
    if (user.details.faculty) {
        uniqueFacultyIds = Array.from([user.details.faculty])
    }
    if (user.details.registeredMajor) {
        uniqueMajorIds = Array.from([user.details.registeredMajor])
    }
    if (user.details.enrollmentYear) {
        uniqueEnrollmentYearIds = Array.from([user.details.enrollmentYear])
    }
    let [majors, faculties, enrollmentYears] = await Promise.all([
        Major.find({_id: {$in: uniqueMajorIds}})
            .select("code name")
            .lean(),
        Faculty.find({_id: {$in: uniqueFacultyIds}})
            .select("code name")
            .lean(),
        EnrollmentYear.find({_id: {$in: uniqueEnrollmentYearIds}})
            .select("name startYear")
            .lean()
    ])
    majors = majors.reduce((acc, major) => {
        acc[major._id.toString()] = major
        return acc
    }, {})
    faculties = faculties.reduce((acc, faculty) => {
        acc[faculty._id.toString()] = faculty
        return acc
    }, {})
    enrollmentYears = enrollmentYears.reduce((acc, enrollmentYear) => {
        acc[enrollmentYear._id.toString()] = enrollmentYear
        return acc
    }, {})
    if (user.details.major) {
        const majorId = user.details.major.toString()
        if (majors[majorId]) {
            user.details.major = majors[majorId]
        } else {
            user.details.major = {}
        }
    }
    if (user.details.faculty) {
        const facultyId = user.details.faculty.toString()
        if (faculties[facultyId]) {
            user.details.faculty = faculties[facultyId]
        } else {
            user.details.faculty = {}
        }
    }
    if (user.details.registeredMajor) {
        const registeredMajorId = user.details.registeredMajor.toString()
        if (majors[registeredMajorId]) {
            user.details.registeredMajor = majors[registeredMajorId]
        } else {
            user.details.registeredMajor = {}
        }
    }
    if (user.details.enrollmentYear) {
        const enrollmentYearId = user.details.enrollmentYear.toString()
        if (enrollmentYears[enrollmentYearId]) {
            user.details.enrollmentYear = enrollmentYears[enrollmentYearId]
        } else {
            user.details.enrollmentYear = {}
        }
    }
    return user
}

const findById = async (id) => {
    const user = await User.findById(id)
    if (!user) throw new NotFoundError()
    return user.toPublicData()
}

const getAvatarUser = async (id) => {
    const userAvatar = await User.findById(id)
        .select("-_id avatar")
    if (!userAvatar) throw new NotFoundError()
    return userAvatar.avatar
}

const create = async (model, payload, session) => {
    console.log("create payload: " + payload)
    const user = await model.create([payload], {session, _id: false})
    if (model === User) {
        console.log(user)
        return user[0].toPublicData()
    }
    return user
}

const uploadAvatar = async (userId, avatar) => {
    const update = await User.findByIdAndUpdate(userId, {avatar}, {new: true})
    if (!update) throw new NotFoundError()
    return update.avatar
}

const removeAvatar = async (userId) => {
    let user = await User.findById(userId)
    if (!user) throw new NotFoundError()
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        if (user.avatar) {
            const resourceId = user.avatar._id
            await deleteAssetResourceWithRef({
                resources: [resourceId]
            })
            user.avatar = undefined
            user = await user.save({new: true, session})
            await session.commitTransaction()
            return "Remove avatar success"
        } else {
            throw new BadRequestError()
        }
    } catch (err) {
        console.log(err)
        await session.abortTransaction()
        throw err
    } finally {
        await session.endSession()
    }

}

const updateUserById = async ({
                                  id,
                                  payload,
                                  model,
                                  returnNew = true,
                                  session
                              }) => {
    let update = await model.findByIdAndUpdate(id, payload, {new: returnNew, session: session})
    if (model === User) {
        update = update.toPublicData()
        let uniqueMajorIds = new Set()
        let uniqueFacultyIds = new Set()
        let uniqueEnrollmentYearIds = new Set()
        if (update.details.major) {
            uniqueMajorIds = Array.from([update.details.major])
        }
        if (update.details.faculty) {
            uniqueFacultyIds = Array.from([update.details.faculty])
        }
        if (update.details.registeredMajor) {
            uniqueMajorIds = Array.from([update.details.registeredMajor])
        }
        if (update.details.enrollmentYear) {
            uniqueEnrollmentYearIds = Array.from([update.details.enrollmentYear])
        }
        let [majors, faculties, enrollmentYears] = await Promise.all([
            Major.find({_id: {$in: uniqueMajorIds}})
                .select("code name")
                .lean(),
            Faculty.find({_id: {$in: uniqueFacultyIds}})
                .select("code name")
                .lean(),
            EnrollmentYear.find({_id: {$in: uniqueEnrollmentYearIds}})
                .select("name startYear")
                .lean()
        ])
        majors = majors.reduce((acc, major) => {
            acc[major._id.toString()] = major
            return acc
        }, {})
        faculties = faculties.reduce((acc, faculty) => {
            acc[faculty._id.toString()] = faculty
            return acc
        }, {})
        enrollmentYears = enrollmentYears.reduce((acc, enrollmentYear) => {
            acc[enrollmentYear._id.toString()] = enrollmentYear
            return acc
        }, {})
        if (update.details.major) {
            const majorId = update.details.major.toString()
            if (majors[majorId]) {
                update.details.major = majors[majorId]
            } else {
                update.details.major = {}
            }
        }
        if (update.details.faculty) {
            const facultyId = update.details.faculty.toString()
            if (faculties[facultyId]) {
                update.details.faculty = faculties[facultyId]
            } else {
                update.details.faculty = {}
            }
        }
        if (update.details.registeredMajor) {
            const registeredMajorId = update.details.registeredMajor.toString()
            if (majors[registeredMajorId]) {
                update.details.registeredMajor = majors[registeredMajorId]
            } else {
                update.details.registeredMajor = {}
            }
        }
        if (update.details.enrollmentYear) {
            const enrollmentYearId = update.details.enrollmentYear.toString()
            if (enrollmentYears[enrollmentYearId]) {
                update.details.enrollmentYear = enrollmentYears[enrollmentYearId]
            } else {
                update.details.enrollmentYear = {}
            }
        }
        return update
    }
    return update
}

const changePassword = async ({userId, currentPassword, newPassword}) => {
    const user = await User.findById(userId)
    const match = await user.comparePassword(currentPassword)
    if (!match) throw new InvalidCredentialsError()
    user.password = newPassword
    await user.save()
    return "Change password success"
}

export {
    sendFriendRequest, respondFriendRequest, getFriendsList, getFriendRequests,
    findById, updateUserById, create, findByEmail, uploadAvatar, removeAvatar,
    findUsers, changePassword, getAvatarUser, findUserById
}


