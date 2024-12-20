import mongoose from "mongoose";

const repoSchema = new mongoose.Schema(
    {
        githubRepoId: {
            type: String,
            required: true,

        },
        integrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Integration' },
        orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
        name: String,
        description: String,
        url: String,
        language: String,
        defaultBranch: String,
        stars: Number,
        forks: Number,
        createdAt:Date,
        updatedAt:Date
    },
)

export const Repo = mongoose.model('Repo', repoSchema);