"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResolver = exports.PostResolver = void 0;
const pagination_1 = require("../../../common/validation/pagination");
const middleware_1 = require("../../../middleware");
const post_service_1 = require("../post.service");
class PostResolver {
    postService;
    constructor() {
        this.postService = post_service_1.postService;
    }
    postList = async (parent, args, context) => {
        const { user } = context;
        if (!user) {
            throw new Error("Unauthorized");
        }
        const { limit = 10, cursor } = args;
        await (0, middleware_1.GQLvalidation)(pagination_1.paginationSchema.query, args);
        const result = await this.postService.getFeedPosts(user._id, limit, cursor);
        return {
            message: "success",
            data: result.posts,
            nextCursor: result.nextCursor
        };
    };
    reactOnPost = async (parent, { postId, react }, { user }) => {
        const data = await this.postService.reactToPost(postId, user, react);
        return {
            message: "DONE",
            data
        };
    };
}
exports.PostResolver = PostResolver;
exports.postResolver = new PostResolver();
