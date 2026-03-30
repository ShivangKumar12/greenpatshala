// client/src/pages/admin/components/ModulesManagement.tsx - PRODUCTION READY - FIXED
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Plus, Edit, Trash2, Video, FileText, BookOpen,
  Save, Loader2, Youtube, Unlock, AlertCircle, Upload
} from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import FileUpload from '@/components/upload/FileUpload';
import apiClient from '@/lib/axios'; // ✅ ADDED

interface Lesson {
  id: number;
  moduleId: number;
  courseId: number;
  title: string;
  description: string | null;
  contentType: 'video' | 'pdf' | 'text';
  videoUrl: string | null;
  pdfUrl: string | null;
  textContent: string | null;
  duration: number | null;
  orderIndex: number;
  isFree: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: number;
  title: string;
}

export default function ModulesManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // State
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dialogs
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isDeleteLessonDialogOpen, setIsDeleteLessonDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Enhanced lesson form with source selection
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    contentType: 'video' as 'video' | 'pdf' | 'text',
    
    // Video fields
    videoSource: 'youtube' as 'youtube' | 'upload',
    videoUrl: '',
    videoFile: null as File | null,
    uploadedVideoUrl: '',
    
    // PDF fields
    pdfSource: 'url' as 'url' | 'upload',
    pdfUrl: '',
    pdfFile: null as File | null,
    uploadedPdfUrl: '',
    
    textContent: '',
    duration: '',
    isFree: false,
    isPublished: true,
    moduleId: 1,
  });

  // ✅ FETCH LESSONS - FIXED with apiClient
  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get(`/admin/lessons/course/${courseId}`); // ✅ CHANGED

      if (response.data.success) {
        setLessons(response.data.data || []);
      } else {
        setLessons([]);
      }
    } catch (error: any) {
      console.error('[FETCH LESSONS ERROR]', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load lessons',
        variant: 'destructive',
      });
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  // ✅ FETCH COURSE - FIXED with apiClient
  const fetchCourse = useCallback(async () => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`); // ✅ CHANGED
      if (response.data.success) {
        setCourse(response.data.course);
      }
    } catch (error) {
      console.error('[FETCH COURSE ERROR]', error);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchLessons();
    }
  }, [courseId, fetchCourse, fetchLessons]);

  // Reset form
  const resetLessonForm = () => {
    setLessonFormData({
      title: '',
      description: '',
      contentType: 'video',
      videoSource: 'youtube',
      videoUrl: '',
      videoFile: null,
      uploadedVideoUrl: '',
      pdfSource: 'url',
      pdfUrl: '',
      pdfFile: null,
      uploadedPdfUrl: '',
      textContent: '',
      duration: '',
      isFree: false,
      isPublished: true,
      moduleId: 1,
    });
    setSelectedLesson(null);
  };

  // Dialog openers
  const openAddLessonDialog = () => {
    resetLessonForm();
    setIsLessonDialogOpen(true);
  };

  const openEditLessonDialog = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    
    // Determine source type based on URL
    const isYouTubeVideo = lesson.videoUrl?.includes('youtube.com') || lesson.videoUrl?.includes('youtu.be');
    const isUploadedVideo = lesson.videoUrl?.startsWith('/uploads/');
    const isExternalPdf = lesson.pdfUrl && !lesson.pdfUrl.startsWith('/uploads/');
    
    setLessonFormData({
      title: lesson.title,
      description: lesson.description || '',
      contentType: lesson.contentType,
      
      videoSource: isYouTubeVideo ? 'youtube' : 'upload',
      videoUrl: isYouTubeVideo ? lesson.videoUrl || '' : '',
      videoFile: null,
      uploadedVideoUrl: isUploadedVideo ? lesson.videoUrl || '' : '',
      
      pdfSource: isExternalPdf ? 'url' : 'upload',
      pdfUrl: isExternalPdf ? lesson.pdfUrl || '' : '',
      pdfFile: null,
      uploadedPdfUrl: lesson.pdfUrl?.startsWith('/uploads/') ? lesson.pdfUrl : '',
      
      textContent: lesson.textContent || '',
      duration: lesson.duration?.toString() || '',
      isFree: lesson.isFree,
      isPublished: lesson.isPublished,
      moduleId: lesson.moduleId,
    });
    setIsLessonDialogOpen(true);
  };

  // ✅ UPLOAD VIDEO - FIXED with apiClient
  const handleVideoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await apiClient.post('/admin/lessons/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }); // ✅ CHANGED

      if (response.data.success) {
        setLessonFormData(prev => ({
          ...prev,
          uploadedVideoUrl: response.data.data.videoUrl,
          videoFile: file,
        }));
        toast({
          title: '✅ Video uploaded',
          description: 'Video file uploaded successfully',
        });
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('[VIDEO UPLOAD ERROR]', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || error.message || 'Failed to upload video',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // ✅ UPLOAD PDF - FIXED with apiClient
  const handlePDFUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await apiClient.post('/admin/lessons/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }); // ✅ CHANGED

      if (response.data.success) {
        setLessonFormData(prev => ({
          ...prev,
          uploadedPdfUrl: response.data.data.pdfUrl,
          pdfFile: file,
        }));
        toast({
          title: '✅ PDF uploaded',
          description: 'PDF file uploaded successfully',
        });
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('[PDF UPLOAD ERROR]', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || error.message || 'Failed to upload PDF',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // ✅ CREATE/UPDATE LESSON - FIXED with apiClient
  const handleSaveLesson = async () => {
    try {
      // Validation
      if (!lessonFormData.title.trim()) {
        toast({ title: 'Error', description: 'Title is required', variant: 'destructive' });
        return;
      }

      // Content validation based on type and source
      if (lessonFormData.contentType === 'video') {
        if (lessonFormData.videoSource === 'youtube' && !lessonFormData.videoUrl.trim()) {
          toast({ title: 'Error', description: 'YouTube URL required', variant: 'destructive' });
          return;
        }
        if (lessonFormData.videoSource === 'upload' && !lessonFormData.uploadedVideoUrl) {
          toast({ title: 'Error', description: 'Please upload a video file', variant: 'destructive' });
          return;
        }
      }

      if (lessonFormData.contentType === 'pdf') {
        if (lessonFormData.pdfSource === 'url' && !lessonFormData.pdfUrl.trim()) {
          toast({ title: 'Error', description: 'PDF URL required', variant: 'destructive' });
          return;
        }
        if (lessonFormData.pdfSource === 'upload' && !lessonFormData.uploadedPdfUrl) {
          toast({ title: 'Error', description: 'Please upload a PDF file', variant: 'destructive' });
          return;
        }
      }

      if (lessonFormData.contentType === 'text' && !lessonFormData.textContent.trim()) {
        toast({ title: 'Error', description: 'Text content required', variant: 'destructive' });
        return;
      }

      setSubmitting(true);

      // Build lesson data
      const lessonData: any = {
        courseId: Number(courseId),
        title: lessonFormData.title,
        description: lessonFormData.description || null,
        contentType: lessonFormData.contentType,
        duration: lessonFormData.duration ? parseInt(lessonFormData.duration) : null,
        moduleId: lessonFormData.moduleId,
        isFree: lessonFormData.isFree,
        isPublished: lessonFormData.isPublished,
      };

      // Set content URL based on type and source
      if (lessonFormData.contentType === 'video') {
        lessonData.videoUrl = lessonFormData.videoSource === 'youtube' 
          ? lessonFormData.videoUrl 
          : lessonFormData.uploadedVideoUrl;
      } else if (lessonFormData.contentType === 'pdf') {
        lessonData.pdfUrl = lessonFormData.pdfSource === 'url' 
          ? lessonFormData.pdfUrl 
          : lessonFormData.uploadedPdfUrl;
      } else if (lessonFormData.contentType === 'text') {
        lessonData.textContent = lessonFormData.textContent;
      }

      // ✅ CHANGED - using apiClient
      let response;
      if (selectedLesson) {
        response = await apiClient.put(`/admin/lessons/${selectedLesson.id}`, lessonData);
      } else {
        response = await apiClient.post('/admin/lessons', lessonData);
      }

      if (response.data.success) {
        toast({
          title: selectedLesson ? '✅ Updated!' : '✅ Created!',
          description: `Lesson "${lessonFormData.title}" ${selectedLesson ? 'updated' : 'created'} successfully`,
        });
        setIsLessonDialogOpen(false);
        resetLessonForm();
        fetchLessons();
      } else {
        throw new Error(response.data.message || 'Operation failed');
      }
    } catch (error: any) {
      console.error('[SAVE LESSON ERROR]', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save lesson',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ DELETE LESSON - FIXED with apiClient
  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;

    try {
      setSubmitting(true);

      const response = await apiClient.delete(`/admin/lessons/${selectedLesson.id}`); // ✅ CHANGED

      if (response.data.success) {
        toast({
          title: '✅ Deleted!',
          description: `"${selectedLesson.title}" removed successfully`,
        });
        setIsDeleteLessonDialogOpen(false);
        setSelectedLesson(null);
        fetchLessons();
      } else {
        throw new Error(response.data.message || 'Delete failed');
      }
    } catch (error: any) {
      console.error('[DELETE LESSON ERROR]', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to delete lesson',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Group lessons by module
  const lessonsByModule = useMemo(() => {
    const map = new Map<number, Lesson[]>();
    lessons.forEach(lesson => {
      if (!map.has(lesson.moduleId)) map.set(lesson.moduleId, []);
      map.get(lesson.moduleId)!.push(lesson);
    });
    return Array.from(map.entries()).map(([moduleId, lessons]) => ({
      moduleId,
      lessons: lessons.sort((a, b) => a.orderIndex - b.orderIndex),
    }));
  }, [lessons]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 container mx-auto px-4">
      {/* HEADER */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2 hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold">
                {course?.title || 'Course'} - Content Management
              </CardTitle>
              <CardDescription className="mt-1">
                Manage modules & lessons ({lessons.length} lessons total)
              </CardDescription>
            </div>
            <Button onClick={openAddLessonDialog} className="gap-2 shadow-lg">
              <Plus className="w-4 h-4" />
              Add New Lesson
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* LESSONS GRID */}
      {lessonsByModule.length === 0 ? (
        <Card className="text-center py-16">
          <BookOpen className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-60" />
          <h3 className="text-2xl font-semibold mb-2 text-muted-foreground">No Lessons Yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start building your course by adding your first lesson. Upload videos, PDFs, or add text content.
          </p>
          <Button onClick={openAddLessonDialog} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create First Lesson
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {lessonsByModule.map(({ moduleId, lessons }) => (
            <Card key={moduleId} className="shadow-sm border-0 hover:shadow-md transition-all">
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      Module {moduleId}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {lessons.length} lessons •{' '}
                      <span className="text-green-600 font-medium">
                        {lessons.filter(l => l.isFree).length} free previews
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openAddLessonDialog}
                    className="gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add Lesson
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="group flex items-center justify-between p-4 hover:bg-accent/50 rounded-xl border transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Content Type Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        {lesson.contentType === 'video' && (
                          <Video className="w-5 h-5 text-blue-500" />
                        )}
                        {lesson.contentType === 'pdf' && (
                          <FileText className="w-5 h-5 text-red-500" />
                        )}
                        {lesson.contentType === 'text' && (
                          <BookOpen className="w-5 h-5 text-green-500" />
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm">{index + 1}.</span>
                          <p className="font-semibold text-base truncate">{lesson.title}</p>
                          {lesson.isFree && (
                            <Badge variant="outline" className="text-xs bg-green-50 border-green-200">
                              <Unlock className="w-3 h-3 mr-1" />
                              Free
                            </Badge>
                          )}
                          {!lesson.isPublished && (
                            <Badge variant="secondary" className="text-xs">
                              Draft
                            </Badge>
                          )}
                          {/* Show source indicator */}
                          {lesson.contentType === 'video' && (
                            <Badge variant="outline" className="text-xs">
                              {lesson.videoUrl?.includes('youtube') ? '▶ YouTube' : '📹 Uploaded'}
                            </Badge>
                          )}
                          {lesson.contentType === 'pdf' && (
                            <Badge variant="outline" className="text-xs">
                              {lesson.pdfUrl?.startsWith('/uploads/') ? '📄 Uploaded' : '🔗 External'}
                            </Badge>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground truncate">{lesson.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Meta & Actions */}
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      {lesson.duration && (
                        <Badge variant="outline" className="text-xs">
                          {lesson.duration}min
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-accent"
                          onClick={() => openEditLessonDialog(lesson)}
                          title="Edit lesson"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setIsDeleteLessonDialogOpen(true);
                          }}
                          title="Delete lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* LESSON FORM DIALOG */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? 'Edit Lesson' : 'Create New Lesson'}
            </DialogTitle>
            <DialogDescription>
              {selectedLesson 
                ? 'Update lesson details below' 
                : 'Add content from YouTube, upload videos/PDFs, or write text lessons'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[60vh] overflow-y-auto space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label>
                Lesson Title <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g., Introduction to Indian Polity"
                value={lessonFormData.title}
                onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                className="text-lg"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Brief description of what students will learn..."
                value={lessonFormData.description}
                onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <Label>Content Type <span className="text-red-500">*</span></Label>
              <Select
                value={lessonFormData.contentType}
                onValueChange={(value: 'video' | 'pdf' | 'text') =>
                  setLessonFormData({ ...lessonFormData, contentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-3 p-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Video className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Video Lesson</p>
                        <p className="text-xs text-muted-foreground">YouTube or Upload</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-3 p-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">PDF Document</p>
                        <p className="text-xs text-muted-foreground">URL or Upload</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="text">
                    <div className="flex items-center gap-3 p-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Text Content</p>
                        <p className="text-xs text-muted-foreground">Written lessons</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* VIDEO SOURCE SELECTION */}
            {lessonFormData.contentType === 'video' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label>Video Source <span className="text-red-500">*</span></Label>
                  <Select
                    value={lessonFormData.videoSource}
                    onValueChange={(value: 'youtube' | 'upload') =>
                      setLessonFormData({ ...lessonFormData, videoSource: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">
                        <div className="flex items-center gap-2">
                          <Youtube className="w-4 h-4 text-red-600" />
                          <span>YouTube URL</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="upload">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>Upload Video File</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* YouTube URL Input */}
                {lessonFormData.videoSource === 'youtube' && (
                  <div className="space-y-3">
                    <Label>YouTube URL <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                      value={lessonFormData.videoUrl}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, videoUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Youtube className="w-4 h-4" />
                      Students see video without controls (admin preview has controls)
                    </p>
                    {lessonFormData.videoUrl && (
                      <div className="mt-3 p-3 bg-background border rounded-lg">
                        <p className="text-xs font-medium mb-2 text-green-600 flex items-center gap-1">
                          <span>✅ Preview:</span>
                        </p>
                        <VideoPlayer videoUrl={lessonFormData.videoUrl} controls={true} />
                      </div>
                    )}
                  </div>
                )}

                {/* Video File Upload */}
                {lessonFormData.videoSource === 'upload' && (
                  <div className="space-y-3">
                    <Label>Upload Video File <span className="text-red-500">*</span></Label>
                    <FileUpload
                      accept="video/*"
                      maxSize={500}
                      onUpload={handleVideoUpload}
                      label="Upload Video"
                      description="MP4, AVI, MOV, WebM (Max 500MB)"
                      uploadedFileUrl={lessonFormData.uploadedVideoUrl}
                      uploadedFileName={lessonFormData.videoFile?.name}
                    />
                    <p className="text-xs text-muted-foreground">
                      Uploaded videos are stored securely and served to students with restricted controls
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PDF SOURCE SELECTION */}
            {lessonFormData.contentType === 'pdf' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label>PDF Source <span className="text-red-500">*</span></Label>
                  <Select
                    value={lessonFormData.pdfSource}
                    onValueChange={(value: 'url' | 'upload') =>
                      setLessonFormData({ ...lessonFormData, pdfSource: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>External URL</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="upload">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-red-600" />
                          <span>Upload PDF File</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* PDF URL Input */}
                {lessonFormData.pdfSource === 'url' && (
                  <div className="space-y-3">
                    <Label>PDF URL <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="https://drive.google.com/file/... or direct PDF link"
                      value={lessonFormData.pdfUrl}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, pdfUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Direct link to PDF (Google Drive, Dropbox, or your server)
                    </p>
                  </div>
                )}

                {/* PDF File Upload */}
                {lessonFormData.pdfSource === 'upload' && (
                  <div className="space-y-3">
                    <Label>Upload PDF File <span className="text-red-500">*</span></Label>
                    <FileUpload
                      accept="application/pdf"
                      maxSize={100}
                      onUpload={handlePDFUpload}
                      label="Upload PDF"
                      description="PDF documents only (Max 100MB)"
                      uploadedFileUrl={lessonFormData.uploadedPdfUrl}
                      uploadedFileName={lessonFormData.pdfFile?.name}
                    />
                    <p className="text-xs text-muted-foreground">
                      PDF files are stored securely and can be viewed by enrolled students
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Text Content */}
            {lessonFormData.contentType === 'text' && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <Label>
                  Lesson Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Write your complete lesson content here..."
                  value={lessonFormData.textContent}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, textContent: e.target.value })}
                  rows={12}
                  className="min-h-[250px] font-light"
                />
              </div>
            )}

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min="1"
                max="300"
                placeholder="45"
                value={lessonFormData.duration}
                onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
              />
            </div>

            {/* Publish Settings */}
            <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-background rounded-lg">
                <Checkbox
                  id="is-free"
                  checked={lessonFormData.isFree}
                  onCheckedChange={(checked) => setLessonFormData({ ...lessonFormData, isFree: !!checked })}
                />
                <div className="space-y-1">
                  <Label htmlFor="is-free" className="text-base font-medium cursor-pointer">
                    Free Preview Lesson
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow non-enrolled students to preview this lesson
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-background rounded-lg">
                <Checkbox
                  id="is-published"
                  checked={lessonFormData.isPublished}
                  onCheckedChange={(checked) => setLessonFormData({ ...lessonFormData, isPublished: !!checked })}
                />
                <div className="space-y-1">
                  <Label htmlFor="is-published" className="text-base font-medium cursor-pointer">
                    Published
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Make this lesson visible to enrolled students
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t bg-background/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsLessonDialogOpen(false);
                resetLessonForm();
              }}
              disabled={submitting}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={submitting || !lessonFormData.title.trim()}
              className="px-8 gap-2 shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {selectedLesson ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {selectedLesson ? 'Update Lesson' : 'Create Lesson'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog open={isDeleteLessonDialogOpen} onOpenChange={setIsDeleteLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Delete Lesson
            </DialogTitle>
            <DialogDescription className="text-lg">
              Are you sure you want to delete <strong>"{selectedLesson?.title}"</strong>?
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                This action cannot be undone and will permanently remove the lesson and any uploaded files.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteLessonDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLesson}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Lesson
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
