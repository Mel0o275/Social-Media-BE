import { z } from 'zod';
import { PostAvailabilityEnum } from '../../common/enums/post.enum';
import { Types } from 'mongoose';

export const createPostSchema = {
    body: z.object({
        content: z.string().optional(),
        files: z.any().optional(),
        tags: z.array(z.string()).optional(),
        availability: z.coerce.number().default(PostAvailabilityEnum.PUBLIC)
    }).superRefine((data, ctx) => {

        if (!data.files?.length && !data.content) {
            ctx.addIssue({
                code: "custom",
                message: "Either content or files must be provided",
                path: ["content"]
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