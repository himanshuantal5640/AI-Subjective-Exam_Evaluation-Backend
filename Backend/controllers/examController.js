const examService = require("../services/examService");

exports.createExam = async (req, res) => {
  try {
    const exam = await examService.createExam({
      title: req.body.title,
      subject: req.body.subject,
      teacherId: req.user.id
    });

    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMyExams = async (req, res) => {
  try {
    const exams = await examService.getTeacherExams(req.user.id);
    res.json(exams);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.toggleExamStatus = async (req, res) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    if (!exam || exam.teacherId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Exam not found or unauthorized" });
    }

    exam.status = exam.status === "active" ? "completed" : "active";
    await exam.save();

    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAvailableExams = async (req, res) => {
  try {
    const exams = await examService.getAllExams();
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// exports.getTeacherExams = async (req, res) => {
//   try {
//     const exams = await Exam.find({
//       createdBy: req.user._id   // or teacherId depending on your model
//     });

//     res.json(exams);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };