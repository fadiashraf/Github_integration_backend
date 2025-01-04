import mongoose from "mongoose";
import {
    getSortObject,
    getGlobalSearchFilter,
    getColumnFilters,
    combineFilters,
    mapFilter,
} from "../helpers/gridMongoose.js";



export class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    findOne (query) {
        return this.model.findOne(query);
    }

    findAll (query = {}, options = {}) {
        const { skip = 0, limit = 50, sort = {} } = options;
        return this.model.find(query).skip(skip).limit(limit).sort(sort);
    }

    findById (id, projection = {}, options = {}) {
        return this.model.findById(id, projection, options);
    }

    create (data) {
        return new this.model(data).save();
    }

    createMany (data) {
        return this.model.insertMany(data);
    }

    updateOne (query, data, options = { upsert: false }) {
        return this.model.findOneAndUpdate(query, data, { new: true, ...options });
    }

    findByIdAndUpdate (id, data, options = { upsert: false }) {
        return this.model.findByIdAndUpdate(id, data, { new: true, ...options });
    }

    updateMany (query, data) {
        return this.model.updateMany(query, data);
    }

    deleteOne (query) {
        return this.model.deleteOne(query);
    }

    deleteMany (query) {
        return this.model.deleteMany(query);
    }

    count (query = {}) {
        return this.model.countDocuments(query);
    }

    async findByCollectionNamePaginated ({
        startRow = 0,
        endRow = 100,
        sortModel = [],
        filterModel = {},
        search = '',
    }) {
        this.model = mongoose.model(this.model);

        const sortObj = getSortObject(sortModel);
        const globalSearchFilter = getGlobalSearchFilter(this.model, search);
        const columnFilters = getColumnFilters(filterModel, mapFilter);
        const filter = combineFilters(globalSearchFilter, columnFilters);

        const mongooseQuery = this.model.find(filter).skip(startRow).limit(endRow - startRow);

        if (Object.keys(sortObj).length > 0) {
            mongooseQuery.sort(sortObj);
        }

        const [rows, totalCount] = await Promise.all([
            mongooseQuery.exec(),
            this.model.countDocuments(filter),
        ]);

        return { rows, lastRowIndex: totalCount, totalCount };
    }
}