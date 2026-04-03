import { Schema, model } from "mongoose";
import { GenderEnum, RoleEnum, provider } from "../../../common/enums/user.enum";
import { IUser } from "../../../common/interfaces/user.interface";

const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: function(): boolean { return this.provider === provider.LOCAL } },
    password: { type: String, required: function(): boolean { return this.provider === provider.LOCAL } },
    email: { type: String, required: true, unique: true },
    bio: { type: String, maxlength: 500 },
    phone: { type: String, required: false },
    profileImage: { type: String },
    coverImages: [{ type: String }],
    DOB: { type: Date, required: false },
    confirmedAt: { type: Date },
    gender: { type: Number, enum: GenderEnum, default: GenderEnum.MALE },
    role: { type: Number, enum: RoleEnum, default: RoleEnum.USER },
    provider :{type: Number, enum: provider, default: provider.LOCAL },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'Users',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

userSchema.virtual('username').get(function(this: IUser) {
    return `${this.firstName} ${this.lastName}`;
}).set(function(this: IUser, name: string) {
    const [firstName, lastName] = name.split(' ');
    this.firstName = firstName as string;
    this.lastName = lastName as string;
});

export const UserModel = model<IUser>('User', userSchema) || model<IUser>('User');
