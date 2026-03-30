// client/src/pages/admin/components/CouponsManagement.tsx - OPTIMIZED (NO BLINK)
import { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Ticket, Plus, Edit, Trash2, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/axios';

interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

interface FormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount: string;
  maxDiscount: string;
  usageLimit: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const INITIAL_FORM: FormData = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  minAmount: '',
  maxDiscount: '',
  usageLimit: '',
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: '',
  isActive: true,
};

// ============================================
// COUPON DIALOG COMPONENT (MEMOIZED)
// ============================================
interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onSubmit: () => void;
  loading: boolean;
}

const CouponDialogContent = memo(({
  isEdit,
  formData,
  onFormChange,
  onSubmit,
  loading,
  onClose,
}: Omit<CouponDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }) => {
  const updateField = useCallback((field: keyof FormData, value: any) => {
    onFormChange({ ...formData, [field]: value });
  }, [formData, onFormChange]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update coupon details' : 'Create a new discount coupon'}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => updateField('code', e.target.value.toUpperCase())}
              placeholder="SAVE20"
              disabled={loading}
              maxLength={20}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountType">Discount Type *</Label>
            <Select
              value={formData.discountType}
              onValueChange={(value: any) => updateField('discountType', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Get 20% off on all courses"
            disabled={loading}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discountValue">
              Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
            </Label>
            <Input
              id="discountValue"
              type="number"
              value={formData.discountValue}
              onChange={(e) => updateField('discountValue', Number(e.target.value))}
              placeholder={formData.discountType === 'percentage' ? '20' : '500'}
              disabled={loading}
              min={0}
              max={formData.discountType === 'percentage' ? 100 : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minAmount">Min. Purchase Amount (₹)</Label>
            <Input
              id="minAmount"
              type="number"
              value={formData.minAmount}
              onChange={(e) => updateField('minAmount', e.target.value)}
              placeholder="1000"
              disabled={loading}
              min={0}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxDiscount">Max. Discount (₹)</Label>
            <Input
              id="maxDiscount"
              type="number"
              value={formData.maxDiscount}
              onChange={(e) => updateField('maxDiscount', e.target.value)}
              placeholder="5000"
              disabled={loading || formData.discountType === 'fixed'}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usageLimit">Usage Limit</Label>
            <Input
              id="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={(e) => updateField('usageLimit', e.target.value)}
              placeholder="100"
              disabled={loading}
              min={0}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="validFrom">Valid From *</Label>
            <Input
              id="validFrom"
              type="date"
              value={formData.validFrom}
              onChange={(e) => updateField('validFrom', e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until *</Label>
            <Input
              id="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={(e) => updateField('validUntil', e.target.value)}
              disabled={loading}
              min={formData.validFrom}
            />
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
          type="button"
        >
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={loading} type="button">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : isEdit ? (
            'Update Coupon'
          ) : (
            'Create Coupon'
          )}
        </Button>
      </DialogFooter>
    </>
  );
});

CouponDialogContent.displayName = 'CouponDialogContent';

// ============================================
// MAIN COMPONENT
// ============================================
export default function CouponsManagement() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/coupons');
      setCoupons(response.data.coupons || []);
    } catch (error: any) {
      console.error('Failed to fetch coupons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load coupons',
        variant: 'destructive',
      });
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
    setEditingCoupon(null);
  }, []);

  const handleAddCoupon = useCallback(async () => {
    if (!formData.code || !formData.discountValue || !formData.validUntil) {
      toast({
        title: 'Validation Error',
        description: 'Code, discount value, and expiry date are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(true);
      await apiClient.post('/admin/coupons', {
        ...formData,
        minAmount: formData.minAmount ? Number(formData.minAmount) : null,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      });
      toast({ title: 'Success', description: 'Coupon created successfully' });
      setAddDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create coupon',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [formData, toast, resetForm, fetchCoupons]);

  const handleEditCoupon = useCallback(async () => {
    if (!editingCoupon) return;

    try {
      setActionLoading(true);
      await apiClient.put(`/admin/coupons/${editingCoupon.id}`, {
        ...formData,
        minAmount: formData.minAmount ? Number(formData.minAmount) : null,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      });
      toast({ title: 'Success', description: 'Coupon updated successfully' });
      setEditDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update coupon',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [editingCoupon, formData, toast, resetForm, fetchCoupons]);

  const handleToggleActive = useCallback(async (id: number, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/admin/coupons/${id}/toggle`, { isActive: !currentStatus });
      toast({
        title: 'Success',
        description: `Coupon ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
      fetchCoupons();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update coupon status',
        variant: 'destructive',
      });
    }
  }, [toast, fetchCoupons]);

  const handleDeleteCoupon = useCallback(async () => {
    if (!deleteId) return;

    try {
      setActionLoading(true);
      await apiClient.delete(`/admin/coupons/${deleteId}`);
      toast({ title: 'Success', description: 'Coupon deleted successfully' });
      setDeleteId(null);
      fetchCoupons();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete coupon',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [deleteId, toast, fetchCoupons]);

  const openEditDialog = useCallback((coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minAmount: coupon.minAmount?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil.split('T')[0],
      isActive: coupon.isActive,
    });
    setEditDialogOpen(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    setAddDialogOpen(false);
    resetForm();
  }, [resetForm]);

  const closeEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    resetForm();
  }, [resetForm]);

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
    const now = new Date();
    const isExpired = new Date(coupon.validUntil) < now;
    
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && coupon.isActive && !isExpired) ||
      (filterStatus === 'inactive' && !coupon.isActive) ||
      (filterStatus === 'expired' && isExpired);
    
    return matchesSearch && matchesStatus;
  });

  const activeCount = coupons.filter((c) => c.isActive && new Date(c.validUntil) > new Date()).length;
  const expiredCount = coupons.filter((c) => new Date(c.validUntil) < new Date()).length;
  const totalUsage = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6" />
            Coupons Management
          </h2>
          <p className="text-muted-foreground mt-1">Create and manage discount coupons</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Coupons</p>
                <p className="text-2xl font-bold">{coupons.length}</p>
              </div>
              <Ticket className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Coupons</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">{totalUsage}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{expiredCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by coupon code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchQuery || filterStatus !== 'all'
                          ? 'No coupons match your filters'
                          : 'No coupons found'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((coupon) => {
                    const isExpired = new Date(coupon.validUntil) < new Date();
                    return (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {coupon.discountType === 'percentage' ? '%' : '₹'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`}
                        </TableCell>
                        <TableCell>
                          {coupon.usedCount} / {coupon.usageLimit || '∞'}
                        </TableCell>
                        <TableCell>
                          {new Date(coupon.validUntil).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell>
                          {isExpired ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : coupon.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(coupon)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                              disabled={isExpired}
                            >
                              {coupon.isActive ? (
                                <XCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteId(coupon.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <CouponDialogContent
            isEdit={false}
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleAddCoupon}
            loading={actionLoading}
            onClose={closeAddDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <CouponDialogContent
            isEdit={true}
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleEditCoupon}
            loading={actionLoading}
            onClose={closeEditDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this coupon? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCoupon}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

