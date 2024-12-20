import { Integration } from "../models/integration.model.js"
import { BaseRepository } from "./baseRepo.js";


class IntegrationRepo extends BaseRepository {
    constructor() {
        super(Integration)
    }
  

}


export const integrationRepo = new IntegrationRepo();