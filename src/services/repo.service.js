import { reposRepo } from '../repos/repos.repo.js';


class RepoService {

    async getReposWithDetails ({  startRow, endRow, sortModel, filterModel, search }) {
        return reposRepo.getRepoWithDetails({  startRow, endRow, sortModel, filterModel, search })
    }

}

export const repoService = new RepoService();
