"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepo = void 0;
const base_repo_1 = require("./base.repo");
class UserRepo extends base_repo_1.BaseRepo {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.UserRepo = UserRepo;
