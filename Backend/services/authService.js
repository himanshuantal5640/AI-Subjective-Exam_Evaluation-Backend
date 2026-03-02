
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../config/mailer");

const ADMIN_EMAIL = "himanshuantal26@gmail.com";


exports.registerUser = async ({ name, email, password, role }) => {

 
  if (role === "admin")
    throw new Error("Admin registration is not allowed");

  const existing = await User.findOne({ email });
  if (existing)
    throw new Error("User already exists");
  
  validatePassword(password);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    isVerified: false,
    isActive: true
  });

  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 min

  await user.save();

  await sendOTPEmail(email, otp);

  return true;
};


exports.verifyOTP = async ({ email, otp }) => {

  const user = await User.findOne({ email });
  if (!user)
    throw new Error("User not found");

  if (user.isVerified)
    throw new Error("Account already verified");

  if (!user.otp || !user.otpExpiresAt)
    throw new Error("No OTP found");

  
  if (user.otpExpiresAt < Date.now())
    throw new Error("OTP expired");

  
  if (user.otp !== otp) {

    user.otpAttempts += 1;
    await user.save();

    if (user.otpAttempts >= 5)
      throw new Error("Too many invalid attempts. Please resend OTP.");

    throw new Error("Invalid OTP");
  }

 
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  user.otpAttempts = 0;

  await user.save();

  return true;
};


exports.loginUser = async ({ email, password }) => {

  const user = await User.findOne({ email });
  if (!user)
    throw new Error("User not found");

  if (!user.isActive)
    throw new Error("Account deactivated");

  if (!user.isVerified)
    throw new Error("Account not verified");

  
  if (user.role === "admin" && user.email !== ADMIN_EMAIL)
    throw new Error("Unauthorized admin");

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, role: user.role };
};


exports.sendResetOTP = async ({ email }) => {

  const user = await User.findOne({ email });
  if (!user)
    throw new Error("User not found");

 
  if (user.role === "admin" && user.email !== ADMIN_EMAIL)
    throw new Error("Unauthorized admin reset");

  const otp = Math.floor(100000 + 900000 * Math.random()).toString();

  user.otp = otp;
  user.otpExpiresAt = Date.now() + 10 * 60 * 1000;

  await user.save();

  await sendOTPEmail(email, otp);

  return true;
};


exports.resetPassword = async ({ email, otp, newPassword }) => {

  const user = await User.findOne({ email });
  if (!user)
    throw new Error("User not found");

  if (user.role === "admin" && user.email !== ADMIN_EMAIL)
    throw new Error("Unauthorized admin reset");

  if (
    user.otp !== otp ||
    user.otpExpiresAt < Date.now()
  )
    throw new Error("Invalid or expired OTP");


  validatePassword(newPassword);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpiresAt = undefined;

  await user.save();

  return true;
};

exports.resendOTP = async ({ email }) => {

  const user = await User.findOne({ email });
  if (!user)
    throw new Error("User not found");

  if (user.isVerified)
    throw new Error("Account already verified");


  if (
    user.otpLastSentAt &&
    Date.now() - user.otpLastSentAt < 60 * 1000
  )
    throw new Error("Please wait before requesting again");

  const otp = Math.floor(100000 + 900000 * Math.random()).toString();

  user.otp = otp;
  user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
  user.otpLastSentAt = Date.now();
  user.otpResendCount += 1;

  await user.save();

  await sendOTPEmail(email, otp);

  return true;
};


const validatePassword = (password) => {

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!strongPasswordRegex.test(password)) {
    throw new Error(
      "Password must be 8+ chars, include uppercase, lowercase, number & special character"
    );
  }
};
