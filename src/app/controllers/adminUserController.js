import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isBlocked', 'kycStatus', 'country', 'createdAt']
        });
        return users;
    } catch (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
};

export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findByPk(userId);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    } catch (error) {
        throw new Error(`Failed to fetch user details: ${error.message}`);
    }
};

export const getUserMetrics = async (req, res) => {
    try {
        // In a real application, this would calculate metrics from the database
        return {
            totalUsers: 100,
            activeUsers: 80,
            blockedUsers: 5,
            pendingKyc: 15
        };
    } catch (error) {
        throw new Error(`Failed to fetch user metrics: ${error.message}`);
    }
};

export const getAllBanks = async (req, res) => {
    try {
        // In a real application, this would fetch from a database
        return [
            { id: 1, name: 'Bank A', code: 'BA001' },
            { id: 2, name: 'Bank B', code: 'BB002' },
            { id: 3, name: 'Bank C', code: 'BC003' }
        ];
    } catch (error) {
        throw new Error(`Failed to fetch banks: ${error.message}`);
    }
};

export const fetchAllKYC = async (req, res) => {
    try {
        // In a real application, this would fetch from a database
        return [
            { userId: 1, status: 'pending', submittedAt: '2023-10-01' },
            { userId: 2, status: 'approved', submittedAt: '2023-09-15' },
            { userId: 3, status: 'rejected', submittedAt: '2023-09-20' }
        ];
    } catch (error) {
        throw new Error(`Failed to fetch KYC information: ${error.message}`);
    }
};

export const getCountryDetails = async (req, res) => {
    try {
        // In a real application, this would fetch from a database
        return [
            { country: 'USA', userCount: 50 },
            { country: 'UK', userCount: 30 },
            { country: 'Canada', userCount: 20 }
        ];
    } catch (error) {
        throw new Error(`Failed to fetch country details: ${error.message}`);
    }
};

export const getUserPercentageByCountry = async (req, res) => {
    try {
        // In a real application, this would calculate from the database
        return [
            { country: 'USA', percentage: 50 },
            { country: 'UK', percentage: 30 },
            { country: 'Canada', percentage: 20 }
        ];
    } catch (error) {
        throw new Error(`Failed to fetch user percentage by country: ${error.message}`);
    }
};

export const getAllSupportedCountries = async (req, res) => {
    try {
        // In a real application, this would fetch from a database
        return [
            { code: 'US', name: 'United States' },
            { code: 'GB', name: 'United Kingdom' },
            { code: 'CA', name: 'Canada' }
        ];
    } catch (error) {
        throw new Error(`Failed to fetch supported countries: ${error.message}`);
    }
};

export const getKycDetails = async (req, res) => {
    try {
        const { userId } = req.body;
        
        // In a real application, this would fetch from a database
        return {
            userId,
            status: 'pending',
            documents: [
                { type: 'ID', status: 'verified' },
                { type: 'Address', status: 'pending' }
            ],
            submittedAt: '2023-10-01'
        };
    } catch (error) {
        throw new Error(`Failed to fetch KYC details: ${error.message}`);
    }
}; 