import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        githubOrgId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: String,
        avatarUrl: String,
        url: {
            type: String,
            required: true,
        },
        integrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Integration' }

    },
    { timestamps: true }
)

export const Organization = mongoose.model('Organization', organizationSchema);