const express = require("express");
const { get_me, get_users, get_user, edit_me, delete_me, change_status, change_role, delete_user } = require("../controller/user_controller");
const auth_token = require("../middleware/auth_token");
const is_admin = require("../middleware/is_admin");

const multer = require("multer");
const upload = multer();

const router = express.Router();

router.get("/get-me", auth_token, get_me);
router.get("/get-users", get_users);
router.get("/get-user/:id", get_user);
router.put("/edit-me", auth_token, upload.fields([{ name: "profilePicture", maxCount: 1 }]), edit_me);
router.delete("/delete-me", auth_token, delete_me);
router.delete("/delete-user/:id", auth_token, is_admin, delete_user);
router.patch("/change-status/:id", auth_token, is_admin, upload.none(), change_status);
router.patch("/change-role/:id", auth_token, is_admin, upload.none(), change_role);

module.exports = router;
