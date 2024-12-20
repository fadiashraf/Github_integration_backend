import { Repo } from "../models/repository.model.js";
import { BaseRepository } from "./baseRepo.js";




class ReposRepo extends BaseRepository {
    constructor() {
        super(Repo)
    }

    bulkWriteUpsert (data) {
        return this.model.bulkWrite(
            data.map((item) =>
            ({
                updateOne: {
                    filter: { githubRepoId: item.githubRepoId },
                    update: { $set: item },
                    upsert: true
                }
            })
            )
        )

    }
}


export const reposRepo = new ReposRepo();