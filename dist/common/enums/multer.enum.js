"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadApproachEnum = exports.storageApproachEnum = void 0;
var storageApproachEnum;
(function (storageApproachEnum) {
    storageApproachEnum[storageApproachEnum["Memory"] = 0] = "Memory";
    storageApproachEnum[storageApproachEnum["Disk"] = 1] = "Disk";
})(storageApproachEnum || (exports.storageApproachEnum = storageApproachEnum = {}));
var uploadApproachEnum;
(function (uploadApproachEnum) {
    uploadApproachEnum[uploadApproachEnum["Small"] = 0] = "Small";
    uploadApproachEnum[uploadApproachEnum["Large"] = 1] = "Large";
})(uploadApproachEnum || (exports.uploadApproachEnum = uploadApproachEnum = {}));
