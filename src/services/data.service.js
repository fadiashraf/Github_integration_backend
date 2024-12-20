import mongoose from 'mongoose';
import { config } from '../config/env.config.js';
import { ApiError } from '../helpers/ApiError.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { Commit } from '../models/commit.model.js';
import { Issue } from '../models/issue.model.js';
import { PullRequest } from '../models/pullRequest.model.js';
import { Repo } from '../models/repository.model.js';
import { BaseRepository } from '../repos/baseRepo.js';
import { User } from '../models/user.model.js';


class DataService {

    getCollections () {
        return [
            {
                title: "repositories",
                collectionName: "Repo",
                fields: Object.keys(Repo.schema.paths)
            },
            {
                title: "Commits",
                collectionName: "Commit",
                fields: Object.keys(Commit.schema.paths)
            },
            {
                title: "Pull Requests",
                collectionName: "pullRequest",
                fields: Object.keys(PullRequest.schema.paths)
            },
            {
                title: "issues",
                collectionName: "Issue",
                fields: Object.keys(Issue.schema.paths)
            },
            {
                title: "users",
                collectionName: "User",
                fields: Object.keys(User.schema.paths)
            },
        ]
    }


    async getCollectionData ({ collectionName, page = 1, pageSize = config.pageSize, search }) {
        return new BaseRepository(collectionName).getMany({ collectionName, page, pageSize, search })
    }

}

export const dataService = new DataService();
