const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true
  },

  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true
  },

  answerText: {
    type: String,
    required: true
  },

  //RULE-BASED
  coveredConcepts: [String],
  missingConcepts: [String],
  coverageScore: Number,
  rubricScore: Number,
  qualityScore: Number,
  aiFinalScore: Number, 

  aiSemanticScore: Number,
  aiSemanticFeedback: String,

  
  hybridFinalScore: Number,

  
  teacherFinalScore: Number,
  isOverridden: {
    type: Boolean,
    default: false
  },
  teacherComment: String,

  confidenceLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low"
  },

  feedback: String,
  aiConfidence: String,


}, { timestamps: true });

module.exports = mongoose.model("Answer", answerSchema);
