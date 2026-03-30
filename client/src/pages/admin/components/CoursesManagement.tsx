// client/src/pages/admin/components/CoursesManagement.tsx - PRODUCTION READY WITH THUMBNAIL UPLOAD - FIXED
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Users,
  MoreVertical,
  Star,
  Play,
  DollarSign,
  Gift,
  Loader2,
  Settings,
  BarChart3,
  Upload,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  getAdminCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
  toggleFeatured,
  toggleFree,
  updateCoursePricing,
} from '@/services/adminCoursesApi';
import VideoPlayer from '@/components/VideoPlayer';
import LogoPlaceholder from '@/components/LogoPlaceholder';
import FileUpload from '@/components/upload/FileUpload';
import apiClient from '@/lib/axios'; // ✅ ADDED

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  videoUrl?: string | null;
  instructorId: number;
  category: string;
  level: string;
  duration: string;
  language: string;
  originalPrice: number;
  discountPrice: number | null;
  isFree: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  certificateEligible?: boolean;
  totalLessons: number;
  totalStudents: number;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export default function CoursesManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // States
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pricing form
  const [pricingData, setPricingData] = useState({
    originalPrice: '',
    discountPrice: '',
    isFree: false,
  });

  // ✅ ENHANCED FORM DATA WITH THUMBNAIL UPLOAD
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailSource: 'url' as 'url' | 'upload',
    thumbnail: '',
    thumbnailFile: null as File | null,
    uploadedThumbnailUrl: '',
    videoUrl: '',
    category: '',
    level: 'Beginner',
    duration: '',
    language: 'Hindi & English',
    originalPrice: '',
    discountPrice: '',
    isFree: false,
    isFeatured: false,
    certificateEligible: false,
  });

  // ✅ FETCH COURSES WITH DEBOUNCE
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      const response = await getAdminCourses(filters);
      setCourses(response.courses || []);
    } catch (error: any) {
      console.error('[FETCH COURSES ERROR]', error);
      toast({
        title: 'Error Loading Courses',
        description: error.response?.data?.message || 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, statusFilter, toast]);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchCourses(), 300);
    return () => clearTimeout(timeoutId);
  }, [fetchCourses]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      thumbnailSource: 'url',
      thumbnail: '',
      thumbnailFile: null,
      uploadedThumbnailUrl: '',
      videoUrl: '',
      category: '',
      level: 'Beginner',
      duration: '',
      language: 'Hindi & English',
      originalPrice: '',
      discountPrice: '',
      isFree: false,
      isFeatured: false,
      certificateEligible: false,
    });
  };

  // ✅ THUMBNAIL UPLOAD HANDLER - FIXED with apiClient
  const handleThumbnailUpload = async (file: File) => {
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('thumbnail', file);

      const response = await apiClient.post('/admin/courses/upload-thumbnail', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }); // ✅ CHANGED - using apiClient instead of fetch

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          uploadedThumbnailUrl: response.data.data.thumbnailUrl,
          thumbnailFile: file,
        }));
        toast({
          title: '✅ Thumbnail uploaded',
          description: 'Thumbnail image uploaded successfully',
        });
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('[THUMBNAIL UPLOAD ERROR]', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || error.message || 'Failed to upload thumbnail',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);

    // ✅ Detect thumbnail source
    const isUploadedThumbnail = course.thumbnail?.startsWith('/uploads/');

    setFormData({
      title: course.title,
      description: course.description,
      thumbnailSource: isUploadedThumbnail ? 'upload' : 'url',
      thumbnail: !isUploadedThumbnail ? course.thumbnail || '' : '',
      thumbnailFile: null,
      uploadedThumbnailUrl: isUploadedThumbnail ? course.thumbnail || '' : '',
      videoUrl: course.videoUrl || '',
      category: course.category,
      level: course.level,
      duration: course.duration,
      language: course.language,
      originalPrice: course.originalPrice.toString(),
      discountPrice: course.discountPrice?.toString() || '',
      isFree: course.isFree,
      isFeatured: course.isFeatured,
      certificateEligible: course.certificateEligible || false,
    });
    setIsEditDialogOpen(true);
  };

  const openPricingDialog = (course: Course) => {
    setSelectedCourse(course);
    setPricingData({
      originalPrice: course.originalPrice.toString(),
      discountPrice: course.discountPrice?.toString() || '',
      isFree: course.isFree,
    });
    setIsPricingDialogOpen(true);
  };

  const openDeleteDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const openModuleManagement = (course: Course) => {
    navigate(`/admin/courses/${course.id}/modules`);
  };

  // ✅ CREATE COURSE
  const handleAddCourse = async () => {
    try {
      if (!formData.title || !formData.description || !formData.category || !formData.originalPrice) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields (*)',
          variant: 'destructive',
        });
        return;
      }

      setSubmitting(true);

      const courseData = {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnailSource === 'url'
          ? formData.thumbnail || null
          : formData.uploadedThumbnailUrl || null,
        videoUrl: formData.videoUrl || null,
        category: formData.category,
        level: formData.level,
        duration: formData.duration || 'Self-paced',
        language: formData.language,
        originalPrice: parseFloat(formData.originalPrice) || 0,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        isFree: formData.isFree,
        isFeatured: formData.isFeatured,
        certificateEligible: formData.certificateEligible,
      };

      await createCourse(courseData);
      toast({
        title: 'Course Created! 🎉',
        description: 'Course created successfully. Add modules and lessons next.'
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      console.error('[CREATE COURSE ERROR]', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create course',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ UPDATE COURSE - SUPPORTS THUMBNAIL UPLOAD
  const handleEditCourse = async () => {
    if (!selectedCourse) return;
    try {
      setSubmitting(true);

      // ✅ If thumbnail file was uploaded, use FormData
      if (formData.thumbnailFile) {
        console.log('[EDIT COURSE] Thumbnail file detected, sending FormData');

        const formDataUpload = new FormData();

        // Append the thumbnail file
        formDataUpload.append('thumbnail', formData.thumbnailFile);

        // Append all other course data as form fields
        formDataUpload.append('title', formData.title);
        formDataUpload.append('description', formData.description);
        formDataUpload.append('category', formData.category);
        formDataUpload.append('level', formData.level);
        formDataUpload.append('duration', formData.duration);
        formDataUpload.append('language', formData.language);
        formDataUpload.append('originalPrice', formData.originalPrice);
        formDataUpload.append('discountPrice', formData.discountPrice || '');
        formDataUpload.append('isFree', String(formData.isFree));
        formDataUpload.append('isFeatured', String(formData.isFeatured));
        formDataUpload.append('certificateEligible', String(formData.certificateEligible));

        if (formData.videoUrl) {
          formDataUpload.append('videoUrl', formData.videoUrl);
        }

        await updateCourse(selectedCourse.id, formDataUpload);

        toast({
          title: 'Success ✅',
          description: 'Course and thumbnail updated successfully!'
        });
      } else {
        // ✅ Regular JSON update (no new file)
        console.log('[EDIT COURSE] No file upload, sending JSON');

        const updateData = {
          title: formData.title,
          description: formData.description,
          thumbnail: formData.thumbnailSource === 'url'
            ? formData.thumbnail || null
            : formData.uploadedThumbnailUrl || null,
          videoUrl: formData.videoUrl || null,
          category: formData.category,
          level: formData.level,
          duration: formData.duration,
          language: formData.language,
          originalPrice: parseFloat(formData.originalPrice) || 0,
          discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
          isFree: formData.isFree,
          isFeatured: formData.isFeatured,
          certificateEligible: formData.certificateEligible,
        };

        await updateCourse(selectedCourse.id, updateData);

        toast({
          title: 'Success',
          description: 'Course updated successfully!'
        });
      }

      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      console.error('[UPDATE COURSE ERROR]', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update course',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };


  // ✅ DELETE COURSE
  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    try {
      setSubmitting(true);
      await deleteCourse(selectedCourse.id);
      toast({ title: 'Deleted', description: 'Course deleted successfully!' });
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error: any) {
      console.error('[DELETE COURSE ERROR]', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete course',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ TOGGLE ACTIONS
  const handleTogglePublish = async (course: Course) => {
    try {
      await togglePublish(course.id);
      toast({
        title: course.isPublished ? 'Unpublished' : 'Published',
        description: `Course ${course.isPublished ? 'unpublished' : 'published'} successfully`,
      });
      fetchCourses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle status',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFeatured = async (course: Course) => {
    try {
      await toggleFeatured(course.id);
      toast({
        title: course.isFeatured ? 'Removed from Featured' : 'Marked as Featured',
        description: `Course ${course.isFeatured ? 'removed from featured' : 'marked as featured'}`,
      });
      fetchCourses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle featured',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFree = async (course: Course) => {
    try {
      await toggleFree(course.id);
      toast({
        title: course.isFree ? 'Marked as Paid' : 'Marked as Free',
        description: `Course ${course.isFree ? 'marked as paid' : 'marked as free'}`,
      });
      fetchCourses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle free status',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePricing = async () => {
    if (!selectedCourse) return;
    try {
      setSubmitting(true);
      await updateCoursePricing(selectedCourse.id, {
        originalPrice: parseFloat(pricingData.originalPrice) || 0,
        discountPrice: pricingData.discountPrice ? parseFloat(pricingData.discountPrice) : null,
        isFree: pricingData.isFree,
      });
      toast({ title: 'Success', description: 'Pricing updated successfully!' });
      setIsPricingDialogOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update pricing',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ FILTERED COURSES
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && course.isPublished) ||
        (statusFilter === 'draft' && !course.isPublished);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchQuery, categoryFilter, statusFilter]);

  // ✅ COURSE FORM FIELDS
  const CourseFormFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          Course Title <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="e.g., UPSC Foundation Course 2025"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          placeholder="Comprehensive course description..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      {/* ✅ ENHANCED THUMBNAIL SECTION WITH UPLOAD */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div className="space-y-2">
          <Label>Thumbnail Source</Label>
          <Select
            value={formData.thumbnailSource}
            onValueChange={(value: 'url' | 'upload') =>
              setFormData({ ...formData, thumbnailSource: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="url">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>External URL</span>
                </div>
              </SelectItem>
              <SelectItem value="upload">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-green-600" />
                  <span>Upload Image</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* URL Input */}
        {formData.thumbnailSource === 'url' && (
          <div className="space-y-3">
            <Label>Thumbnail URL (Optional)</Label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default logo. Recommended: 16:9 aspect ratio
            </p>

            {/* Preview */}
            <div className="mt-2 border rounded-lg overflow-hidden aspect-video">
              {formData.thumbnail ? (
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted"><p class="text-muted-foreground text-sm">Invalid URL</p></div>';
                    }
                  }}
                />
              ) : (
                <LogoPlaceholder className="w-full h-full" title={formData.title || 'Course'} />
              )}
            </div>
          </div>
        )}

        {/* File Upload */}
        {formData.thumbnailSource === 'upload' && (
          <div className="space-y-3">
            <Label>Upload Thumbnail Image</Label>
            <FileUpload
              accept="image/*"
              maxSize={5}
              onUpload={handleThumbnailUpload}
              label="Upload Thumbnail"
              description="JPG, PNG, WebP (Max 5MB, Recommended: 1280x720px)"
              uploadedFileUrl={formData.uploadedThumbnailUrl}
              uploadedFileName={formData.thumbnailFile?.name}
              showPreview={true}
            />
            <p className="text-xs text-muted-foreground">
              High-quality images improve course appeal. Use 16:9 aspect ratio for best results.
            </p>
          </div>
        )}
      </div>

      {/* Video URL */}
      <div className="space-y-2">
        <Label>Course Intro Video (YouTube URL - Optional)</Label>
        <Input
          placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
          value={formData.videoUrl}
          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          YouTube video for course preview. Students will NOT be able to control playback.
        </p>

        {/* Video Preview */}
        {formData.videoUrl && (
          <div className="mt-2 space-y-2">
            <p className="text-xs font-medium text-green-600">
              ✓ Preview (Admin view with controls):
            </p>
            <VideoPlayer videoUrl={formData.videoUrl} controls={true} />
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Students will see this video WITHOUT controls.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UPSC">UPSC</SelectItem>
              <SelectItem value="SSC">SSC</SelectItem>
              <SelectItem value="Banking">Banking</SelectItem>
              <SelectItem value="Railway">Railway</SelectItem>
              <SelectItem value="State PSC">State PSC</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Level</Label>
          <Select
            value={formData.level}
            onValueChange={(value) => setFormData({ ...formData, level: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duration</Label>
          <Input
            placeholder="e.g., 6 months"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Language</Label>
          <Input
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Original Price (₹) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g., 9999.00"
            value={formData.originalPrice}
            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Discount Price (₹)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g., 7999.00"
            value={formData.discountPrice}
            onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-6 p-3 bg-muted rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isFree"
            checked={formData.isFree}
            onCheckedChange={(checked) => setFormData({ ...formData, isFree: !!checked })}
          />
          <Label htmlFor="isFree" className="cursor-pointer font-medium">
            Free Course
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: !!checked })}
          />
          <Label htmlFor="isFeatured" className="cursor-pointer font-medium">
            Featured
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="certificateEligible"
            checked={formData.certificateEligible}
            onCheckedChange={(checked) => setFormData({ ...formData, certificateEligible: !!checked })}
          />
          <Label htmlFor="certificateEligible" className="cursor-pointer font-medium">
            🎓 Certificate Available
          </Label>
        </div>
      </div>
    </div>
  );

  // ✅ LOADING STATE
  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-xl">Courses Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all courses ({courses.length} total, {filteredCourses.length} shown)
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>Fill all required fields marked with *</DialogDescription>
              </DialogHeader>
              <CourseFormFields />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddCourse} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Course'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title, description..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="UPSC">UPSC</SelectItem>
                  <SelectItem value="SSC">SSC</SelectItem>
                  <SelectItem value="Banking">Banking</SelectItem>
                  <SelectItem value="Railway">Railway</SelectItem>
                  <SelectItem value="State PSC">State PSC</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <Card className="col-span-full text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    {course.category}
                  </Badge>
                  <div className="flex gap-1 flex-wrap">
                    {course.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Star className="w-3 h-3 mr-1 fill-yellow-800" />
                        Featured
                      </Badge>
                    )}
                    {course.isFree && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Gift className="w-3 h-3 mr-1" />
                        Free
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Thumbnail or Logo */}
                {course.thumbnail ? (
                  <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-lg overflow-hidden">
                    <LogoPlaceholder className="w-full h-full" title={course.title} />
                  </div>
                )}

                <div className="space-y-1 mt-4">
                  <h3 className="font-bold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pb-4 space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course.totalStudents}
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <div className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {course.totalLessons} lessons
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {course.rating} ({course.totalReviews})
                  </div>
                </div>

                <div className="flex items-end justify-between pt-3 border-t">
                  <div className="space-y-1">
                    {course.isFree ? (
                      <span className="text-2xl font-bold text-green-600">FREE</span>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-xl font-bold text-primary">
                          ₹{(course.discountPrice || course.originalPrice).toFixed(2)}
                        </div>
                        {course.discountPrice && (
                          <div className="text-xs text-muted-foreground line-through">
                            ₹{course.originalPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge variant={course.isPublished ? 'default' : 'secondary'} className="text-xs px-3 py-1">
                    {course.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardContent>

              <CardContent className="pt-0 pb-4 space-y-2">
                {/* Primary Action - Manage Modules */}
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={() => openModuleManagement(course)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Modules & Lessons
                </Button>

                {/* Secondary Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <MoreVertical className="w-4 h-4 mr-2" />
                      More Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => openEditDialog(course)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Course Info
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openPricingDialog(course)} className="text-blue-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Update Pricing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/admin/courses/${course.id}/analytics`)} className="text-purple-600">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleTogglePublish(course)}
                      className={course.isPublished ? 'text-orange-600' : 'text-green-600'}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFeatured(course)} className="text-yellow-600">
                      <Star className="w-4 h-4 mr-2" />
                      {course.isFeatured ? 'Remove Featured' : 'Mark Featured'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFree(course)} className="text-green-600">
                      <Gift className="w-4 h-4 mr-2" />
                      {course.isFree ? 'Mark as Paid' : 'Mark as Free'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openDeleteDialog(course)} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course information</DialogDescription>
          </DialogHeader>
          <CourseFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEditCourse} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Course'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricing Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Pricing - {selectedCourse?.title}</DialogTitle>
            <DialogDescription>Update course pricing and free status</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Original Price (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 9999.00"
                value={pricingData.originalPrice}
                onChange={(e) => setPricingData({ ...pricingData, originalPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Discount Price (₹)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 7999.00"
                value={pricingData.discountPrice}
                onChange={(e) => setPricingData({ ...pricingData, discountPrice: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Leave empty if no discount</p>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <Checkbox
                id="isFree-pricing"
                checked={pricingData.isFree}
                onCheckedChange={(checked) => setPricingData({ ...pricingData, isFree: !!checked })}
              />
              <Label htmlFor="isFree-pricing" className="cursor-pointer font-medium">
                Mark this course as FREE
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPricingDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePricing} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Update Pricing
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be undone. All modules, lessons, and content will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Course
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
