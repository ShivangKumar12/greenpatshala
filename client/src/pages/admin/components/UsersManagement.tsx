// client/src/pages/admin/components/UsersManagement.tsx - PRODUCTION READY ✅
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  MoreVertical,
  UserCog,
  UserX,
  Trash2,
  Users,
  UserCheck,
  GraduationCap,
  Shield,
  Loader2,
  Calendar,
  BookOpen,
  Brain,
  IndianRupee,
  Mail,
  UserPlus,
  Eye,
  EyeOff,
  Phone,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ✅ Import API functions
import {
  getUsers,
  createUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getRoleBadgeColor,
  getStatusBadgeColor,
  type User,
  type UserStats,
  type CreateUserData,
} from '@/services/userManagementApi';

export default function UsersManagement() {
  const { toast } = useToast();

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    instructors: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'instructor' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'user' | 'instructor' | 'admin'>('user');
  const [actionLoading, setActionLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Create user form
  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    isVerified: true,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateUserData, string>>>({});

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers({
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
        role: roleFilter,
        status: statusFilter,
      });

      setUsers(response.users);
      setStats(response.stats);
    } catch (error: any) {
      console.error('[fetchUsers] Error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter, toast]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  // ============================================
  // FORM VALIDATION
  // ============================================

  const validateCreateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateUserData, string>> = {};

    // Name validation
    if (!createFormData.name.trim()) {
      errors.name = 'Name is required';
    } else if (createFormData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!createFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(createFormData.email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation
    if (!createFormData.password) {
      errors.password = 'Password is required';
    } else if (createFormData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(createFormData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(createFormData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(createFormData.password)) {
      errors.password = 'Password must contain at least one number';
    }

    // Phone validation (optional)
    if (createFormData.phone && createFormData.phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(createFormData.phone)) {
        errors.phone = 'Invalid phone number format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================
  // USER OPERATIONS
  // ============================================

  const handleCreateUser = async () => {
    if (!validateCreateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(true);

      const response = await createUser(createFormData);

      toast({
        title: 'Success',
        description: response.message || 'User created successfully',
      });

      // Reset form
      setCreateFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
        isVerified: true,
        isActive: true,
      });
      setFormErrors({});
      setIsCreateDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      await updateUserRole(selectedUser.id, selectedRole);

      toast({
        title: 'Success',
        description: `User role updated to ${selectedRole}`,
      });

      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleUserStatus(user.id);

      toast({
        title: 'Success',
        description: `User ${user.isActive ? 'suspended' : 'activated'} successfully`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      await deleteUser(selectedUser.id);

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // DIALOG HANDLERS
  // ============================================

  const openCreateDialog = () => {
    setCreateFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'user',
      isVerified: true,
      isActive: true,
    });
    setFormErrors({});
    setShowPassword(false);
    setIsCreateDialogOpen(true);
  };

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Instructors</p>
                <p className="text-2xl font-bold">{stats.instructors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="instructor">Instructors</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Activity</th>
                  <th className="text-left p-4 font-medium">Stats</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                        {user.role === 'instructor' && <GraduationCap className="w-3 h-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <Badge className={getStatusBadgeColor(user.isActive)}>
                        {user.isActive ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            active
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            suspended
                          </>
                        )}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Joined: {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {user.lastLoginAt && (
                          <div className="text-xs text-muted-foreground">
                            Last active: {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>{user.stats.coursesEnrolled} courses</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain className="w-3.5 h-3.5 text-purple-600" />
                          <span>{user.stats.quizzesAttempted} quizzes</span>
                        </div>
                        {user.stats.totalSpent > 0 && (
                          <div className="flex items-center gap-2 text-green-600 font-medium">
                            <IndianRupee className="w-3.5 h-3.5" />
                            <span>₹{user.stats.totalSpent.toLocaleString()}</span>
                          </div>
                        )}
                        {user.stats.coursesEnrolled === 0 && user.stats.quizzesAttempted === 0 && (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                            <UserCog className="w-4 h-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            <UserX className="w-4 h-4 mr-2" />
                            {user.isActive ? 'Suspend User' : 'Activate User'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(user)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account manually. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="create-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-name"
                placeholder="John Doe"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="create-email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="create-email"
                  type="email"
                  placeholder="john@example.com"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className={`pl-10 ${formErrors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {formErrors.email && (
                <p className="text-sm text-destructive">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="create-password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters, 1 uppercase, 1 number"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  className={`pr-10 ${formErrors.password ? 'border-destructive' : ''}`}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {formErrors.password && (
                <p className="text-sm text-destructive">{formErrors.password}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="create-phone">Phone Number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="create-phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  className={`pl-10 ${formErrors.phone ? 'border-destructive' : ''}`}
                />
              </div>
              {formErrors.phone && (
                <p className="text-sm text-destructive">{formErrors.phone}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="create-role">
                User Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createFormData.role}
                onValueChange={(value: any) => setCreateFormData({ ...createFormData, role: value })}
              >
                <SelectTrigger id="create-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>User</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="instructor">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>Instructor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-verified"
                  checked={createFormData.isVerified}
                  onCheckedChange={(checked) =>
                    setCreateFormData({ ...createFormData, isVerified: !!checked })
                  }
                />
                <Label htmlFor="create-verified" className="cursor-pointer font-normal">
                  Email verified (skip email verification)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-active"
                  checked={createFormData.isActive}
                  onCheckedChange={(checked) =>
                    setCreateFormData({ ...createFormData, isActive: !!checked })
                  }
                />
                <Label htmlFor="create-active" className="cursor-pointer font-normal">
                  Account active (user can login immediately)
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for <strong>{selectedUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleChangeRole} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action
              cannot be undone and will remove all user data including enrollments and quiz attempts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
