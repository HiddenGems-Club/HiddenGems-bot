const {Schema, model} = require("mongoose");

const schema_location = new Schema({
    postId: { type: String, required: true, unique: true },
    threadId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    posterId: { type: String, required: true },
    tags: [{ type: String }],
    googleMapsLink: { type: String, default: null },
    images: [
        {
            originalUrl: { type: String },
            compressedData: { type: Buffer },
            mimeType: { type: String },
        },
    ],
    forumChannelId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = model("location", schema_location);