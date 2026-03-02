const express = require("express");
const router = express.Router();
const c = require("../controllers/answerController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const Answer = require("../models/Answer");


router.post("/submit", auth, role(["student"]), c.submitAnswer);


router.get("/:examId", auth, role(["student"]), c.getMyAnswers);
router.get("/my-results", auth, async (req, res) => {
  const answers = await Answer.find({
    studentId: req.user.id,
  });

  res.json(answers);
});

module.exports = router;
