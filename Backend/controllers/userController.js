const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    await user.save();

    res.json({ message: "Profile updated" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      req.file.path
    );

    const user = await User.findById(req.user.id);
    user.profileImage = result.secure_url;
    await user.save();

    res.json({ image: result.secure_url });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudents = async (req, res) => {
  try {

    const students = await User.find({
      role: "student",
      isActive: true
    }).select("-password");

    res.json(students);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};