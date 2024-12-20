import mongoose from "mongoose";

export class BaseRepository {

    constructor(model) {
        this.model = model;
    }

    findOne (query) {
        return this.model.findOne(query)
    }

    async findAll (query = {}, options = {}) {
        const { skip = 0, limit = 50, sort = {} } = options;
        return this.model.find(query).skip(skip).limit(limit).sort(sort);
    }
    async findById (id, projection = {}, options = {}) {
        return this.model.findById(id, projection, options);
    }

    async create (data) {
        const entity = new this.model(data);
        return entity.save();
    }
    async createMany (data) {
        return this.model.insertMany(data)
    }

    async updateOne (query, data, options = { upsert: false }) {
        return this.model.findOneAndUpdate(query, data, { new: true, ...options });
    }


    async findByIdAndUpdate (id, data, options = { upsert: false }) {
        return this.model.findByIdAndUpdate(id, data, { new: true, ...options });
    }

    async updateMany (query, data) {
        return this.model.updateMany(query, data);
    }

    async deleteOne (query) {
        return this.model.deleteOne(query);
    }


    async deleteMany (query) {
        return this.model.deleteMany(query);
    }

    async count (query = {}) {
        return this.model.countDocuments(query);
    }

    async getMany ({ collectionName, search, page, pageSize }) {
        this.model = mongoose.model(collectionName);


        let query = {};

        if (search) {
            const fields = Object.keys(this.model.schema.paths).filter(
                (path) => this.model.schema.paths[path].instance === 'String'
            );
            query = {
                $or: fields.map((field) => ({
                    [field]: { $regex: search, $options: 'i' },
                })),
            };
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
        const limit = parseInt(pageSize, 10);

        const [total, data] = await Promise.all([
            this.count(query),
            this.findAll(query, { skip, limit }),
        ]);
        return {
            data,
            totalCount: total,
            page: parseInt(page, 10),
            pageSize: limit,
            totalPages: Math.ceil(total / limit),
        }
    }

}


