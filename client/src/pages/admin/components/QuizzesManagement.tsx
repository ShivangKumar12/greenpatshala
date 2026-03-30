// client/src/pages/admin/components/QuizzesManagement.tsx
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QuestionManagement from './QuestionManagement';
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
  EyeOff,
  FileQuestion,
  Clock,
  Target,
  MoreVertical,
  Calendar,
  TrendingUp,
  DollarSign,
  Gift,
  BarChart3,
  Download,
  FileText,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getAdminQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublish,
  toggleFree,
  updateQuizPricing,
  exportQuizQuestions,
  exportQuizResults,
  type Quiz,
  type QuizFilters,
  formatPrice,
  formatDuration,
  getDifficultyColor,
} from '@/services/adminQuizApi';
import {
  getAdminSubjects,
  getAdminChapters,
  type TestSubject,
  type TestChapter,
} from '@/services/adminSubjectApi';
import { useAdminQuizLiveStatus } from '@/hooks/useAdminQuizLiveStatus';
import LiveStatusBadge from '@/components/quiz/LiveStatusBadge';

export default function QuizzesManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // States
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Real-time live status for all quizzes on current page
  const quizIds = quizzes.map((q) => q.id);
  const { liveStatus, isConnected: socketConnected } = useAdminQuizLiveStatus(quizIds);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState<Quiz | null>(null);

  // Subject/Chapter states
  const [subjects, setSubjects] = useState<TestSubject[]>([]);
  const [chapters, setChapters] = useState<TestChapter[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuizzes, setTotalQuizzes] = useState(0);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: '',
    difficulty: 'medium',
    duration: '',
    total_marks: '',
    passing_marks: '',
    price: '',
    discount_price: '',
    isFree: false,
    freeQuestionsCount: '0',
    course_id: '',
    subjectId: '',
    chapterId: '',
    is_scheduled: false,
    start_time: '',
    end_time: '',
    shuffle_questions: true,
    show_results: true,
    negativeMarking: false,
    negativeMarksPerQuestion: '',
    allowReview: true,
    showAnswerKey: true,
    certificateEligible: false,
    attemptsAllowed: '1',
  });

  // Pricing form
  const [pricingData, setPricingData] = useState({
    price: '',
    discount_price: '',
    isFree: false,
  });

  // Fetch subjects on mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await getAdminSubjects();
        if (res.success) setSubjects(res.subjects);
      } catch { /* ignore */ }
    };
    loadSubjects();
  }, []);

  // Fetch chapters when subject changes
  const fetchChaptersForSubject = useCallback(async (subjectId: string) => {
    if (!subjectId || subjectId === 'none') {
      setChapters([]);
      return;
    }
    try {
      const res = await getAdminChapters(Number(subjectId));
      if (res.success) setChapters(res.chapters);
    } catch { setChapters([]); }
  }, []);

  // Fetch quizzes
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const filters: QuizFilters = {
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      };

      const response = await getAdminQuizzes(filters);
      setQuizzes(response.quizzes);
      setTotalPages(response.pagination.totalPages);
      setTotalQuizzes(response.pagination.total);
    } catch (error: any) {
      console.error('Failed to fetch quizzes:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load quizzes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, categoryFilter, difficultyFilter, statusFilter, toast]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => fetchQuizzes(), 300);
    return () => clearTimeout(timeoutId);
  }, [fetchQuizzes]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      thumbnail: '',
      category: '',
      difficulty: 'medium',
      duration: '',
      total_marks: '',
      passing_marks: '',
      price: '',
      discount_price: '',
      isFree: false,
      freeQuestionsCount: '0',
      course_id: '',
      subjectId: '',
      chapterId: '',
      is_scheduled: false,
      start_time: '',

      end_time: '',
      shuffle_questions: true,
      show_results: true,
      negativeMarking: false,
      negativeMarksPerQuestion: '',
      allowReview: true,
      showAnswerKey: true,
      certificateEligible: false,
      attemptsAllowed: '1',
    });
  };

  // Open dialogs
  const openEditDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      thumbnail: quiz.thumbnail || '',
      category: quiz.category,
      difficulty: quiz.difficulty,
      duration: quiz.duration.toString(),
      total_marks: quiz.total_marks.toString(),
      passing_marks: quiz.passing_marks.toString(),
      price: quiz.price.toString(),
      discount_price: quiz.discount_price?.toString() || '',
      isFree: quiz.isFree,
      freeQuestionsCount: quiz.freeQuestionsCount?.toString() || '0',
      course_id: quiz.course_id?.toString() || '',
      subjectId: (quiz as any).subjectId?.toString() || (quiz as any).subject_id?.toString() || '',
      chapterId: (quiz as any).chapterId?.toString() || (quiz as any).chapter_id?.toString() || '',
      is_scheduled: quiz.is_scheduled === 1,
      start_time: quiz.start_time || '',
      end_time: quiz.end_time || '',
      shuffle_questions: quiz.shuffle_questions === 1,
      show_results: quiz.show_results === 1,
      negativeMarking: quiz.negativeMarking,
      negativeMarksPerQuestion: quiz.negativeMarksPerQuestion?.toString() || '',
      allowReview: quiz.allowReview,
      showAnswerKey: quiz.showAnswerKey,
      certificateEligible: quiz.certificateEligible,
      attemptsAllowed: quiz.attemptsAllowed?.toString() || '1',
    });
    // Load chapters for  the quiz's subject
    if ((quiz as any).subjectId || (quiz as any).subject_id) {
      fetchChaptersForSubject(((quiz as any).subjectId || (quiz as any).subject_id).toString());
    }
    setIsEditDialogOpen(true);
  };

  const openPricingDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setPricingData({
      price: quiz.price.toString(),
      discount_price: quiz.discount_price?.toString() || '',
      isFree: quiz.isFree,
    });
    setIsPricingDialogOpen(true);
  };

  const openDeleteDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteDialogOpen(true);
  };

  // CRUD Handlers
  const handleAddQuiz = async () => {
    try {
      if (!formData.title || !formData.category || !formData.difficulty ||
        !formData.duration || !formData.total_marks || !formData.passing_marks) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields (*)',
          variant: 'destructive',
        });
        return;
      }

      const quizData = {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnail || undefined,
        category: formData.category,
        difficulty: formData.difficulty,
        duration: parseInt(formData.duration),
        total_marks: parseInt(formData.total_marks),
        passing_marks: parseInt(formData.passing_marks),
        price: parseFloat(formData.price) || 0,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : undefined,
        isFree: formData.isFree,
        freeQuestionsCount: parseInt(formData.freeQuestionsCount) || 0,
        course_id: formData.course_id ? parseInt(formData.course_id) : undefined,
        subjectId: formData.subjectId && formData.subjectId !== 'none' ? parseInt(formData.subjectId) : undefined,
        chapterId: formData.chapterId && formData.chapterId !== 'none' ? parseInt(formData.chapterId) : undefined,
        is_scheduled: formData.is_scheduled,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        shuffle_questions: formData.shuffle_questions,
        show_results: formData.show_results,
        negativeMarking: formData.negativeMarking,
        negativeMarksPerQuestion: formData.negativeMarksPerQuestion ? parseFloat(formData.negativeMarksPerQuestion) : undefined,
        allowReview: formData.allowReview,
        showAnswerKey: formData.showAnswerKey,
        certificateEligible: formData.certificateEligible,
        attemptsAllowed: formData.attemptsAllowed ? parseInt(formData.attemptsAllowed) : undefined,
      };

      await createQuiz(quizData);
      toast({ title: 'Success', description: 'Quiz created successfully!' });
      setIsAddDialogOpen(false);
      resetForm();
      fetchQuizzes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create quiz',
        variant: 'destructive',
      });
    }
  };

  const handleEditQuiz = async () => {
    if (!selectedQuiz) return;
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnail || undefined,
        category: formData.category,
        difficulty: formData.difficulty,
        duration: parseInt(formData.duration),
        total_marks: parseInt(formData.total_marks),
        passing_marks: parseInt(formData.passing_marks),
        price: parseFloat(formData.price) || 0,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : undefined,
        isFree: formData.isFree,
        freeQuestionsCount: parseInt(formData.freeQuestionsCount) || 0,
        course_id: formData.course_id ? parseInt(formData.course_id) : undefined,
        subjectId: formData.subjectId && formData.subjectId !== 'none' ? parseInt(formData.subjectId) : undefined,
        chapterId: formData.chapterId && formData.chapterId !== 'none' ? parseInt(formData.chapterId) : undefined,
        is_scheduled: formData.is_scheduled,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        shuffle_questions: formData.shuffle_questions,
        show_results: formData.show_results,
        negativeMarking: formData.negativeMarking,
        negativeMarksPerQuestion: formData.negativeMarksPerQuestion ? parseFloat(formData.negativeMarksPerQuestion) : undefined,
        allowReview: formData.allowReview,
        showAnswerKey: formData.showAnswerKey,
        certificateEligible: formData.certificateEligible,
        attemptsAllowed: formData.attemptsAllowed ? parseInt(formData.attemptsAllowed) : undefined,
      };

      await updateQuiz(selectedQuiz.id, updateData);
      toast({ title: 'Success', description: 'Quiz updated successfully!' });
      setIsEditDialogOpen(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update quiz',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;
    try {
      await deleteQuiz(selectedQuiz.id);
      toast({ title: 'Success', description: 'Quiz deleted successfully!' });
      setIsDeleteDialogOpen(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete quiz',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    try {
      await togglePublish(quiz.id);
      toast({
        title: quiz.is_published ? 'Unpublished' : 'Published',
        description: `Quiz ${quiz.is_published ? 'unpublished' : 'published'} successfully`,
      });
      fetchQuizzes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle status',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFree = async (quiz: Quiz) => {
    try {
      await toggleFree(quiz.id);
      toast({
        title: quiz.isFree ? 'Marked as Paid' : 'Marked as Free',
        description: `Quiz ${quiz.isFree ? 'marked as paid' : 'marked as free'} successfully`,
      });
      fetchQuizzes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle free status',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePricing = async () => {
    if (!selectedQuiz) return;
    try {
      await updateQuizPricing(selectedQuiz.id, {
        price: parseFloat(pricingData.price) || 0,
        discount_price: pricingData.discount_price ? parseFloat(pricingData.discount_price) : undefined,
        isFree: pricingData.isFree,
      });
      toast({ title: 'Success', description: 'Pricing updated successfully!' });
      setIsPricingDialogOpen(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update pricing',
        variant: 'destructive',
      });
    }
  };

  const handleManageQuestions = (quiz: Quiz) => {
    setSelectedQuizForQuestions(quiz);
  };

  const handleViewStatistics = (quizId: number) => {
    navigate(`/admin/quizzes/${quizId}/statistics`);
  };

  const handleViewResults = (quizId: number) => {
    navigate(`/admin/quizzes/${quizId}/results`);
  };

  const handleExportQuestions = async (quiz: Quiz) => {
    try {
      toast({ title: 'Exporting...', description: 'Generating PDF...' });
      await exportQuizQuestions(quiz.id);
      toast({ title: 'Success', description: 'Questions exported successfully!' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to export questions',
        variant: 'destructive',
      });
    }
  };

  const handleExportResults = async (quiz: Quiz) => {
    try {
      toast({ title: 'Exporting...', description: 'Generating PDF...' });
      await exportQuizResults(quiz.id);
      toast({ title: 'Success', description: 'Results exported successfully!' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to export results',
        variant: 'destructive',
      });
    }
  };

  // If Question Management is open, show only that
  if (selectedQuizForQuestions) {
    return (
      <QuestionManagement
        quizId={selectedQuizForQuestions.id}
        quizTitle={selectedQuizForQuestions.title}
        onClose={() => {
          setSelectedQuizForQuestions(null);
          fetchQuizzes();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quizzes...</p>
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
            <CardTitle className="text-xl">Quizzes Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all quizzes ({totalQuizzes} total)
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
                <DialogDescription>Fill all required fields marked with *</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Basic Info */}
                <div className="space-y-2">
                  <Label>Quiz Title <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="e.g., UPSC Prelims Mock Test 2025"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the quiz content and topics"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  />
                </div>

                {/* Subject & Chapter */}
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Test Subject</Label>
                    <Select
                      value={formData.subjectId || 'none'}
                      onValueChange={(value) => {
                        setFormData({ ...formData, subjectId: value === 'none' ? '' : value, chapterId: '' });
                        fetchChaptersForSubject(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— No Subject —</SelectItem>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Assign to a subject to show on the Tests page</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Chapter</Label>
                    <Select
                      value={formData.chapterId || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, chapterId: value === 'none' ? '' : value })}
                      disabled={!formData.subjectId || formData.subjectId === 'none'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select chapter (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— No Chapter —</SelectItem>
                        {chapters.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category & Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category <span className="text-red-500">*</span></Label>
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
                    <Label>Difficulty <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Duration & Marks */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (min) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      placeholder="60"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Marks <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passing Marks <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      placeholder="40"
                      value={formData.passing_marks}
                      onChange={(e) => setFormData({ ...formData, passing_marks: e.target.value })}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="499"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      disabled={formData.isFree}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="399"
                      value={formData.discount_price}
                      onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                      disabled={formData.isFree}
                    />
                  </div>
                </div>

                {/* ✅ FREE PREVIEW QUESTIONS */}
                <div className="space-y-2 border-t pt-4">
                  <Label className="flex items-center gap-2">
                    Free Preview Questions
                    <span className="text-xs text-muted-foreground font-normal">
                      (0 = Fully paid, 5 = First 5 free)
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.freeQuestionsCount}
                    onChange={(e) => setFormData({ ...formData, freeQuestionsCount: e.target.value })}
                    disabled={formData.isFree}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Set how many questions students can preview for free before payment. Perfect for freemium strategy!
                  </p>
                  {!formData.isFree && parseInt(formData.freeQuestionsCount) > 0 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-xs text-orange-800">
                        <strong>Preview Mode:</strong> Students can attempt the first {formData.freeQuestionsCount} questions,
                        then must purchase to continue.
                      </p>
                    </div>
                  )}
                </div>

                {/* Negative Marks & Attempts */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Negative Marks</Label>
                    <Input
                      type="number"
                      step="0.25"
                      placeholder="0.25"
                      value={formData.negativeMarksPerQuestion}
                      onChange={(e) => setFormData({ ...formData, negativeMarksPerQuestion: e.target.value })}
                      disabled={!formData.negativeMarking}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Attempts Allowed</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={formData.attemptsAllowed}
                      onChange={(e) => setFormData({ ...formData, attemptsAllowed: e.target.value })}
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFree"
                      checked={formData.isFree}
                      onCheckedChange={(checked) => setFormData({ ...formData, isFree: !!checked })}
                    />
                    <Label htmlFor="isFree" className="cursor-pointer">Free Quiz</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="negativeMarking"
                      checked={formData.negativeMarking}
                      onCheckedChange={(checked) => setFormData({ ...formData, negativeMarking: !!checked })}
                    />
                    <Label htmlFor="negativeMarking" className="cursor-pointer">Negative Marking</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shuffleQuestions"
                      checked={formData.shuffle_questions}
                      onCheckedChange={(checked) => setFormData({ ...formData, shuffle_questions: !!checked })}
                    />
                    <Label htmlFor="shuffleQuestions" className="cursor-pointer">Shuffle Questions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showResults"
                      checked={formData.show_results}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_results: !!checked })}
                    />
                    <Label htmlFor="showResults" className="cursor-pointer">Show Results</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowReview"
                      checked={formData.allowReview}
                      onCheckedChange={(checked) => setFormData({ ...formData, allowReview: !!checked })}
                    />
                    <Label htmlFor="allowReview" className="cursor-pointer">Allow Review</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showAnswerKey"
                      checked={formData.showAnswerKey}
                      onCheckedChange={(checked) => setFormData({ ...formData, showAnswerKey: !!checked })}
                    />
                    <Label htmlFor="showAnswerKey" className="cursor-pointer">Show Answer Key</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="certificateEligible"
                      checked={formData.certificateEligible}
                      onCheckedChange={(checked) => setFormData({ ...formData, certificateEligible: !!checked })}
                    />
                    <Label htmlFor="certificateEligible" className="cursor-pointer">Certificate Eligible</Label>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="isScheduled"
                      checked={formData.is_scheduled}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_scheduled: !!checked })}
                    />
                    <Label htmlFor="isScheduled" className="cursor-pointer">
                      Schedule this quiz (live exam mode)
                    </Label>
                  </div>
                  {formData.is_scheduled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="datetime-local"
                          value={formData.start_time}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="datetime-local"
                          value={formData.end_time}
                          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleAddQuiz}>Create Quiz</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        {/* Filters */}
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
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
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No quizzes found</p>
            </CardContent>
          </Card>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">{quiz.category}</Badge>
                    <Badge className={`text-xs ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </Badge>
                    {quiz.isFree && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <Gift className="w-3 h-3 mr-1" />
                        Free
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => openEditDialog(quiz)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Quiz
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openPricingDialog(quiz)} className="text-blue-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Update Pricing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageQuestions(quiz)} className="text-purple-600">
                        <FileQuestion className="w-4 h-4 mr-2" />
                        Manage Questions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewStatistics(quiz.id)}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Statistics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewResults(quiz.id)}>
                        <Users className="w-4 h-4 mr-2" />
                        View Results
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleExportQuestions(quiz)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export Questions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportResults(quiz)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Results
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleTogglePublish(quiz)} className={quiz.is_published ? 'text-orange-600' : 'text-green-600'}>
                        {quiz.is_published ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {quiz.is_published ? 'Unpublish' : 'Publish'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleFree(quiz)} className="text-green-600">
                        <Gift className="w-4 h-4 mr-2" />
                        {quiz.isFree ? 'Mark as Paid' : 'Mark as Free'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openDeleteDialog(quiz)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Quiz
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {quiz.thumbnail ? (
                  <div className="w-full h-32 bg-muted rounded-lg overflow-hidden mb-4">
                    <img
                      src={quiz.thumbnail}
                      alt={quiz.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center mb-4">
                    <FileQuestion className="w-6 h-6 text-purple-600" />
                  </div>
                )}

                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {quiz.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {quiz.description}
                </p>

                {quiz.is_scheduled === 1 && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">Scheduled Quiz</span>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <FileQuestion className="w-4 h-4" />
                      Questions
                    </span>
                    <span className="font-medium">{quiz.questionCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Duration
                    </span>
                    <span className="font-medium">{formatDuration(quiz.duration)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Passing
                    </span>
                    <span className="font-medium">{quiz.passing_marks}/{quiz.total_marks}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Attempts
                    </span>
                    <span className="font-medium">{quiz.total_attempts.toLocaleString()}</span>
                  </div>

                  {/* ✅ FREE PREVIEW BADGE */}
                  {quiz.freeQuestionsCount > 0 && !quiz.isFree && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Gift className="w-4 h-4" />
                        Preview
                      </span>
                      <span className="font-medium text-orange-600">
                        {quiz.freeQuestionsCount} free
                      </span>
                    </div>
                  )}
                </div>

                {/* 🔥 Live Status Badge */}
                <div className="mb-3">
                  <LiveStatusBadge
                    activeUsers={liveStatus.get(quiz.id) || 0}
                    isConnected={socketConnected}
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    {quiz.isFree ? (
                      <span className="text-lg font-bold text-green-600">FREE</span>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">
                          {formatPrice(quiz.discount_price || quiz.price, quiz.isFree)}
                        </span>
                        {quiz.discount_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{quiz.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge variant={quiz.is_published ? 'default' : 'secondary'}>
                    {quiz.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
            <DialogDescription>Update quiz details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Same fields as Create Dialog - with all the same structure including FREE PREVIEW QUESTIONS field */}
            <div className="space-y-2">
              <Label>Quiz Title <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g., UPSC Prelims Mock Test 2025"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the quiz content and topics"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              />
            </div>

            {/* Subject & Chapter (Edit) */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Test Subject</Label>
                <Select
                  value={formData.subjectId || 'none'}
                  onValueChange={(value) => {
                    setFormData({ ...formData, subjectId: value === 'none' ? '' : value, chapterId: '' });
                    fetchChaptersForSubject(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— No Subject —</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Assign to a subject to show on the Tests page</p>
              </div>
              <div className="space-y-2">
                <Label>Chapter</Label>
                <Select
                  value={formData.chapterId || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, chapterId: value === 'none' ? '' : value })}
                  disabled={!formData.subjectId || formData.subjectId === 'none'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chapter (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— No Chapter —</SelectItem>
                    {chapters.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category <span className="text-red-500">*</span></Label>
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
                <Label>Difficulty <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Duration (min) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="60"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Marks <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={formData.total_marks}
                  onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Passing Marks <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="40"
                  value={formData.passing_marks}
                  onChange={(e) => setFormData({ ...formData, passing_marks: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  placeholder="499"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={formData.isFree}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Price (₹)</Label>
                <Input
                  type="number"
                  placeholder="399"
                  value={formData.discount_price}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                  disabled={formData.isFree}
                />
              </div>
            </div>

            {/* ✅ FREE PREVIEW QUESTIONS IN EDIT DIALOG */}
            <div className="space-y-2 border-t pt-4">
              <Label className="flex items-center gap-2">
                Free Preview Questions
                <span className="text-xs text-muted-foreground font-normal">
                  (0 = Fully paid, 5 = First 5 free)
                </span>
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={formData.freeQuestionsCount}
                onChange={(e) => setFormData({ ...formData, freeQuestionsCount: e.target.value })}
                disabled={formData.isFree}
              />
              <p className="text-xs text-muted-foreground">
                💡 Set how many questions students can preview for free before payment.
              </p>
              {!formData.isFree && parseInt(formData.freeQuestionsCount) > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs text-orange-800">
                    <strong>Preview Mode:</strong> Students can attempt the first {formData.freeQuestionsCount} questions,
                    then must purchase to continue.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Negative Marks</Label>
                <Input
                  type="number"
                  step="0.25"
                  placeholder="0.25"
                  value={formData.negativeMarksPerQuestion}
                  onChange={(e) => setFormData({ ...formData, negativeMarksPerQuestion: e.target.value })}
                  disabled={!formData.negativeMarking}
                />
              </div>
              <div className="space-y-2">
                <Label>Attempts Allowed</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.attemptsAllowed}
                  onChange={(e) => setFormData({ ...formData, attemptsAllowed: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isFree"
                  checked={formData.isFree}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFree: !!checked })}
                />
                <Label htmlFor="edit-isFree" className="cursor-pointer">Free Quiz</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-negativeMarking"
                  checked={formData.negativeMarking}
                  onCheckedChange={(checked) => setFormData({ ...formData, negativeMarking: !!checked })}
                />
                <Label htmlFor="edit-negativeMarking" className="cursor-pointer">Negative Marking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-shuffleQuestions"
                  checked={formData.shuffle_questions}
                  onCheckedChange={(checked) => setFormData({ ...formData, shuffle_questions: !!checked })}
                />
                <Label htmlFor="edit-shuffleQuestions" className="cursor-pointer">Shuffle Questions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-showResults"
                  checked={formData.show_results}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_results: !!checked })}
                />
                <Label htmlFor="edit-showResults" className="cursor-pointer">Show Results</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-allowReview"
                  checked={formData.allowReview}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowReview: !!checked })}
                />
                <Label htmlFor="edit-allowReview" className="cursor-pointer">Allow Review</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-showAnswerKey"
                  checked={formData.showAnswerKey}
                  onCheckedChange={(checked) => setFormData({ ...formData, showAnswerKey: !!checked })}
                />
                <Label htmlFor="edit-showAnswerKey" className="cursor-pointer">Show Answer Key</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-certificateEligible"
                  checked={formData.certificateEligible}
                  onCheckedChange={(checked) => setFormData({ ...formData, certificateEligible: !!checked })}
                />
                <Label htmlFor="edit-certificateEligible" className="cursor-pointer">Certificate Eligible</Label>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="edit-isScheduled"
                  checked={formData.is_scheduled}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_scheduled: !!checked })}
                />
                <Label htmlFor="edit-isScheduled" className="cursor-pointer">
                  Schedule this quiz (live exam mode)
                </Label>
              </div>
              {formData.is_scheduled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedQuiz(null); }}>
              Cancel
            </Button>
            <Button onClick={handleEditQuiz}>Update Quiz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricing Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Pricing</DialogTitle>
            <DialogDescription>
              Update pricing for: <strong>{selectedQuiz?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="pricing-isFree"
                checked={pricingData.isFree}
                onCheckedChange={(checked) => setPricingData({ ...pricingData, isFree: !!checked })}
              />
              <Label htmlFor="pricing-isFree" className="cursor-pointer font-medium">
                Mark as Free Quiz
              </Label>
            </div>
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input
                type="number"
                placeholder="499"
                value={pricingData.price}
                onChange={(e) => setPricingData({ ...pricingData, price: e.target.value })}
                disabled={pricingData.isFree}
              />
            </div>
            <div className="space-y-2">
              <Label>Discount Price (₹)</Label>
              <Input
                type="number"
                placeholder="399"
                value={pricingData.discount_price}
                onChange={(e) => setPricingData({ ...pricingData, discount_price: e.target.value })}
                disabled={pricingData.isFree}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty if no discount
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsPricingDialogOpen(false); setSelectedQuiz(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePricing}>Update Pricing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedQuiz?.title}</strong> and all its questions and attempts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedQuiz(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuiz} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
