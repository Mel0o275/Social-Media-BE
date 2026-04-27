"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepo = void 0;
const base_repo_1 = require("./base.repo");
class PostRepo extends base_repo_1.BaseRepo {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.PostRepo = PostRepo;
