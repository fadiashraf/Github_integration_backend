import { Repo } from "../models/repository.model.js";
import { BaseRepository } from "./baseRepo.js";

import {
    getSortObject,
    getGlobalSearchFilter,
    getColumnFilters,
    combineFilters,
    mapFilter,
} from "../helpers/gridMongoose.js";




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


    async getRepoWithDetails ({
        startRow = 0,
        endRow = 100,
        sortModel = [],
        filterModel = {},
        search = ''
    }) {
        const sortObj = getSortObject(sortModel);
        const globalSearchFilter = getGlobalSearchFilter(this.model, search);
        const columnFilters = getColumnFilters(filterModel, mapFilter);
        const filter = combineFilters(globalSearchFilter, columnFilters);

        const mongooseQuery = this.model.aggregate([
            { $match: { ...filter } },
            {
                $facet: {
                    repos: [
                        { $skip: startRow },
                        { $limit: endRow - startRow },
                        { $sort: sortObj },
                        {
                            $lookup: {
                                from: 'commits',
                                as: 'commits',
                                let: { repoId: '$_id' },
                                pipeline: [
                                    { $match: { $expr: { $eq: ['$repoId', '$$repoId'] } } },
                                    { $count: 'count' }
                                ]
                            }
                        },
                        {
                            $lookup: {
                                from: 'pullrequests',
                                as: 'pullRequests',
                                let: { repoId: '$_id' },
                                pipeline: [
                                    { $match: { $expr: { $eq: ['$repoId', '$$repoId'] } } },
                                    { $count: 'count' }
                                ]
                            }
                        },
                        {
                            $lookup: {
                                from: 'issues',
                                as: 'issues',
                                let: { repoId: '$_id' },
                                pipeline: [
                                    { $match: { $expr: { $eq: ['$repoId', '$$repoId'] } } },
                                    { $count: 'count' }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                commitCount: {
                                    $ifNull: [{ $arrayElemAt: ['$commits.count', 0] }, 0]
                                },
                                pullRequestCount: {
                                    $ifNull: [{ $arrayElemAt: ['$pullRequests.count', 0] }, 0]
                                },
                                issueCount: {
                                    $ifNull: [{ $arrayElemAt: ['$issues.count', 0] }, 0]
                                }
                            }
                        },
                        { $project: { commits: 0, pullRequests: 0, issues: 0 } }
                    ]
                }
            },
            {
                $project: {
                    repos: 1
                }
            }
        ])

        const [data, totalCount] = await Promise.all([
            mongooseQuery.exec(),
            this.model.countDocuments(filter),
        ]);
        return { rows: data[0]?.repos || [], lastRowIndex: totalCount }
    }
}


export const reposRepo = new ReposRepo();