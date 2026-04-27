"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const user_enum_1 = require("../../../common/enums/user.enum");
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: function () { return this.provider === user_enum_1.provider.LOCAL; } },
    password: { type: String, required: function () { return this.provider === user_enum_1.provider.LOCAL; } },
    email: { type: String, required: true, unique: true },
    bio: { type: String, maxlength: 500 },
    phone: { type: String, required: false },
    profileImage: { type: String },
    coverImages: [{ type: String }],
    DOB: { type: Date, required: false },
    confirmedAt: { type: Date },
    gender: { type: Number, enum: user_enum_1.GenderEnum, default: user_enum_1.GenderEnum.MALE },
    role: { type: Number, enum: user_enum_1.RoleEnum, default: user_enum_1.RoleEnum.USER },
    provider: { type: Number, enum: user_enum_1.provider, default: user_enum_1.provider.LOCAL },
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
});
userSchema.virtual('username').get(function () {
    return `${this.firstName} ${this.lastName}`;
}).set(function (name) {
    const [firstName, lastName] = name.split(' ');
    this.firstName = firstName;
    this.lastName = lastName;
});
exports.UserModel = (0, mongoose_1.model)('User', userSchema) || (0, mongoose_1.model)('User');
