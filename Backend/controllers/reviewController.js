const reviewService = require("../services/reviewService");

exports.getAnswersForReview = async (req, res) => {
  try {
    const answers =
      await reviewService.getAnswersByExam(
        req.params.examId
      );

    // Dynamically compute finalScore
    const formatted = answers.map(a => ({
      ...a.toObject(),
      finalScore: a.isOverridden
        ? a.teacherFinalScore
        : a.aiFinalScore
    }));

    res.json(formatted);

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.overrideAnswerScore = async (req, res) => {
  try {
    const { teacherFinalScore, teacherComment } = req.body;

    const updated =
      await reviewService.overrideScore(
        req.params.answerId,
        req.user.id, 
        teacherFinalScore,
        teacherComment
      );

    res.json(updated);

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


exports.getAuditLogs = async (req, res) => {
  try {
    const logs =
      await reviewService.getAuditLogsForAnswer(
        req.params.answerId
      );

    res.json(logs);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
