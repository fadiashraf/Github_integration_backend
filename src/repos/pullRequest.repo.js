import { PullRequest } from "../models/pullRequest.model.js";
import { BaseRepository } from "./baseRepo.js";




class PullRequestRepo extends BaseRepository {
    constructor() {
        super(PullRequest)
    }

    bulkWriteUpsert (data) {
        return this.model.bulkWrite(
            data.map((item) =>
            ({
                updateOne: {
                    filter: { pullReqGithubId: item.pullReqGithubId },
                    update: { $set: item },
                    upsert: true
                }
            })
            )
        )

    }
}


export const pullRequestRepo = new PullRequestRepo();