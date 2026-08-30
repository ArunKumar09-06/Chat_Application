const express = require("express");

const {
    handleUserRegistration,
     handleUserLogin,
     handleLogout,
     handleProfilePicture,
     handleGetCurrentUser,
     handleGetAllUsers
} = require("../controllers/auth.controller");

const { authenticateUser } = require("../middlewares/auth");
const upload = require("../middlewares/multer.js")
const router = express.Router();

router.get("/me", authenticateUser, handleGetCurrentUser);
router.get("/users", authenticateUser, handleGetAllUsers);
router.post("/register", handleUserRegistration);
router.post("/login", handleUserLogin);
router.post("/logout", authenticateUser, handleLogout);
router.patch("/profile-picture",
             authenticateUser,
             upload.single("profilePicture"),
             handleProfilePicture
);


module.exports = router;