const router = require("express").Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.use(auth, role(["admin"]));

router.get("/users", adminController.getUsers);
router.put("/users/:userId/role", adminController.updateRole);
router.put("/users/:userId/deactivate", adminController.deactivateUser);

router.get("/exams", adminController.getExams);
router.delete("/exams/:examId", adminController.deleteExam);

router.get("/audit-logs", adminController.getAuditLogs);

router.get("/system-analytics", adminController.getSystemAnalytics);

module.exports = router;
