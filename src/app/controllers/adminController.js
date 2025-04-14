// import { requestLogin as adminRequestLogin, verifyLogin as adminVerifyLogin } from '../services/adminService.js';
// import { blockUser as blockUserService, unblockUser as unblockUserService } from '../services/userService.js';

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
    const response = await adminRequestLogin(email, password);

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
    const response = await adminVerifyLogin(email, otp);

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

export const getDashboard = async (req) => {
    try {
        // Placeholder for dashboard data
        const dashboardData = {
            totalUsers: 100,
            activeUsers: 80,
            blockedUsers: 20,
            recentActivity: [
                { id: 1, action: 'User registered', timestamp: new Date() },
                { id: 2, action: 'User logged in', timestamp: new Date() }
            ]
        };
        
        return {
            status: 200,
            msg: 'Dashboard data retrieved successfully',
            data: dashboardData
        };
    } catch (error) {
        console.error('Get dashboard error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve dashboard data',
            data: null
        };
    }
};

export const getAllUsers = async (req) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'firstName', 'lastName', 'isActive', 'isBlocked', 'createdAt']
        });
        
        return {
            status: 200,
            msg: 'Users retrieved successfully',
            data: users
        };
    } catch (error) {
        console.error('Get users error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve users',
            data: null
        };
    }
};

export const blockUser = async (req) => {
    try {
        const { userId } = req.params;
        const response = await blockUserService(userId);
        
        return {
            status: response.status,
            msg: response.msg,
            data: response.data
        };
    } catch (error) {
        console.error('Block user error:', error);
        return {
            status: 500,
            msg: 'Failed to block user',
            data: null
        };
    }
};

export const unblockUser = async (req) => {
    try {
        const { userId } = req.params;
        const response = await unblockUserService(userId);
        
        return {
            status: response.status,
            msg: response.msg,
            data: response.data
        };
    } catch (error) {
        console.error('Unblock user error:', error);
        return {
            status: 500,
            msg: 'Failed to unblock user',
            data: null
        };
    }
}; 