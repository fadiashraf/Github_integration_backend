import mongoose from "mongoose";

const IntegrationSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true
        },
        accessToken: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        isActive: { type: Boolean, default: true },
        integrationDate: { type: Date, default: Date.now },
        lastSyncAt: Date,
        isSyncLoading: { type: Boolean, default: false },
        scope: [String],

    },
    { timestamps: true }
)

export const Integration = mongoose.model('Integration', IntegrationSchema);

