import { Types } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface";
import { S3Service } from "../../common/services/s3.service";
import { StoryModel } from "../../DB/model/Story/story.model";
import { FCMService } from "../../common/services/notification.service";

export class StoryService {

    private readonly s3: S3Service
    private readonly fcmService: FCMService
    constructor() {
        this.s3 = new S3Service();
        this.fcmService = new FCMService();
    }

    async createStory(user: IUser, files: Express.Multer.File[]) {

        if (!files?.length) {
            throw new Error("Story media required");
        }

        const media = await this.s3.uuploadFiles({
            files,
            path: `stories/${user._id}`
        });

        const story = await StoryModel.create({
            user: user._id,
            media
        });

        return story;
    }

    async viewStory(storyId: Types.ObjectId, user: IUser) {

    const story = await StoryModel.findById(storyId);

    if (!story) {
        throw new Error("Story not found");
    }

    if (
        story.visibility === "private" &&
        !story.user.equals(user._id)
    ) {
        throw new Error("You are not allowed to view this story");
    }

    await StoryModel.updateOne(
        { _id: storyId },
        {
            $addToSet: { views: user._id }
        }
    );
}

    async getStories() {

        const stories = await StoryModel.find({
            visibility: "public"
        })
            .populate("user", "firstName lastName profilePicture")
            .sort({ createdAt: -1 });

        return stories;
    }
}

export const storyService = new StoryService();
