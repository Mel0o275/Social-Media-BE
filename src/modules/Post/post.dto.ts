import z from "zod";
import { createPostSchema } from "./post.validation";

export type createPostDTO = z.infer<typeof createPostSchema.body>;