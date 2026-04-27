"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../../config/config");
const node_crypto_1 = require("node:crypto");
const multer_enum_1 = require("../enums/multer.enum");
const node_fs_1 = require("node:fs");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3Service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_1.AWS_REGION,
            credentials: {
                accessKeyId: config_1.AWS_ACCESS_KEY,
                secretAccessKey: config_1.AWS_SECRET_KEY
            }
        });
    }
    async uuploadFile({ storageApproach = multer_enum_1.storageApproachEnum.Memory, Bucket = config_1.AWS_BUCKET_NAME, path = "general", file, ACL = client_s3_1.ObjectCannedACL.private, ContentType }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: `Social/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
            ACL,
            Body: storageApproach === multer_enum_1.storageApproachEnum.Memory ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
            ContentType: ContentType || file.mimetype
        });
        if (!command.input.Key) {
            throw new Error("File key is required");
        }
        await this.client.send(command);
        return command.input?.Key;
    }
    async uuploadLargeFile({ storageApproach = multer_enum_1.storageApproachEnum.Disk, Bucket = config_1.AWS_BUCKET_NAME, path = "general", file, ACL = client_s3_1.ObjectCannedACL.private, ContentType, partSize = 5 }) {
        const uploudFile = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket,
                Key: `Social/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
                ACL,
                Body: storageApproach === multer_enum_1.storageApproachEnum.Memory ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
                ContentType: ContentType || file.mimetype
            },
            partSize: partSize * 1024 * 1024,
        });
        uploudFile.on("httpUploadProgress", (progress) => {
            console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
        });
        return await uploudFile.done();
    }
    async uuploadFiles({ storageApproach = multer_enum_1.storageApproachEnum.Memory, uploadApproach = multer_enum_1.uploadApproachEnum.Small, Bucket = process.env.AWS_BUCKET_NAME, path = "general", files, ACL = client_s3_1.ObjectCannedACL.private }) {
        if (!Bucket) {
            throw new Error("Bucket is missing");
        }
        if (!files || files.length === 0) {
            throw new Error("No files provided");
        }
        let urls = [];
        if (uploadApproach === multer_enum_1.uploadApproachEnum.Small) {
            urls = await Promise.all(files.map((file) => this.uuploadFile({
                storageApproach,
                file,
                ACL,
                Bucket,
                ContentType: file.mimetype,
                path
            })));
        }
        else {
            const data = await Promise.all(files.map((file) => this.uuploadLargeFile({
                storageApproach,
                file,
                ACL,
                Bucket,
                ContentType: file.mimetype,
                path
            })));
            urls = data.map((res) => {
                if (!res?.Key) {
                    throw new Error("File key is missing in the upload response");
                }
                return res.Key;
            });
        }
        return urls;
    }
    async createPresignedUploadLink({ Bucket = config_1.AWS_BUCKET_NAME, path = "general", ContentType, OriginalName }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: `Social/${path}/${(0, node_crypto_1.randomUUID)()}__${OriginalName}`,
            ContentType: ContentType
        });
        if (!command.input.Key) {
            throw new Error("File key is required");
        }
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: 3600 });
        return { url, key: command.input.Key };
    }
    async getPresignedUploadLink({ Bucket = config_1.AWS_BUCKET_NAME, Key, fileName, download }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download === "true" ? `attachment; filename="${fileName || Key?.split("/").pop()}"` : undefined
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: 3600 });
        return url;
    }
    async Get({ Bucket = config_1.AWS_BUCKET_NAME, Key }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key
        });
        return await this.client.send(command);
    }
    async deleteFile({ Bucket = config_1.AWS_BUCKET_NAME, Key }) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket,
            Key
        });
        return await this.client.send(command);
    }
    async deleteFiles({ Bucket = config_1.AWS_BUCKET_NAME, Keys }) {
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects: Keys,
                Quiet: true
            }
        });
        return await this.client.send(command);
    }
    async listFolderDir({ Bucket = config_1.AWS_BUCKET_NAME, prefix }) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket,
            Prefix: prefix
        });
        return await this.client.send(command);
    }
    async deleteFolderByPrefix({ Bucket = config_1.AWS_BUCKET_NAME, prefix }) {
        const result = await this.listFolderDir({ Bucket, prefix });
        if (result.Contents && result.Contents.length > 0) {
            const keysToDelete = result.Contents.map((item) => ({ Key: item.Key }));
            await this.deleteFiles({ Bucket, Keys: keysToDelete });
        }
    }
}
exports.S3Service = S3Service;
exports.s3Service = new S3Service();
