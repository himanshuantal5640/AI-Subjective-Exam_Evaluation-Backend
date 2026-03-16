const express = require("express");
const router = express.Router();
const c = require("../controllers/attendanceController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Teacher routes
router.get("/exam/:examId", auth, role(["teacher"]), c.getExamAttendance);
router.post("/mark", auth, role(["teacher"]), c.markAttendance);

// Student routes
router.get("/my-attendance", auth, role(["student"]), c.getMyAttendance);

module.exports = router;
