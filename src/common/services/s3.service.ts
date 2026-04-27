import { CompleteMultipartUploadCommandOutput, DeleteObjectCommand, DeleteObjectsCommand, GetObjectAclCommandOutput, GetObjectCommand, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { AWS_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION, AWS_SECRET_KEY } from "../../config/config"
import { randomUUID } from "node:crypto"
import { storageApproachEnum, uploadApproachEnum } from "../enums/multer.enum"
import { createReadStream } from "node:fs"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export class S3Service {
    private client: S3Client

    constructor() {
        this.client = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY,
                secretAccessKey: AWS_SECRET_KEY
            }
        })
    }

    async uuploadFile({
        storageApproach = storageApproachEnum.Memory,
        Bucket = AWS_BUCKET_NAME,
        path = "general",
        file,
        ACL = ObjectCannedACL.private,
        ContentType
    }: {
        storageApproach?: storageApproachEnum,
        Bucket?: string,
        path?: string,
        file: Express.Multer.File,
        ACL?: ObjectCannedACL,
        ContentType?: string
    }) {
        const command = new PutObjectCommand({
            Bucket,
            Key: `Social/${path}/${randomUUID()}__${file.originalname}`,
            ACL,
            Body: storageApproach === storageApproachEnum.Memory ? file.buffer : createReadStream(file.path),
            ContentType: ContentType || file.mimetype
        })
        if (!command.input.Key) {
            throw new Error("File key is required");
        }
        await this.client.send(command);
        return command.input?.Key;
    }

    async uuploadLargeFile({
        storageApproach = storageApproachEnum.Disk,
        Bucket = AWS_BUCKET_NAME,
        path = "general",
        file,
        ACL = ObjectCannedACL.private,
        ContentType,
        partSize = 5
    }: {
        storageApproach?: storageApproachEnum,
        Bucket?: string,
        path?: string,
        file: Express.Multer.File,
        ACL?: ObjectCannedACL,
        ContentType?: string,
        partSize?: number
    }): Promise<CompleteMultipartUploadCommandOutput> {
        const uploudFile = new Upload({
            client: this.client,
            params: {
                Bucket,
                Key: `Social/${path}/${randomUUID()}__${file.originalname}`,
                ACL,
                Body: storageApproach === storageApproachEnum.Memory ? file.buffer : createReadStream(file.path),
                ContentType: ContentType || file.mimetype
            },
            partSize: partSize * 1024 * 1024,
        })

        uploudFile.on("httpUploadProgress", (progress) => {
            console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
        })
        return await uploudFile.done();
    }

    async uuploadFiles({
        storageApproach = storageApproachEnum.Memory,
        uploadApproach = uploadApproachEnum.Small,
        Bucket = process.env.AWS_BUCKET_NAME,
        path = "general",
        files,
        ACL = ObjectCannedACL.private
    }: {
        storageApproach?: storageApproachEnum,
        uploadApproach?: uploadApproachEnum,
        Bucket?: string,
        path?: string,
        files: Express.Multer.File[],
        ACL?: ObjectCannedACL
    }): Promise<string[]> {

        if (!Bucket) {
            throw new Error("Bucket is missing");
        }

        if (!files || files.length === 0) {
            throw new Error("No files provided");
        }

        let urls: string[] = [];

        if (uploadApproach === uploadApproachEnum.Small) {

            urls = await Promise.all(
                files.map((file) =>
                    this.uuploadFile({
                        storageApproach,
                        file,
                        ACL,
                        Bucket,
                        ContentType: file.mimetype,
                        path
                    })
                )
            );

        } else {

            const data = await Promise.all(
                files.map((file) =>
                    this.uuploadLargeFile({
                        storageApproach,
                        file,
                        ACL,
                        Bucket,
                        ContentType: file.mimetype,
                        path
                    })
                )
            );

            urls = data.map((res) => {
                if (!res?.Key) {
                    throw new Error("File key is missing in the upload response");
                }
                return res.Key;
            });
        }

        return urls;
    }

    async createPresignedUploadLink({
        Bucket = AWS_BUCKET_NAME,
        path = "general",
        ContentType,
        OriginalName
    }: {
        Bucket?: string,
        path?: string,
        ContentType?: string,
        OriginalName: string
    }): Promise<{ url: string, key: string }> {
        const command = new PutObjectCommand({
            Bucket,
            Key: `Social/${path}/${randomUUID()}__${OriginalName}`,
            ContentType: ContentType
        })

        if (!command.input.Key) {
            throw new Error("File key is required");
        }

        const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
        return { url, key: command.input.Key };
    }

    async getPresignedUploadLink({
        Bucket = AWS_BUCKET_NAME,
        Key,
        fileName,
        download
    }: {
        Bucket?: string,
        Key?: string,
        fileName?: string,
        download?: string
    }): Promise<string> {
        const command = new GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download === "true" ? `attachment; filename="${fileName || Key?.split("/").pop()}"` : undefined
        })

        const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
        return url;
    }

    async Get({
        Bucket = AWS_BUCKET_NAME,
        Key
    }: {
        Bucket?: string,
        Key: string,
    }) {
        const command = new GetObjectCommand({
            Bucket,
            Key
        })
        return await this.client.send(command);
    }

    async deleteFile({
        Bucket = AWS_BUCKET_NAME,
        Key
    }: {
        Bucket?: string,
        Key: string,
    }) {
        const command = new DeleteObjectCommand({
            Bucket,
            Key
        })
        return await this.client.send(command);
    }

        async deleteFiles({
        Bucket = AWS_BUCKET_NAME,
        Keys
    }: {
        Bucket?: string,
        Keys: {Key: string}[],
    }) {
        const command = new DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects: Keys,
                Quiet: true
            }
        })
        return await this.client.send(command);
    }

        async listFolderDir({
        Bucket = AWS_BUCKET_NAME,
        prefix
    }: {
        Bucket?: string,
        prefix: string,
    }) {
        const command = new ListObjectsV2Command({
            Bucket,
            Prefix: prefix
        })
        return await this.client.send(command);
    }

        async deleteFolderByPrefix({
        Bucket = AWS_BUCKET_NAME,
        prefix
    }: {
        Bucket?: string,
        prefix: string,
    }) {
        const result = await this.listFolderDir({ Bucket, prefix });
        if (result.Contents && result.Contents.length > 0) {
            const keysToDelete = result.Contents.map((item) => ({ Key: item.Key! }));
            await this.deleteFiles({ Bucket, Keys: keysToDelete });
        }
    }

}
export const s3Service = new S3Service();