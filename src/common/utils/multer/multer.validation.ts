import { FileFilterCallback } from "multer";

export const fieldValidation = {
    image : ["image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    ],
    video : ["video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-ms-wmv"
    ]
}
export const fileFilter = (validation : string[]) => {
    return (req: Express.Request, file: Express.Multer.File, callback: FileFilterCallback) => {
        if (validation.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error("Invalid file type. Only images and videos are allowed."));
        }
    }
}