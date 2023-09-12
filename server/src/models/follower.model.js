import mongoose, {Schema} from 'mongoose'

const FollowerSchema = new Schema({
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        flowers: [
            {
                followee: {
                    type: Schema.Types.ObjectId,
                    ref: "User"
                },
                count: Number
            }
        ]
    }
    , {
        timestamps: false
    }
)

const Follower = mongoose.model('Follower', FollowerSchema)

export default Follower
