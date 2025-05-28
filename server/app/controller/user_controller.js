const User = require("../model/User");
const crypto = require('crypto');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
});

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

exports.get_user = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user || user.status === "vanished" || user.status === "banned") return res.status(404).json({ message: "User not found" });
    if (user.profilePicture) {
        const profilePicture = await getSignedUrl(new GetObjectCommand({
            Bucket: bucketName,
            Key: user.profilePicture
        }), { expiresIn: 60 * 60 * 24 });
        user.profilePicture = profilePicture;
    }
    res.status(200).json(user);
}

exports.get_users = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find({
        status: { $nin: ["vanished", "banned"] }
    })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / parseInt(limit));
    for (const user of users) {
        if (user.profilePicture) {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: user.profilePicture
            });
            user.profilePicture = await getSignedUrl(s3, command, { expiresIn: 3600 });
        }
    }
    res.status(200).json({ users, totalPages, currentPage: parseInt(page), totalUsers });
}

exports.get_me = async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user || user.status === "vanished" || user.status === "banned") return res.status(404).json({ message: "User not found" });
    if (user.profilePicture) {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: user.profilePicture
        });
        user.profilePicture = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }
    res.status(200).json(user);
}

exports.edit_me = async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user || user.status === "vanished" || user.status === "banned") return res.status(404).json({ message: "User not found" });
    if (user.profilePicture) {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: user.profilePicture
        });
        user.profilePicture = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }
    res.status(200).json(user);
}

exports.edit_me = async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user || user.status === "vanished" || user.status === "banned") return res.status(404).json({ message: "User not found" });
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.profile.experience = parseInt(req.body.experience) || user.profile.experience;
    user.profile.city = req.body.city || user.profile.city;
    user.profile.bio = req.body.bio || user.profile.bio;

    let imageName = req.files?.profilePicture ? randomImageName() : user.profilePicture
    if (req.files?.profilePicture) {
        const params = {
            Bucket: bucketName,
            Key: imageName,
            Body: req.files.profilePicture[0].buffer,
            ContentType: req.files.profilePicture[0].mimetype,
        }
        const command = new PutObjectCommand(params)
        await s3.send(command);
    }

    user.profilePicture = imageName;

    if (req.body.socialMedias) {
        user.profile.socialMedias.push(req.body.socialMedias);
    }

    await user.save();
    if (user.profilePicture) {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: user.profilePicture
        });
        user.profilePicture = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }

    res.status(200).json(user);
}

exports.delete_me = async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user || user.status === "vanished" || user.status === "banned") return res.status(404).json({ message: "User not found" });
    await user.updateOne({ status: "vanished" });
    res.status(200).json({ message: "User deleted successfully" });
}

exports.change_status = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = req.body.status || user.status;
    await user.save();
    res.status(200).json(user);
}

exports.change_role = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user || user.status === "vanished" || user.status === "banned") return res.status(404).json({ message: "User not found" });
    user.role = req.body.role || user.role;
    await user.save();
    res.status(200).json(user);
}

exports.delete_user = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user || user.status === "vanished") return res.status(404).json({ message: "User not found" });
    await user.updateOne({ status: "vanished" });
    res.status(200).json({ message: "User deleted successfully" });
}
