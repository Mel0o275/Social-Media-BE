"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const post_enum_1 = require("../../common/enums/post.enum");
exports.createCommentSchema = {
    body: zod_1.z.object({
        content: zod_1.z.string().optional(),
        files: zod_1.z.any().optional(),
        postId: zod_1.z.string(),
        parentComment: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        availability: zod_1.z.coerce
            .number()
            .default(post_enum_1.PostAvailabilityEnum.PUBLIC)
    }).superRefine((data, ctx) => {
        if (!data.files?.length && !data.content) {
            ctx.addIssue({
                code: "custom",
                message: "Either content or files must be provided",
                path: ["content"]
            });
        }
        if (!mongoose_1.Types.ObjectId.isValid(data.postId)) {
            ctx.addIssue({
                code: "custom",
                message: "Invalid postId",
                path: ["postId"]
            });
        }
        if (data.parentComment && !mongoose_1.Types.ObjectId.isValid(data.parentComment)) {
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
                if (!mongoose_1.Types.ObjectId.isValid(tag)) {
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
