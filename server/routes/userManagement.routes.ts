// server/routes/userManagement.routes.ts - PRODUCTION READY + CREATE USER
import { Router } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import {
  getAllUsers,
  createUser,        // ✅ NEW - Import create user controller
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from '../controllers/userManagementController';


const router = Router();


// ============================================
// ALL ROUTES REQUIRE ADMIN AUTHENTICATION
// ============================================
router.use(authenticateToken, isAdmin);


// ============================================
// USER MANAGEMENT ROUTES
// ============================================


// GET /api/admin/users - Get all users with filters
router.get('/', getAllUsers);


// ✅ NEW - POST /api/admin/users/create - Create new user manually
router.post('/create', createUser);


// PATCH /api/admin/users/:id/role - Update user role
router.patch('/:id/role', updateUserRole);


// PATCH /api/admin/users/:id/status - Toggle user active status
router.patch('/:id/status', toggleUserStatus);


// DELETE /api/admin/users/:id - Delete user
router.delete('/:id', deleteUser);


export default router;
