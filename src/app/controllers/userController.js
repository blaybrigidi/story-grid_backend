/** @format */
import { register, requestLogin as requestLoginService, verifyLogin as verifyLoginService, getProfile as getProfileService, updateProfile as updateProfileService, changePassword as changePasswordService, login as loginService, searchUsers as searchUsersService } from '../services/userService.js';

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
    
    const result = await register(userData);
    
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
    const result = await requestLoginService(email, password);
    
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
    const result = await verifyLoginService(email, otp);
    
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
    const result = await getProfileService(userId);
    
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

    // Optional: Validate bio length
    if (updateData.bio && updateData.bio.length > 500) {
      return {
        status: 400,
        msg: "Bio must be 500 characters or less",
        data: null
      };
    }

    const result = await updateProfileService(userId, updateData);

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
    
    if (!currentPassword || !newPassword) {
      return {
        status: 400,
        msg: "Current password and new password are required",
        data: null
      };
    }
    
    const result = await changePasswordService(userId, currentPassword, newPassword);
    
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

/**
 * Controller for user login
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const login = async (req) => {
  try {
    const { email, password } = req.body.data;
    
    if (!email || !password) {
      return {
        status: 400,
        msg: "Email and password are required",
        data: null
      };
    }
    
    const result = await loginService(email, password);
    
    return {
      status: result.status,
      msg: result.msg,
      data: result.data
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      status: 500,
      msg: "Internal Server Error",
      data: null
    };
  }
};

/**
 * Controller for searching users
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const searchUsers = async (req) => {
  try {
    const { query, limit } = req.body.data || req.body || {};
    
    console.log("Received search request:", { data: { query } });
    
    if (!query) {
      return {
        status: 400,
        msg: "Search query is required",
        data: null
      };
    }
    
    console.log(`Searching for users with query: "${query}"`);
    const result = await searchUsersService(query, limit);
    
    return {
      status: result.status || 200,
      msg: result.msg || "Users found successfully",
      data: result.data
    };
  } catch (error) {
    console.error("Search users error:", error);
    return {
      status: 500,
      msg: "Internal Server Error",
      data: null
    };
  }
};
