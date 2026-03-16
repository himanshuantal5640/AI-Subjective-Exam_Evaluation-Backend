const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const User = require("../models/User");

// Teacher: Get attendance for a specific exam
exports.getExamAttendance = async (req, res) => {
  try {
    const { examId } = req.params;
    
    // Find all students
    const students = await User.find({ role: "student" }).select("name email");
    
    // Find attendance records for this exam
    const attendanceRecords = await Attendance.find({ examId });
    
    // Combine the data so we have a list of all students and their attendance status
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId.toString()] = record;
    });
    
    const result = students.map(student => {
      const record = attendanceMap[student._id.toString()];
      return {
        student,
        status: record ? record.status : "absent",
        recordId: record ? record._id : null
      };
    });
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher: Mark or update student attendance
exports.markAttendance = async (req, res) => {
  try {
    const { examId, studentId, status } = req.body;
    
    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'present' or 'absent'" });
    }
    
    const record = await Attendance.findOneAndUpdate(
      { examId, studentId },
      { status },
      { upsert: true, new: true }
    );
    
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student: Get my attendance across all exams
exports.getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    
    // Get all exams to see which ones the student missed
    const allExams = await Exam.find().select("title subject");
    
    // Get the student's attendance records
    const myRecords = await Attendance.find({ studentId }).populate("examId", "title subject");
    
    const recordsMap = {};
    myRecords.forEach(record => {
      if (record.examId) {
        recordsMap[record.examId._id.toString()] = record.status;
      }
    });
    
    const result = allExams.map(exam => ({
      exam,
      status: recordsMap[exam._id.toString()] || "absent"
    }));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
