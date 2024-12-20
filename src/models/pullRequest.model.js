import mongoose from "mongoose";

const pullRequestSchema = new mongoose.Schema(
    {
        pullReqGithubId: {
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
        mergedAt: Date,

        merge_commit_sha: String,
        authorLogin: {
            type: String,
            required: true,
        },
        assignees: [String],
        repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repo' },
        orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
        integrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Integration' },


    }
)

export const PullRequest = mongoose.model('pullRequest', pullRequestSchema);