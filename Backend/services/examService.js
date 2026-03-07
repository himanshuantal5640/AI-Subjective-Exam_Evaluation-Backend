
const Exam = require("../models/Exam");

exports.createExam = async (data) => {
  return await Exam.create(data);
};

exports.getTeacherExams = async (teacherId) => {
  return await Exam.find({ teacherId });
};

exports.getExamById = async (id) => {
  return await Exam.findById(id);
};

exports.getAllExams = async () => {
  return await Exam.find({}); // Returns all exams
};
