import { compare, hash } from "bcryptjs";

export const generateHash = async (input: string, salt = 10): Promise<string> => {
    const hashed = await hash(input, salt);
    return hashed;
};

export const compareHash = async (input: string, hashedValue: string): Promise<boolean> => {
    const isMatch = await compare(input, hashedValue);
    return isMatch;
}