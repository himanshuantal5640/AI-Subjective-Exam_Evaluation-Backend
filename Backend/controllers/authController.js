
const authService = require("../services/authService");

//  REGISTER 
exports.register = async (req, res) => {
  try {
    await authService.registerUser(req.body);
    res.json({ message: "OTP sent for verification" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// VERIFY OTP 
exports.verifyOTP = async (req, res) => {
  try {
    await authService.verifyOTP(req.body);
    res.json({ message: "Account verified successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

//LOGIN
exports.login = async (req, res) => {
  try {
    const { token, role } =
      await authService.loginUser(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ role });

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// FORGOT PASSWORD 
exports.forgotPassword = async (req, res) => {
  try {
    await authService.sendResetOTP(req.body);
    res.json({ message: "Reset OTP sent" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// RESET PASSWORD 
exports.resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.body);
    res.json({ message: "Password reset successful" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

//  LOGOUT 
exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

exports.resendOTP = async (req, res) => {
  try {
    await authService.resendOTP(req.body);
    res.json({ message: "OTP resent successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
