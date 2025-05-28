const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messagesSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User", // Kullanıcı tablosuna referans
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User", // Alıcı kullanıcıya referans
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000 // Mesaj uzunluğu kontrolü
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false // Soft delete (gerçekten silmek yerine işaretleme)
    },
    attachments: [{
        filename: { type: String, trim: true },
        mimetype: { type: String, trim: true },
    }]
}, { timestamps: true });

// Mesajları hızlandırmak için indeksleme
messagesSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model("Messages", messagesSchema);
