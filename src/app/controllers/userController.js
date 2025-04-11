import userService from '../services/userService.js';

/**
 * Controller for user signup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Response object with status, message, and data
 */
export const signup = async (req, res, next) => {
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
    
    // Call the userService to handle the registration
    const result = await userService.register(userData);
    
    // Return the result in the specified format
    return {
      status: result.status || 200,
      msg: result.msg || "User registered successfully",
      data: result.data,
      meta: result.meta
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
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Response object with status, message, and data
 */
export const requestLogin = async (req, res, next) => {
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
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Response object with status, message, and data
 */
export const verifyLogin = async (req, res, next) => {
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
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Response object with status, message, and data
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in the request
    
    // Call the userService to get the user profile
    const result = await userService.getProfile(userId);
    
    // Return the result in the specified format
    return {
      status: 200,
      msg: "Profile retrieved successfully",
      data: result,
      meta: null
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
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Response object with status, message, and data
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in the request
    const updateData = req.body.data;
    
    // Call the userService to update the user profile
    const result = await userService.updateProfile(userId, updateData);
    
    // Return the result in the specified format
    return {
      status: 200,
      msg: "Profile updated successfully",
      data: result,
      meta: null
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
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Response object with status, message, and data
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in the request
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
      status: 200,
      msg: "Password changed successfully",
      data: result,
      meta: null
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

/**
 * Controller for submitting KYC information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Response object with status, message, and data
 */
export const submitKYC = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in the request
    const kycData = req.body.data;
    
    // Call the userService to submit KYC information
    const result = await userService.submitKYC(userId, kycData);
    
    // Return the result in the specified format
    return {
      status: 200,
      msg: "KYC information submitted successfully",
      data: result,
      meta: null
    };
  } catch (error) {
    console.error("Submit KYC error:", error);
    return {
      status: 500,
      msg: "Internal Server Error",
      data: null
    };
  }
};

/**
 * Controller for getting KYC status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Response object with status, message, and data
 */
export const getKYCStatus = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in the request
    
    // Call the userService to get KYC status
    const result = await userService.getKYCStatus(userId);
    
    // Return the result in the specified format
    return {
      status: 200,
      msg: "KYC status retrieved successfully",
      data: result,
      meta: null
    };
  } catch (error) {
    console.error("Get KYC status error:", error);
    return {
      status: 500,
      msg: "Internal Server Error",
      data: null
    };
  }
};