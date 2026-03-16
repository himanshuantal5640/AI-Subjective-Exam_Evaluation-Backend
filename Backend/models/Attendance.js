const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ["present", "absent"],
    default: "present"
  }
}, { timestamps: true });

// Ensure a student has only one attendance record per exam
attendanceSchema.index({ studentId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
