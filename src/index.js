/** @format */
import "./config/loadEnv.js";
import express from "express";
import helmet from "helmet";
import cors from 'cors';
import passport from 'passport';
import './app/config/passport.js';
// import decryptReq from "./app/helper/decryptingReq.js";
import initializeRoutes from "./routes/index.js";
import sequelize from "./config/db_connect.js";
import { testConnection } from './config/db_connect.js';
import auth from './app/middleware/auth.js';
import userRoutes from './routes/userRoute.js';
import adminRoutes from './routes/adminRoute.js';
import friendRoutes from './routes/friendRoute.js';
import authRoutes from './routes/authRoute.js';
import errorHandler from './app/middleware/errorHandler.js';

// Load environment variables
// dotenv.config();

const app = express();
const router = express.Router();

// Trust proxy headers for secure headers and IP detection
app.set("trust proxy", 1);

// Basic security
app.use(helmet());

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS setup
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Allow requests from your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Decrypt request middleware
// decryptReq(app);

// Initialize Passport
app.use(passport.initialize());

// Debug logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Raw Body:", JSON.stringify(req.body, null, 2));
    next();
});

// JSON Content-Type enforcement
app.use((req, res, next) => {
    // Add URLs to exclude from content-type check
    const excludedUrls = [
        "/webhooks/yellowcard-moneylink", "/api/didit/processDiditWebhooks"
    ];

    // Skip check if URL is in excluded list
    if (excludedUrls.includes(req.path)) {
        return next();
    }

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
        const contentType = req.headers["content-type"];
        if (!contentType || !contentType.includes("application/json")) {
            return res.status(415).json({
                status: 415,
                msg: "Unsupported Media Type: Content-Type must be application/json",
                data: null,
            });
        }
    }
    next();
});

// Reject disallowed methods for specific routes
app.use((req, res, next) => {
    const methodNotAllowedRoutes = ["/user/login", "/user/signUp"];
    if (methodNotAllowedRoutes.includes(req.originalUrl) && req.method !== "POST") {
        return res.status(405).json({ status: 405, msg: "Method Not Allowed", data: null });
    }
    next();
});

// Only allow specific methods globally
app.use((req, res, next) => {
    if (!["GET", "POST", "OPTIONS"].includes(req.method)) {
        return res.status(405).json({ status: 405, msg: `Method ${req.method} Not Allowed`, data: null });
    }
    next();
});

// Body parser syntax error catcher
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        console.error("[ERROR] Body parser error:", err.message);
        return res.status(400).json({ status: 400, msg: "Invalid JSON format", data: null });
    }
    next(err);
});

// Initialize routes
try {
    initializeRoutes(app, router);
    console.log("[INFO] Routes initialized successfully.");
} catch (error) {
    console.error("[ERROR] Route initialization failed:", error.message);
    process.exit(1);
}

// Connect to DB
try {
    await sequelize.authenticate();
    console.log("[INFO] Database connected successfully.");
    await sequelize.sync();
    console.log("[INFO] Database synchronized.");
} catch (error) {
    console.error("[ERROR] Database connection failed:", error.message);
    process.exit(1);
}

// 404 handler
app.all("*", (req, res) => {
    console.log(`[404] Route not found: ${req.originalUrl}`);
    res.status(404).json({ status: 404, msg: "Not Found", data: null });
});

// Apply the improved error handler
errorHandler(app);

// Ping route (used by load balancers)
router.get("/ping", (req, res) => {
    res.status(200).json({ msg: "pong", uptime: process.uptime() });
});

// Routes
app.use('/api/users', auth.verifyToken, userRoutes);
app.use('/api/admin', auth.verifyAdminToken, adminRoutes);
app.use('/api/friends', auth.verifyToken, friendRoutes);
app.use('/api/auth', authRoutes);

// Test database connection
testConnection();

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, "0.0.0.0", (err) => {
    if (!err) {
        console.log(`[INFO] Server running on port ${PORT}`);
        console.log("🚀 Running in:", process.env.NODE_ENV);
    } else {
        console.error("[ERROR] Server startup failed:", err.message);
        process.exit(1);
    }
});

// Increase timeout
server.setTimeout(30000);

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("[WARN] SIGTERM received. Shutting down...");
    server.close(() => {
        console.log("[INFO] Server closed properly.");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("[WARN] SIGINT received. Shutting down...");
    server.close(() => {
        console.log("[INFO] Server closed properly.");
        process.exit(0);
    });
});

process.on("uncaughtException", (err) => {
    console.error("[FATAL] Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
    console.error("[FATAL] Unhandled Promise Rejection:", reason);
});