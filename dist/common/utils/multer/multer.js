"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudFileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const node_crypto_1 = require("node:crypto");
const node_os_1 = require("node:os");
const multer_enum_1 = require("../../enums/multer.enum");
const multer_validation_1 = require("./multer.validation");
const cloudFileUpload = ({ storageApproach = multer_enum_1.storageApproachEnum.Memory, validation = [], maxSize = 5 }) => {
    // const storage = multer.memoryStorage()
    const storage = storageApproach === multer_enum_1.storageApproachEnum.Memory ? multer_1.default.memoryStorage() : multer_1.default.diskStorage({
        destination(req, file, callback) {
            callback(null, (0, node_os_1.tmpdir)());
        },
        filename(req, file, callback) {
            callback(null, `${(0, node_crypto_1.randomUUID)()}-${file.originalname}`);
        },
    });
    return (0, multer_1.default)({ fileFilter: (0, multer_validation_1.fileFilter)(validation), storage, limits: { fileSize: maxSize * 1024 * 1024, files: 2 } });
};
exports.cloudFileUpload = cloudFileUpload;
