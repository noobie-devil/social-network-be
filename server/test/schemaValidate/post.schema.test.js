import { expect} from "chai"
import Joi from 'joi'
import {isValidMongoId} from "../../src/utils/global.utils.js"
import {createPostSchema} from "../../src/schemaValidate/post.schema.js"
import mongoose from "mongoose";

const validObjectId = new mongoose.Types.ObjectId().toString()

describe('createPostSchema', () => {
    it('should validate a valid post', () => {
        const validPost = {
            userAuthor: validObjectId,
            content: "This is a valid post content.",
            privacyMode: 1,
            tags: ['tag1', 'tag2']
        }
        const result = createPostSchema.validate(validPost)
        expect(result.error).to.be.undefined
    })

    it('should not validate a post with both userAuthor and userPageAuthor', () => {
        const invalidPost = {
            userAuthor: validObjectId,
            userPageAuthor: validObjectId,
            content: 'This post should not be valid.',
        }

        const result = createPostSchema.validate(invalidPost)
        expect(result.error).to.exist
    })

    it('should not validate a post with null content when postResources is null', () => {
        const invalidPost = {
            userAuthor: validObjectId,
            content: null,
            privacyMode: 1
        }
        const result = createPostSchema.validate(invalidPost)
        expect(result.error).to.exist
    })

    it('should validate a post with null content when postResources is not null', () => {
        const validPost = {
            userAuthor: validObjectId,
            postResources: [validObjectId],
            privacyMode: 1,
        }

        const result = createPostSchema.validate(validPost)
        expect(result.error).to.be.undefined
    })

    it('should not validate a post with invalid privacyMode', () => {
        const invalidPost = {
            userAuthor: validObjectId,
            content: 'This post should not be valid.',
            privacyMode: 3,
        }

        const result = createPostSchema.validate(invalidPost)
        expect(result.error).to.exist
    })
})
