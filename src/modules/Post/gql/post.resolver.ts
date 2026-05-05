import { paginationSchema } from "../../../common/validation/pagination";
import { GQLvalidation } from "../../../middleware";
import { postService, PostService } from "../post.service";

export class PostResolver {
    private postService: PostService;

    constructor() {
        this.postService = postService;
    }

    postList = async (parent: unknown, args: any, context: any) => {

        const { user } = context;

        if (!user) {
            throw new Error("Unauthorized");
        }

        const { limit = 10, cursor } = args;

        await GQLvalidation(paginationSchema.query, args)
        const result = await this.postService.getFeedPosts(
            user._id,
            limit,
            cursor
        );

        return {
            message: "success",
            data: result.posts,
            nextCursor: result.nextCursor
        };
    };

    reactOnPost = async (parent: unknown, { postId, react }, { user }) => {

        const data = await this.postService.reactToPost(
            postId,
            user,
            react
        );

        return {
            message: "DONE",
            data
        };
    };
}

export const postResolver = new PostResolver();