// client/src/pages/admin/components/PaymentsManagement.tsx - FULLY INTEGRATED
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  CreditCard,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  Loader2,
  Copy,
  Check,
  FileText,
  Printer,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getAllPayments,
  getPaymentStats,
  exportPaymentsCSV,
  downloadPaymentSlip,
  printPaymentReceipt,
  deletePayment,
  type Payment,
  type PaymentStats,
} from '@/services/paymentApi';

export default function PaymentsManagement() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalRevenue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || statusFilter !== 'all' || typeFilter !== 'all') {
        fetchData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [paymentsRes, statsRes] = await Promise.all([
        getAllPayments({
          status: statusFilter as any,
          type: typeFilter as any,
          search: searchQuery || undefined,
          limit: 100,
        }),
        getPaymentStats(),
      ]);

      setPayments(paymentsRes.payments);
      setStats(statsRes.stats);
    } catch (error: any) {
      console.error('Failed to fetch payments:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: 'Copied!',
      description: 'Copied to clipboard',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSlip = (payment: Payment) => {
    downloadPaymentSlip(payment);
    toast({
      title: 'Downloaded',
      description: 'Payment slip downloaded successfully',
    });
  };

  const handleExportCSV = () => {
    exportPaymentsCSV(filteredPayments);
    toast({
      title: 'Exported',
      description: `${filteredPayments.length} transactions exported to CSV`,
    });
  };

  const handlePrintSlip = () => {
    if (!selectedPayment) return;
    printPaymentReceipt(selectedPayment);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      success: { variant: 'default', icon: CheckCircle, label: 'Success' },
      failed: { variant: 'destructive', icon: XCircle, label: 'Failed' },
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    try {
      setDeleting(true);
      await deletePayment(paymentToDelete.id);
      toast({
        title: 'Deleted',
        description: 'Transaction record deleted successfully',
      });
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete transaction',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.itemType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Payments Management
          </h2>
          <p className="text-muted-foreground mt-1">
            View and manage all payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} className="gap-2" variant="outline">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <IndianRupee className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold">{stats.totalPayments}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold">{stats.successfulPayments}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
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
                  placeholder="Search by name, email, order ID, or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="course">Courses</SelectItem>
                <SelectItem value="quiz">Quizzes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Order ID</TableHead>
                  <TableHead className="min-w-[150px]">Transaction ID</TableHead>
                  <TableHead className="min-w-[150px]">User</TableHead>
                  <TableHead className="min-w-[180px]">Item</TableHead>
                  <TableHead className="min-w-[100px]">Amount</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[150px]">Date</TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">No payments found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.orderId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">
                            {payment.transactionId}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() =>
                              handleCopyToClipboard(payment.transactionId, payment.id.toString())
                            }
                          >
                            {copiedId === payment.id.toString() ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{payment.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.userEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{payment.itemName}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {payment.itemType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setPaymentToDelete(payment);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Payment Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Payment Details</DialogTitle>
            <DialogDescription>Complete transaction information</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="font-semibold text-lg">Transaction Status</h3>
                {getStatusBadge(selectedPayment.status)}
              </div>

              {/* Transaction Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm break-all">{selectedPayment.orderId}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 flex-shrink-0"
                      onClick={() =>
                        handleCopyToClipboard(
                          selectedPayment.orderId,
                          'order-' + selectedPayment.id
                        )
                      }
                    >
                      {copiedId === 'order-' + selectedPayment.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm break-all">{selectedPayment.transactionId}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 flex-shrink-0"
                      onClick={() =>
                        handleCopyToClipboard(
                          selectedPayment.transactionId,
                          'txn-' + selectedPayment.id
                        )
                      }
                    >
                      {copiedId === 'txn-' + selectedPayment.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payment ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm break-all">{selectedPayment.paymentId || 'N/A'}</p>
                    {selectedPayment.paymentId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={() =>
                          handleCopyToClipboard(
                            selectedPayment.paymentId!,
                            'pay-' + selectedPayment.id
                          )
                        }
                      >
                        {copiedId === 'pay-' + selectedPayment.id ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                  <p className="font-medium text-sm">{selectedPayment.paymentMethod}</p>
                </div>
              </div>

              {/* User Info */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Customer Information</h3>
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedPayment.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium break-all">{selectedPayment.userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Item Info */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Purchase Details</h3>
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Item Type</p>
                    <Badge variant="outline" className="mt-1">
                      {selectedPayment.itemType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Item Name</p>
                    <p className="font-medium">{selectedPayment.itemName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-3xl font-bold text-green-600">
                      ₹{selectedPayment.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Info */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Transaction Date</p>
                <p className="font-medium">
                  {new Date(selectedPayment.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'full',
                    timeStyle: 'long',
                  })}
                </p>
              </div>

              {/* Signature */}
              {selectedPayment.signature && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Signature</p>
                  <div className="flex items-start gap-2">
                    <p className="font-mono text-xs break-all flex-1 bg-muted p-3 rounded">
                      {selectedPayment.signature}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0"
                      onClick={() =>
                        handleCopyToClipboard(
                          selectedPayment.signature!,
                          'sig-' + selectedPayment.id
                        )
                      }
                    >
                      {copiedId === 'sig-' + selectedPayment.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => selectedPayment && handleDownloadSlip(selectedPayment)}
              className="gap-2 w-full sm:w-auto"
            >
              <FileText className="w-4 h-4" />
              Download Slip
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintSlip}
              className="gap-2 w-full sm:w-auto"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </Button>
            <Button
              variant="default"
              onClick={() => setViewDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the payment record for{' '}
              <strong>{paymentToDelete?.itemName}</strong> by{' '}
              <strong>{paymentToDelete?.userName}</strong> (₹{paymentToDelete?.amount.toLocaleString()}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPaymentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePayment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
