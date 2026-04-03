import z from "zod";
import { loginSchema, signUpSchema } from "./auth.validation";

// export interface loginDTO {
//     email: string;
//     password: string;
// }

// export interface signUpDTO extends loginDTO {
//     username: string;
// }

export type signUpDTO = z.infer<typeof signUpSchema.body>;
export type loginDTO = z.infer<typeof loginSchema.body>