"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.ReactionTypeEnum = exports.PostAvailabilityEnum = void 0;
var PostAvailabilityEnum;
(function (PostAvailabilityEnum) {
    PostAvailabilityEnum[PostAvailabilityEnum["PUBLIC"] = 0] = "PUBLIC";
    PostAvailabilityEnum[PostAvailabilityEnum["FRIENDS_ONLY"] = 1] = "FRIENDS_ONLY";
    PostAvailabilityEnum[PostAvailabilityEnum["PRIVATE"] = 2] = "PRIVATE";
})(PostAvailabilityEnum || (exports.PostAvailabilityEnum = PostAvailabilityEnum = {}));
var ReactionTypeEnum;
(function (ReactionTypeEnum) {
    ReactionTypeEnum[ReactionTypeEnum["LIKE"] = 0] = "LIKE";
    ReactionTypeEnum[ReactionTypeEnum["LOVE"] = 1] = "LOVE";
    ReactionTypeEnum[ReactionTypeEnum["HAHA"] = 2] = "HAHA";
    ReactionTypeEnum[ReactionTypeEnum["WOW"] = 3] = "WOW";
    ReactionTypeEnum[ReactionTypeEnum["SAD"] = 4] = "SAD";
    ReactionTypeEnum[ReactionTypeEnum["ANGRY"] = 5] = "ANGRY";
})(ReactionTypeEnum || (exports.ReactionTypeEnum = ReactionTypeEnum = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["LIKE"] = "LIKE";
    NotificationType["COMMENT"] = "COMMENT";
    NotificationType["MENTION"] = "MENTION";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
