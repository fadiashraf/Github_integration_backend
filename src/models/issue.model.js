import mongoose from "mongoose";

const issuesSchema = new mongoose.Schema(
    {
       issueId: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },

        state: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            required: true,
        },

        updatedAt: {
            type: Date,
            required: true,
        },

        closedAt: Date,
        authorLogin: {
            type: String,
            required: true,
        },
        labels: Array,
        repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repo' },
        orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
        integrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Integration' },
    }
)

export const Issue = mongoose.model('Issue', issuesSchema);