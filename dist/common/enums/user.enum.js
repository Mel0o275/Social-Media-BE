"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = exports.TokenTypeEnum = exports.GenderEnum = exports.RoleEnum = void 0;
var RoleEnum;
(function (RoleEnum) {
    RoleEnum[RoleEnum["USER"] = 0] = "USER";
    RoleEnum[RoleEnum["ADMIN"] = 1] = "ADMIN";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
var GenderEnum;
(function (GenderEnum) {
    GenderEnum[GenderEnum["MALE"] = 0] = "MALE";
    GenderEnum[GenderEnum["FEMALE"] = 1] = "FEMALE";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum[TokenTypeEnum["TOKEN"] = 0] = "TOKEN";
    TokenTypeEnum[TokenTypeEnum["REFRESH"] = 1] = "REFRESH";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
var provider;
(function (provider) {
    provider[provider["LOCAL"] = 0] = "LOCAL";
    provider[provider["GOOGLE"] = 1] = "GOOGLE";
})(provider || (exports.provider = provider = {}));
