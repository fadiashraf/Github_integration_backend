import { Commit } from "../models/commit.model.js";
import { BaseRepository } from "./baseRepo.js";



class CommitsRepo extends BaseRepository {
    constructor() {
        super(Commit)
    }

    bulkWriteUpsert (data) {
        return this.model.bulkWrite(
            data.map((item) =>
            ({
                updateOne: {
                    filter: { sha: item.sha },
                    update: { $set: item },
                    upsert: true
                }
            })
            )
        )

    }

}


export const commitsRepo = new CommitsRepo();