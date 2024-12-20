import mongoose from "mongoose";

const commitSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
        },
        sha: {
            type: String,
            required: true,
            unique: true
        },

        authorName: {
            type: String,
            required: true,
        },
        authorEmail: {
            type: String,
            required: true,
        },
        authorDate: {
            type: Date,
            required: true,
        },

        committerName: {
            type: String,
            required: true,
        },
        committerEmail: {
            type: String,
            required: true,
        },
        committedDate: {
            type: Date,
            required: true,
        },
        tree: {
            type: Object,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repo' },
        orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
        integrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Integration' },


    },
    { timestamps: true }
)

export const Commit = mongoose.model('Commit', commitSchema);