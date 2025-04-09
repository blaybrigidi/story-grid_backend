import adminService from '../services/adminService.js';

export const requestLogin = async (req) => {
  const { email, password } = req.body.data;

  // Validate if email and password are provided
  if (!email || !password) {
    console.warn(`[WARN] Missing email or password in admin login request.`);
    return {
      status: 400,
      msg: "Email and password are required to log in.",
      data: [],
    };
  }

  console.log(`[INFO] Admin login requested for email: ${email}`);

  try {
    // Call service function to validate credentials and send OTP
    const response = await adminService.requestLogin(email, password);

    if (response.status === 200) {
      console.log(`[SUCCESS] OTP sent to admin email: ${email}`);
    } else {
      console.warn(`[WARN] Admin login request failed for email: ${email}`);
    }

    return {
      status: response.status,
      msg: response.msg,
      data: response.data || [],
    };
  } catch (error) {
    console.error(`[ERROR] Failed to process login request for email: ${email}`, error);
    return {
      status: 500,
      msg: "An error occurred while processing the login request.",
      data: [],
    };
  }
};

export const verifyLogin = async (req) => {
  const { email, otp } = req.body.data;

  // Validate if email and OTP are provided
  if (!email || !otp) {
    console.warn(`[WARN] Missing email or OTP in admin login request.`);
    return {
      status: 400,
      msg: "Email and OTP are required to log in.",
      data: [],
    };
  }

  console.log(`[INFO] Admin login verification requested for email: ${email}`);

  try {
    // Call service function to verify OTP and issue a JWT
    const response = await adminService.verifyLogin(email, otp);

    if (response.status === 200) {
      console.log(`[SUCCESS] Admin login successful for email: ${email}`);
    } else {
      console.warn(`[WARN] Admin login failed for email: ${email}`);
    }

    return {
      status: response.status,
      msg: response.msg,
      data: response.data || [],
    };
  } catch (error) {
    console.error(`[ERROR] Failed to verify OTP for email: ${email}`, error);
    return {
      status: 500,
      msg: "An error occurred while verifying the login request.",
      data: [],
    };
  }
};

export const blockUser = async (req) => {
  const { userId } = req.body.data;

  // Validate if userId is provided
  if (!userId) {
    console.warn(`[WARN] Missing userId in block user request.`);
    return {
      status: 400,
      msg: "User ID is required to block a user.",
      data: [],
    };
  }

  console.log(`[INFO] Block user requested for userId: ${userId}`);

  try {
    // Call service function to block the user
    const response = await adminService.blockUser(userId);

    if (response.status === 200) {
      console.log(`[SUCCESS] User blocked successfully: ${userId}`);
    } else {
      console.warn(`[WARN] Failed to block user: ${userId}`);
    }

    return {
      status: response.status,
      msg: response.msg,
      data: response.data || [],
    };
  } catch (error) {
    console.error(`[ERROR] Failed to block user: ${userId}`, error);
    return {
      status: 500,
      msg: "An error occurred while blocking the user.",
      data: [],
    };
  }
};

export const unblockUser = async (req) => {
  const { userId } = req.body.data;

  // Validate if userId is provided
  if (!userId) {
    console.warn(`[WARN] Missing userId in unblock user request.`);
    return {
      status: 400,
      msg: "User ID is required to unblock a user.",
      data: [],
    };
  }

  console.log(`[INFO] Unblock user requested for userId: ${userId}`);

  try {
    // Call service function to unblock the user
    const response = await adminService.unblockUser(userId);

    if (response.status === 200) {
      console.log(`[SUCCESS] User unblocked successfully: ${userId}`);
    } else {
      console.warn(`[WARN] Failed to unblock user: ${userId}`);
    }

    return {
      status: response.status,
      msg: response.msg,
      data: response.data || [],
    };
  } catch (error) {
    console.error(`[ERROR] Failed to unblock user: ${userId}`, error);
    return {
      status: 500,
      msg: "An error occurred while unblocking the user.",
      data: [],
    };
  }
}; 