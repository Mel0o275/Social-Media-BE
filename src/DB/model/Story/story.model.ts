import { Schema, model } from "mongoose";
import { IStory } from "../../../common/interfaces/story.interface";

const storySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    media: {
        type: [String],
        required: true
    },

    caption: {
        type: String,
        default: ""
    },

    views: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24
    },

    visibility: {
    type: String,
    enum: ["public", "private", "friends"],
    default: "public"
}
}, {
    timestamps: true
});

export const StoryModel = model<IStory>('Story', storySchema) || model<IStory>('Story');
