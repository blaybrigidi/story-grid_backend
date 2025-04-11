import adminService from '../services/adminService.js';
import userService from '../services/userService.js';

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
        console.error('[ERROR] Failed to get dashboard data:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve dashboard data',
            data: null
        };
    }
};

export const getAllUsers = async (req) => {
    try {
        // Placeholder for user list
        const users = [
            { id: 1, email: 'user1@example.com', firstName: 'John', lastName: 'Doe', isBlocked: false },
            { id: 2, email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', isBlocked: true }
        ];
        
        return {
            status: 200,
            msg: 'Users retrieved successfully',
            data: users
        };
    } catch (error) {
        console.error('[ERROR] Failed to get users:', error);
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
        
        // Placeholder for blocking user
        console.log(`Blocking user with ID: ${userId}`);
        
        return {
            status: 200,
            msg: 'User blocked successfully',
            data: null
        };
    } catch (error) {
        console.error('[ERROR] Failed to block user:', error);
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
        
        // Placeholder for unblocking user
        console.log(`Unblocking user with ID: ${userId}`);
        
        return {
            status: 200,
            msg: 'User unblocked successfully',
            data: null
        };
    } catch (error) {
        console.error('[ERROR] Failed to unblock user:', error);
        return {
            status: 500,
            msg: 'Failed to unblock user',
            data: null
        };
    }
}; 