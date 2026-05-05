import { RoleEnum } from "../../../common/enums/user.enum";
import { isAuthorized } from "../../../middleware/auth.middelware";
import { authSecurityService, AuthSecurityService } from "../user.service"

export class UserResolver {
    private userService: AuthSecurityService;
    constructor() {
        this.userService = authSecurityService
    }

profile = async (parent, args, { user }) => {

    // await isAuthorized([RoleEnum.USER], user)
    const data = await this.userService.profile(user);
    console.log(data);
    

    return {
        message: "Hello",
        data
    };
}
}

export const userResolver = new UserResolver()
