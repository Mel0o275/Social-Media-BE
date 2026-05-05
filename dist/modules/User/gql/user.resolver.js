"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = exports.UserResolver = void 0;
const user_service_1 = require("../user.service");
class UserResolver {
    userService;
    constructor() {
        this.userService = user_service_1.authSecurityService;
    }
    profile = async (parent, args, { user }) => {
        // await isAuthorized([RoleEnum.USER], user)
        const data = await this.userService.profile(user);
        console.log(data);
        return {
            message: "Hello",
            data
        };
    };
}
exports.UserResolver = UserResolver;
exports.userResolver = new UserResolver();
