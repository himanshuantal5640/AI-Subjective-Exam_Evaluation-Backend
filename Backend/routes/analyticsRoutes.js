const router = require("express").Router();
const analyticsController = require("../controllers/analyticsController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");


router.get("/student",auth,role(["student"]),analyticsController.getMyAnalytics);

router.get("/teacher/:examId",auth,role(["teacher"]),analyticsController.getTeacherAnalytics);

module.exports = router;
