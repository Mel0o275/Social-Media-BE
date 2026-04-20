"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileFilter = exports.fieldValidation = void 0;
exports.fieldValidation = {
    image: ["image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    ],
    video: ["video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-ms-wmv"
    ]
};
const fileFilter = (validation) => {
    return (req, file, callback) => {
        if (validation.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new Error("Invalid file type. Only images and videos are allowed."));
        }
    };
};
exports.fileFilter = fileFilter;
