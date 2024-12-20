import {Issue} from "../models/issue.model.js";
import { BaseRepository } from "./baseRepo.js";




class IssuesRepo extends BaseRepository {
    constructor() {
        super(Issue)
    }

    bulkWriteUpsert (data) {
        return this.model.bulkWrite(
            data.map((item) =>
            ({
                updateOne: {
                    filter: { issueId: item.issueId },
                    update: { $set: item },
                    upsert: true
                }
            })
            )
        )

    }
}


export const issuesRepo = new IssuesRepo();