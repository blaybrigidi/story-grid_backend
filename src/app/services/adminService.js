// This is a mock implementation. In a real application, 
// you would interact with a database here

export const requestLogin = async (email, password) => {
    // In a real application, this would validate credentials and send OTP
    return {
        status: 200,
        msg: 'OTP sent to your email',
        data: { email }
    };
};

export const verifyLogin = async (email, otp) => {
    // In a real application, this would verify OTP and generate a token
    return {
        status: 200,
        msg: 'Login successful',
        data: {
            token: 'mock-jwt-token',
            user: {
                id: 1,
                email,
                role: 'admin'
            }
        }
    };
};

export const blockUser = async (userId) => {
    // In a real application, this would update user status in database
    return {
        status: 200,
        msg: `User ${userId} has been blocked`,
        data: { userId }
    };
};

export const unblockUser = async (userId) => {
    // In a real application, this would update user status in database
    return {
        status: 200,
        msg: `User ${userId} has been unblocked`,
        data: { userId }
    };
}; 