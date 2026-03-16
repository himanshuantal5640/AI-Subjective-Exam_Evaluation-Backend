const User = require("../models/User");
const Exam = require("../models/Exam");
const AuditLog = require("../models/AuditLog");
const Answer = require("../models/Answer");

exports.getAllUsers = async () => {
  const users = await User.find().select("-password");
  
  const usersWithStats = await Promise.all(users.map(async (user) => {
    const userObj = user.toObject();
    
    if (user.role === 'teacher') {
      userObj.generatedExams = await Exam.countDocuments({ teacherId: user._id });
    } else if (user.role === 'student') {
      const answers = await Answer.find({ studentId: user._id });
      
      const uniqueExams = new Set();
      let totalScore = 0;
      let scoredAnswersCount = 0;
      
      answers.forEach(ans => {
        if (ans.examId) uniqueExams.add(ans.examId.toString());
        const score = ans.hybridFinalScore || ans.teacherFinalScore || ans.aiFinalScore || ans.score;
        if (score !== undefined && score !== null) {
          totalScore += score;
          scoredAnswersCount++;
        }
      });
      
      userObj.examsTaken = uniqueExams.size;
      userObj.avgScore = scoredAnswersCount > 0 ? Math.round(totalScore / scoredAnswersCount) : 0;
    }
    
    return userObj;
  }));
  
  return usersWithStats;
};

exports.updateUserRole = async (userId, role) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.role = role;
  await user.save();

  return user;
};

exports.deactivateUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.isActive = false;
  await user.save();

  return user;
};

exports.getAllExams = async () => {
  return await Exam.find().populate("teacherId", "name email");
};

exports.deleteExam = async (examId) => {
  return await Exam.findByIdAndDelete(examId);
};

exports.getAllAuditLogs = async () => {
  return await AuditLog.find()
    .populate("teacherId", "name email")
    .populate("answerId");
};

exports.getSystemAnalytics = async () => {
  const totalUsers = await User.countDocuments();
  const totalExams = await Exam.countDocuments();
  const activeExams = await Exam.countDocuments({ status: "active" });
  const totalAnswers = await Answer.countDocuments();

  return {
    totalUsers,
    totalExams,
    activeExams,
    totalAnswers
  };
};
