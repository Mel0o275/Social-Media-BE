import z from "zod"
import { generalValidationFeilds } from "../../common/validation/general.validation"

export const loginSchema = {
    body: z.strictObject({
        email: generalValidationFeilds.email,
        password: generalValidationFeilds.password,
    })
}

export const signUpSchema = {
    // params:z.strictObject({
    //     userId: z.string()
    // }),
    body: loginSchema.body.safeExtend({
        username: generalValidationFeilds.username,
        phone: generalValidationFeilds.phone,
        confirmPassword: generalValidationFeilds.confirmPassword,
    }).superRefine((data, ctx) => {
        if(data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords don't match",
                path: ['confirmPassword']
            })
        }
    })
}