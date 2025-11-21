import express from 'express';
const router = express.Router();

import dashboardControllers from '../controllers/adminControllers/dashboard.controllers.js';
import manageUsersControllers from '../controllers/adminControllers/manageUsers.controllers.js';
import analyticsControllers from '../controllers/adminControllers/analytics.controllers.js';
import manageEarningsControllers from '../controllers/adminControllers/manageEarnings.controllers.js';
import adminProfileControllers from '../controllers/adminControllers/adminProfile.controllers.js';
import isAdminLoggedin from '../middlewares/auth.middleware.js';

// Dashboard
router.get("/admin", isAdminLoggedin, dashboardControllers.getAdminDashboard);

// Manage Users
router.get("/manage-user", isAdminLoggedin, manageUsersControllers.getManageUsers);
router.post("/approve-user/:id", isAdminLoggedin, manageUsersControllers.approveMechanic);
router.post("/decline-user/:id", isAdminLoggedin, manageUsersControllers.declineUser);
router.post("/delete-buyer/:id", isAdminLoggedin, manageUsersControllers.deleteBuyer);
router.post("/delete-seller/:id", isAdminLoggedin, manageUsersControllers.deleteSeller);

// Analytics
router.get("/analytics", isAdminLoggedin, analyticsControllers.getAnalytics);

// Manage Earnings
router.get("/manage-earnings", isAdminLoggedin, manageEarningsControllers.getManageEarnings);

// Admin Profile
router.get("/admin-profile", isAdminLoggedin, adminProfileControllers.getAdminProfile);
router.post("/update-admin-password", isAdminLoggedin, adminProfileControllers.updateAdminPassword);

export default router;