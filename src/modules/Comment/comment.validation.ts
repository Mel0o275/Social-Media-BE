import { z } from 'zod';
import { Types } from 'mongoose';
import { PostAvailabilityEnum } from '../../common/enums/post.enum';

export const createCommentSchema = {
    body: z.object({
        content: z.string().optional(),
        files: z.any().optional(),

        postId: z.string(),

        parentComment: z.string().optional(),

        tags: z.array(z.string()).optional(),

        availability: z.coerce
            .number()
            .default(PostAvailabilityEnum.PUBLIC)
    }).superRefine((data, ctx) => {

        if (!data.files?.length && !data.content) {
            ctx.addIssue({
                code: "custom",
                message: "Either content or files must be provided",
                path: ["content"]
            });
        }

        if (!Types.ObjectId.isValid(data.postId)) {
            ctx.addIssue({
                code: "custom",
                message: "Invalid postId",
                path: ["postId"]
            });
        }

        if (data.parentComment && !Types.ObjectId.isValid(data.parentComment)) {
            ctx.addIssue({
                code: "custom",
                message: "Invalid parentComment ID",
                path: ["parentComment"]
            });
        }

        if (data.tags?.length) {

            const uniqueTags = [...new Set(data.tags)];

            if (uniqueTags.length !== data.tags.length) {
                ctx.addIssue({
                    code: "custom",
                    message: "Tags must be unique",
                    path: ["tags"]
                });
            }

            for (const tag of data.tags) {
                if (!Types.ObjectId.isValid(tag)) {
                    ctx.addIssue({
                        code: "custom",
                        message: `Invalid tag ID: ${tag}`,
                        path: ["tags"]
                    });
                }
            }
        }

    })
};