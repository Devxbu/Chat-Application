const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Geçerli e-posta formatı
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9_]+$/ // Kullanıcı adı yalnızca harf, rakam ve alt çizgi içermeli
    },
    password: { type: String, required: true, trim: true },
    phone: {
        type: String,
        trim: true,
        match: /^\d{10,15}$/ // 10-15 haneli telefon numarası
    },
    profilePicture: { type: String, default: "" },
    role: {
        type: String,
        enum: ["user", "admin", "oro"], // Oro: Omnipotent Regulatory Overseer
        default: "user"
    },
    bio: { type: String, default: "", trim: true },
    refreshToken: { type: String },
    status: {
        type: String,
        enum: ["online", "offline", "banned", "vanished"],
        default: "offline"
    }
}, { timestamps: true });

userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found");
    if (user.status === "banned") throw new Error("User is banned");
    if (user.status === "vanished") throw new Error("User is vanished");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Wrong password");
    return user;
}

module.exports = mongoose.model("User", userSchema);
