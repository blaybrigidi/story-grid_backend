/** @format */
import userService from '../services/userService.js';

/**
 * Controller for user signup
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const signup = async (req) => {
  try {
    const userData = req.body.data;
    
    // Validate required fields
    if (!userData.email || !userData.password) {
      return {
        status: 400,
        msg: "Email and password are required",
        data: null
      };
    }
    
    const result = await userService.register(userData);
    
    return {
      status: result.status || 200,
      msg: result.msg || "User registered successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      status: 500,
      msg: "Internal Server Error",
      data: null
    };
  }
};

/**
 * Controller for user login request
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const requestLogin = async (req) => {
  try {
    const { email, password } = req.body.data;
    
    // Validate required fields
    if (!email || !password) {
      return {
        status: 400,
        msg: "Email and password are required",
        data: null
      };
    }
    
    // Call the userService to handle the login request
    const result = await userService.requestLogin(email, password);
    
    // Return the result in the specified format
    return {
      status: result.status,
      msg: result.msg,
      data: result.data,
      meta: result.meta
    };
  } catch (error) {
    console.error("Login request error:", error);
    return {
      status: 500,
      msg: "Internal Server Error",
      data: null
    };
  }
};

/**
 * Controller for verifying OTP and completing login
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const verifyLogin = async (req) => {
  try {
    const { email, otp } = req.body.data;
    
    // Validate required fields
    if (!email || !otp) {
      return {
        status: 400,
        msg: "Email and OTP are required",
        data: null
      };
    }
    
    // Call the userService to handle the OTP verification
    const result = await userService.verifyLogin(email, otp);
    
    // Return the result in the specified format
    return {
      status: result.status,
      msg: result.msg,
      data: result.data,
      meta: result.meta
    };
  } catch (error) {
    console.error("Login verification error:", error);
    return {
      status: 500,
      msg: "Internal Server Error",
      data: null
    };
  }
};

/**
 * Controller for getting user profile
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const getProfile = async (req) => {
  try {
    const userId = req.user.id;
    
    // Call the userService to get the user profile
    const result = await userService.getProfile(userId);
    
    // Return the result in the specified format
    return {
      status: result.status,
      msg: result.msg,
      data: result.data
    };
  } catch (error) {
    console.error("Get profile error:", error);
    return {
      status: 500,
      msg: "Internal Server Error",
      data: null
    };
  }
};

/**
 * Controller for updating user profile
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const updateProfile = async (req) => {
  try {
    const userId = req.user.id;
    const updateData = req.body.data;
    
    // Call the userService to update the user profile
    const result = await userService.updateProfile(userId, updateData);
    
    // Return the result in the specified format
    return {
      status: result.status,
      msg: result.msg,
      data: result.data
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      status: 500,
      msg: "Internal Server Error",
      data: null
    };
  }
};

/**
 * Controller for changing user password
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const changePassword = async (req) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body.data;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return {
        status: 400,
        msg: "Current password and new password are required",
        data: null
      };
    }
    
    // Call the userService to change the password
    const result = await userService.changePassword(userId, currentPassword, newPassword);
    
    // Return the result in the specified format
    return {
      status: result.status,
      msg: result.msg,
      data: result.data
    };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      status: 500,
      msg: "Internal Server Error",
      data: null
    };
  }
};
