const service = require("../services/answerService");
const Question = require("../models/Question");
const evaluationService = require("../services/evaluationService");
const { evaluateWithAI } = require("../config/openRouter");
const Answer = require("../models/Answer");
exports.submitAnswer = async (req, res) => {

  try {

    const { examId, questionId, answerText } = req.body;

    if (!examId || !questionId || !answerText)
      return res.status(400).json({
        message: "All fields required"
      });

    if (answerText.trim().length < 10)
      return res.status(400).json({
        message: "Answer too short"
      });

    const question = await Question.findById(questionId);
    if (!question)
      return res.status(404).json({
        message: "Question not found"
      });

    
    const existingAnswer = await Answer.findOne({
      studentId: req.user.id,
      questionId
    });

    if (existingAnswer)
      return res.status(400).json({
        message: "Answer already submitted"
      });


    const coverage =
      evaluationService.analyzeConceptCoverage(
        answerText,
        question.concepts
      );

    const rubricScore =
      evaluationService.calculateRubricScore(
        answerText,
        question.rubric
      );

    const qualityScore =
      evaluationService.calculateQualityScore(answerText);

    const ruleFinalScore =
      evaluationService.calculateFinalScore(
        rubricScore,
        coverage.coverageScore,
        qualityScore
      );

  
    let aiScore = 0;
    let aiFeedback = "AI evaluation unavailable";
    let aiConfidence = "Low";

    try {

      const aiResult = await evaluateWithAI(
        question.text,
        question.rubric,
        answerText,
        question.totalMarks
      );

      aiScore = Math.min(
        Math.max(aiResult.score, 0),
        question.totalMarks
      );

      aiFeedback = aiResult.feedback;
      aiConfidence = aiResult.confidence;

    } catch (error) {
      console.error("AI Error:", error.message);
    }

    const hybridFinalScore = Math.min(
      Math.round((ruleFinalScore * 0.4) +
                 (aiScore * 0.6)),
      question.totalMarks
    );

    const answer = await Answer.create({
      studentId: req.user.id,
      examId,
      questionId,
      answerText,

      coveredConcepts: coverage.coveredConcepts,
      missingConcepts: coverage.missingConcepts,
      coverageScore: coverage.coverageScore,

      rubricScore,
      qualityScore,
      aiFinalScore: ruleFinalScore,

      aiSemanticScore: aiScore,
      aiSemanticFeedback: aiFeedback,
      aiConfidence,

      hybridFinalScore,
      teacherFinalScore: hybridFinalScore,
      isOverridden: false
    });

    res.status(201).json(answer);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.getMyAnswers = async (req, res) => {
  const answers = await service.getAnswersByExam(
    req.params.examId,
    req.user.id
  );

  res.json(answers);
};
