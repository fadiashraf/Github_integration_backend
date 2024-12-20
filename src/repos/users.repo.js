import { User } from "../models/user.model.js";
import { BaseRepository } from "./baseRepo.js";




class UsersRepo extends BaseRepository {
    constructor() {
        super(User)
    }

    bulkWriteUpsert (data) {
        return this.model.bulkWrite(
            data.map((item) =>
            ({
                updateOne: {
                    filter: { githubId: item.githubId },
                    update: { $set: item },
                    upsert: true
                }
            })
            )
        )

    }
}


export const usersRepo = new UsersRepo();