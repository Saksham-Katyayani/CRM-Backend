const express = require('express');
const router = express.Router();
const { verifyToken,restrictTo } = require('../middlewares/authMiddleware');
const { signup, login, updateAgent,forgotPasswordController,resetPasswordController , verifyOtpController,logout, refreshToken, getAllAgents} = require('../controllers/authController');

// Define your API routes
router.post('/signup',verifyToken ,restrictTo(['Super Admin', 'Admin']),signup);


//login route
router.post('/login', login);

// Forgot Password route
router.post('/forgot-password', forgotPasswordController);

// Verify OTP route
router.post('/verify-otp', verifyOtpController);

// Reset Password route
router.post('/reset-password', resetPasswordController);

//Logout Route
router.post('/logout', logout);

//getAll agents
router.get('/getAgents', getAllAgents);

// Token refresh route
router.post("/refresh-token", refreshToken);

//update
router.put('/updateAgent/:agentId', updateAgent);


module.exports = router;
