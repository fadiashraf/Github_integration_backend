import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    login: { type: String, required: true },
    githubId: { type: Number, required: true },
    nodeId: String,
    followersUrl: String,
    followingUrl: String,
    subscriptionsUrl: String,
    organizationsUrl:String,
    reposUrl:String,
    type: String,
    siteAdmin: Boolean,
    integrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Integration' },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, {
    timestamps: true
});



export const User = mongoose.model('User', userSchema);

