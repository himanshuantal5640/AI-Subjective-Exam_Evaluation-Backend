const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getStudents,

} = require("../controllers/userController");
const role = require("../middleware/roleMiddleware")
const auth = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.get("/me", auth, getProfile);

router.put("/update", auth, updateProfile);
router.get("/students",auth,role(["teacher","admin"]),getStudents);

router.post("/upload-image", auth, upload.single("image"), uploadProfileImage);

module.exports = router;
