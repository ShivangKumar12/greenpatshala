// client/src/pages/admin/components/FeedbackManagement.tsx - PRODUCTION READY
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  MessageSquare,
  Star,
  Award,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Edit,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getAllFeedbacks,
  updateFeedback,
  deleteFeedback,
  type Feedback,
} from '@/services/feedbackApi';
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type Testimonial,
} from '@/services/testimonialApi';

// Constants
const INITIAL_STORY_FORM = {
  name: '',
  role: '',
  avatar: '',
  content: '',
  rating: 5,
  displayOrder: 0,
};

const FEEDBACK_STATUSES = ['pending', 'approved', 'rejected'] as const;
const FILTER_OPTIONS = ['all', 'published', 'unpublished'] as const;

export default function FeedbackManagement() {
  const { toast } = useToast();

  // State Management
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog States
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addStoryDialogOpen, setAddStoryDialogOpen] = useState(false);
  const [editStoryDialogOpen, setEditStoryDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<'feedback' | 'testimonial'>('feedback');

  // Form State
  const [storyForm, setStoryForm] = useState(INITIAL_STORY_FORM);

  // Fetch Data on Mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [feedbackRes, testimonialRes] = await Promise.all([
        getAllFeedbacks({ limit: 100 }),
        getAllTestimonials(),
      ]);
      setFeedbacks(feedbackRes.feedbacks || []);
      setTestimonials(testimonialRes.testimonials || []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Feedback Handlers
  const handleFeedbackStatusChange = useCallback(
    async (id: number, status: string) => {
      try {
        setActionLoading(true);
        await updateFeedback(id, { status });
        toast({ title: 'Success', description: 'Feedback status updated' });
        await fetchData();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update feedback',
          variant: 'destructive',
        });
      } finally {
        setActionLoading(false);
      }
    },
    [toast, fetchData]
  );

  const handleToggleFeedbackPublic = useCallback(
    async (id: number, currentValue: boolean) => {
      try {
        setActionLoading(true);
        await updateFeedback(id, { isPublic: !currentValue });
        toast({
          title: 'Success',
          description: `Feedback ${!currentValue ? 'shown' : 'hidden'} on homepage`,
        });
        await fetchData();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update visibility',
          variant: 'destructive',
        });
      } finally {
        setActionLoading(false);
      }
    },
    [toast, fetchData]
  );

  // Testimonial Handlers
  const handleToggleTestimonialActive = useCallback(
    async (id: number, currentValue: boolean) => {
      try {
        setActionLoading(true);
        await updateTestimonial(id, { isActive: !currentValue });
        toast({
          title: 'Success',
          description: `Testimonial ${!currentValue ? 'activated' : 'deactivated'}`,
        });
        await fetchData();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update testimonial',
          variant: 'destructive',
        });
      } finally {
        setActionLoading(false);
      }
    },
    [toast, fetchData]
  );

  // Delete Handler
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;

    try {
      setActionLoading(true);
      if (deleteType === 'feedback') {
        await deleteFeedback(deleteId);
        toast({ title: 'Success', description: 'Feedback deleted successfully' });
      } else {
        await deleteTestimonial(deleteId);
        toast({ title: 'Success', description: 'Testimonial deleted successfully' });
      }
      setDeleteId(null);
      await fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [deleteId, deleteType, toast, fetchData]);

  // Form Validation
  const validateStoryForm = useCallback(() => {
    if (!storyForm.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Student name is required',
        variant: 'destructive',
      });
      return false;
    }
    if (!storyForm.role.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Role/Achievement is required',
        variant: 'destructive',
      });
      return false;
    }
    if (!storyForm.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Success story content is required',
        variant: 'destructive',
      });
      return false;
    }
    if (storyForm.rating < 1 || storyForm.rating > 5) {
      toast({
        title: 'Validation Error',
        description: 'Rating must be between 1 and 5',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  }, [storyForm, toast]);

  // Add Story Handler
  const handleAddStory = useCallback(async () => {
    if (!validateStoryForm()) return;

    try {
      setActionLoading(true);
      await createTestimonial(storyForm);
      toast({ title: 'Success', description: 'Success story added successfully' });
      setAddStoryDialogOpen(false);
      setStoryForm(INITIAL_STORY_FORM);
      await fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add success story',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [storyForm, validateStoryForm, toast, fetchData]);

  // Edit Story Handler
  const handleEditStory = useCallback(async () => {
    if (!editingTestimonial || !validateStoryForm()) return;

    try {
      setActionLoading(true);
      await updateTestimonial(editingTestimonial.id, storyForm);
      toast({ title: 'Success', description: 'Testimonial updated successfully' });
      setEditStoryDialogOpen(false);
      setEditingTestimonial(null);
      setStoryForm(INITIAL_STORY_FORM);
      await fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update testimonial',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [editingTestimonial, storyForm, validateStoryForm, toast, fetchData]);

  // Open Edit Dialog
  const openEditDialog = useCallback((testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setStoryForm({
      name: testimonial.name,
      role: testimonial.role,
      avatar: testimonial.avatar || '',
      content: testimonial.content,
      rating: testimonial.rating,
      displayOrder: testimonial.displayOrder,
    });
    setEditStoryDialogOpen(true);
  }, []);

  // Render Stars Component
  const renderStars = useCallback((rating: number) => {
    return (
      <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  }, []);

  // Memoized Filtered Data
  const filteredFeedbacks = useMemo(() => {
    return (feedbacks || []).filter((feedback) => {
      const matchesSearch =
        feedback.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feedback.message?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'published' && feedback.isPublic && feedback.status === 'approved') ||
        (filterStatus === 'unpublished' && (!feedback.isPublic || feedback.status !== 'approved'));
      return matchesSearch && matchesStatus;
    });
  }, [feedbacks, searchQuery, filterStatus]);

  const filteredTestimonials = useMemo(() => {
    return (testimonials || []).filter((testimonial) => {
      const matchesSearch =
        testimonial.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testimonial.role?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'published' && testimonial.isActive) ||
        (filterStatus === 'unpublished' && !testimonial.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [testimonials, searchQuery, filterStatus]);

  // Memoized Stats
  const stats = useMemo(() => {
    const publishedFeedbacks = (feedbacks || []).filter(
      (f) => f.isPublic && f.status === 'approved'
    ).length;
    const avgRating =
      feedbacks && feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : '0.0';

    return {
      totalFeedbacks: feedbacks?.length || 0,
      publishedFeedbacks,
      totalTestimonials: testimonials?.length || 0,
      avgRating,
    };
  }, [feedbacks, testimonials]);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading feedback and testimonials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Feedback & Success Stories
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage reviews, testimonials, and success stories
          </p>
        </div>
        <Button
          onClick={() => setAddStoryDialogOpen(true)}
          className="gap-2"
          disabled={actionLoading}
        >
          <Plus className="w-4 h-4" />
          Add Success Story
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{stats.totalFeedbacks}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Reviews</p>
                <p className="text-2xl font-bold">{stats.publishedFeedbacks}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Stories</p>
                <p className="text-2xl font-bold">{stats.totalTestimonials}</p>
              </div>
              <Award className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.avgRating}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
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
                  placeholder="Search by name or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Search feedback and testimonials"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="feedback" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="feedback">
            Reviews & Feedback ({stats.totalFeedbacks})
          </TabsTrigger>
          <TabsTrigger value="stories">
            Success Stories ({stats.totalTestimonials})
          </TabsTrigger>
        </TabsList>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Public</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedbacks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-muted-foreground">
                            {searchQuery || filterStatus !== 'all'
                              ? 'No feedback matches your filters'
                              : 'No feedback found'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFeedbacks.map((feedback) => (
                        <TableRow key={feedback.id}>
                          <TableCell className="font-medium">{feedback.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {feedback.email || 'N/A'}
                          </TableCell>
                          <TableCell>{renderStars(feedback.rating)}</TableCell>
                          <TableCell className="max-w-xs">
                            <p className="truncate text-sm" title={feedback.message}>
                              {feedback.message}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={feedback.status}
                              onValueChange={(value) =>
                                handleFeedbackStatusChange(feedback.id, value)
                              }
                              disabled={actionLoading}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleFeedbackPublic(feedback.id, feedback.isPublic)
                              }
                              disabled={actionLoading}
                              aria-label={
                                feedback.isPublic ? 'Hide from homepage' : 'Show on homepage'
                              }
                            >
                              {feedback.isPublic ? (
                                <Eye className="w-4 h-4 text-green-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFeedback(feedback);
                                  setViewDialogOpen(true);
                                }}
                                aria-label="View feedback details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteId(feedback.id);
                                  setDeleteType('feedback');
                                }}
                                disabled={actionLoading}
                                aria-label="Delete feedback"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
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
        </TabsContent>

        {/* Success Stories Tab */}
        <TabsContent value="stories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery || filterStatus !== 'all'
                      ? 'No success stories match your filters'
                      : 'No success stories found'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTestimonials.map((story) => (
                <Card key={story.id} className="overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-2xl font-bold text-amber-600">
                      {story.avatar || story.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate" title={story.name}>
                          {story.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate" title={story.role}>
                          {story.role}
                        </p>
                      </div>
                      <Badge
                        variant={story.isActive ? 'default' : 'secondary'}
                        className="gap-1 ml-2"
                      >
                        {story.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(story.rating)}
                      <span className="text-xs text-muted-foreground">
                        Order: {story.displayOrder}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {story.content}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(story)}
                        disabled={actionLoading}
                        aria-label="Edit testimonial"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleTestimonialActive(story.id, story.isActive)}
                        disabled={actionLoading}
                        aria-label={story.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {story.isActive ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteId(story.id);
                          setDeleteType('testimonial');
                        }}
                        disabled={actionLoading}
                        aria-label="Delete testimonial"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Feedback Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{selectedFeedback.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedFeedback.email || 'No email provided'}
                  </p>
                </div>
              </div>

              <div>
                <Label>Rating</Label>
                <div className="mt-1">{renderStars(selectedFeedback.rating)}</div>
              </div>

              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <Badge
                    variant={
                      selectedFeedback.status === 'approved'
                        ? 'default'
                        : selectedFeedback.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {selectedFeedback.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Message</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedFeedback.message}</p>
              </div>

              <div>
                <Label>Date</Label>
                <p className="text-sm mt-1">
                  {new Date(selectedFeedback.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Success Story Dialog */}
      <Dialog
        open={addStoryDialogOpen}
        onOpenChange={(open) => {
          setAddStoryDialogOpen(open);
          if (!open) setStoryForm(INITIAL_STORY_FORM);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Success Story</DialogTitle>
            <DialogDescription>Add a new student success story to inspire others</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">
                  Student Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-name"
                  value={storyForm.name}
                  onChange={(e) => setStoryForm({ ...storyForm, name: e.target.value })}
                  placeholder="Enter student name"
                  disabled={actionLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-avatar">Avatar (Initials)</Label>
                <Input
                  id="add-avatar"
                  value={storyForm.avatar}
                  onChange={(e) => setStoryForm({ ...storyForm, avatar: e.target.value })}
                  placeholder="AP"
                  maxLength={10}
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-role">
                Role/Achievement <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-role"
                value={storyForm.role}
                onChange={(e) => setStoryForm({ ...storyForm, role: e.target.value })}
                placeholder="e.g., UPSC CSE 2024 - AIR 45"
                disabled={actionLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-content">
                Success Story <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="add-content"
                value={storyForm.content}
                onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                placeholder="Write the success story..."
                rows={6}
                disabled={actionLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-rating">Rating</Label>
                <Input
                  id="add-rating"
                  type="number"
                  min={1}
                  max={5}
                  value={storyForm.rating}
                  onChange={(e) =>
                    setStoryForm({ ...storyForm, rating: parseInt(e.target.value) || 1 })
                  }
                  disabled={actionLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-order">Display Order</Label>
                <Input
                  id="add-order"
                  type="number"
                  value={storyForm.displayOrder}
                  onChange={(e) =>
                    setStoryForm({ ...storyForm, displayOrder: parseInt(e.target.value) || 0 })
                  }
                  disabled={actionLoading}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddStoryDialogOpen(false);
                setStoryForm(INITIAL_STORY_FORM);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddStory} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Story'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Success Story Dialog */}
      <Dialog
        open={editStoryDialogOpen}
        onOpenChange={(open) => {
          setEditStoryDialogOpen(open);
          if (!open) {
            setEditingTestimonial(null);
            setStoryForm(INITIAL_STORY_FORM);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Success Story</DialogTitle>
            <DialogDescription>Update the success story details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Student Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={storyForm.name}
                  onChange={(e) => setStoryForm({ ...storyForm, name: e.target.value })}
                  placeholder="Enter student name"
                  disabled={actionLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-avatar">Avatar (Initials)</Label>
                <Input
                  id="edit-avatar"
                  value={storyForm.avatar}
                  onChange={(e) => setStoryForm({ ...storyForm, avatar: e.target.value })}
                  placeholder="AP"
                  maxLength={10}
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">
                Role/Achievement <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-role"
                value={storyForm.role}
                onChange={(e) => setStoryForm({ ...storyForm, role: e.target.value })}
                placeholder="e.g., UPSC CSE 2024 - AIR 45"
                disabled={actionLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">
                Success Story <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-content"
                value={storyForm.content}
                onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                placeholder="Write the success story..."
                rows={6}
                disabled={actionLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rating">Rating</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  min={1}
                  max={5}
                  value={storyForm.rating}
                  onChange={(e) =>
                    setStoryForm({ ...storyForm, rating: parseInt(e.target.value) || 1 })
                  }
                  disabled={actionLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-order">Display Order</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={storyForm.displayOrder}
                  onChange={(e) =>
                    setStoryForm({ ...storyForm, displayOrder: parseInt(e.target.value) || 0 })
                  }
                  disabled={actionLoading}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditStoryDialogOpen(false);
                setEditingTestimonial(null);
                setStoryForm(INITIAL_STORY_FORM);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEditStory} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Story'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteType === 'feedback' ? 'Feedback' : 'Testimonial'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteType}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
