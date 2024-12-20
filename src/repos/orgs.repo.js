import { Organization } from "../models/organization.model.js";
import { BaseRepository } from "./baseRepo.js";




class OrgsRepo extends BaseRepository {
    constructor() {
        super(Organization)
    }

    bulkWriteUpsert (data) {
        return this.model.bulkWrite(
            data.map((item) =>
            ({
                updateOne: {
                    filter: { githubOrgId: item.githubOrgId },
                    update: { $set: item },
                    upsert: true
                }
            })
            )
        )

    }
}


export const orgsRepo = new OrgsRepo();