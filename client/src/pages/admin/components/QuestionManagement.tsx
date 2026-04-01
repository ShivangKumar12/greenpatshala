// client/src/pages/admin/components/QuestionManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Upload,
  Download,
  Image as ImageIcon,
  Copy,
  Save,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';
import {
  getQuizById,
  addQuestions,
  updateQuestion,
  deleteQuestion,
  exportQuizQuestions,
  Question,
} from '@/services/adminQuizApi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuestionManagementProps {
  quizId: number;
  quizTitle: string;
  onClose?: () => void;
}

interface QuestionFormData {
  id?: number;
  questionType: 'mcq' | 'true_false' | 'multiple_answer' | 'match_the_column';
  question: string;
  questionImage: string;
  options: string[];
  correctAnswer: number | number[];
  explanation: string;
  marks: number;
  negativeMarks: number;
  difficulty: string;
  orderIndex: number;
  // Match the Column fields
  columnA: string[];
  columnB: string[];
  matchOptions: string[];
}

const INITIAL_FORM_STATE: QuestionFormData = {
  questionType: 'mcq',
  question: '',
  questionImage: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: '',
  marks: 1,
  negativeMarks: 0,
  difficulty: 'medium',
  orderIndex: 0,
  columnA: ['', '', '', ''],
  columnB: ['', '', '', ''],
  matchOptions: ['', '', '', ''],
};

// Sortable Question Item Component
function SortableQuestionItem({
  question,
  index,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      mcq: 'MCQ',
      true_false: 'True/False',
      multiple_answer: 'Multiple Answer',
      match_the_column: 'Match the Column',
    };
    return labels[type] || type;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-move text-gray-400 hover:text-gray-600 mt-1"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Question Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-500">
                Q{index + 1}
              </span>
              <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
              <Badge variant="secondary">{getTypeLabel(question.questionType)}</Badge>
              <Badge variant="outline">
                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
              </Badge>
              {question.negativeMarks > 0 && (
                <Badge variant="destructive" className="text-xs">
                  -{question.negativeMarks}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicate}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Question Text */}
          <p className="text-sm font-medium text-gray-900 mb-2">
            {question.question}
          </p>

          {/* Question Image */}
          {question.questionImage && (
            <img
              src={question.questionImage}
              alt="Question"
              className="w-32 h-32 object-cover rounded mb-2"
            />
          )}

          {/* Options */}
          <div className="space-y-1">
            {question.questionType === 'match_the_column' ? (
              <div className="space-y-2">
                {/* Column A / Column B display */}
                {(() => {
                  const opts = question.options as any;
                  const colA: string[] = opts?.columnA || [];
                  const colB: string[] = opts?.columnB || [];
                  const matchOpts: string[] = opts?.matchOptions || [];
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm border rounded p-2 bg-gray-50">
                        <div>
                          <p className="font-semibold text-xs text-gray-500 mb-1">Column A</p>
                          {colA.map((item, i) => (
                            <p key={i}>{String.fromCharCode(65 + i)}. {item}</p>
                          ))}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-gray-500 mb-1">Column B</p>
                          {colB.map((item, i) => (
                            <p key={i}>{i + 1}. {item}</p>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1 mt-1">
                        {matchOpts.map((opt, idx) => {
                          const isCorrect = question.correctAnswer === idx;
                          return (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isCorrect ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}>
                                {isCorrect && <Check className="h-3 w-3 text-green-600" />}
                              </div>
                              <span className={isCorrect ? 'font-medium text-green-700' : ''}>
                                {String.fromCharCode(65 + idx)}. {opt}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : question.questionType === 'true_false' ? (
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      question.correctAnswer === 0
                        ? 'border-green-500 bg-green-100'
                        : 'border-gray-300'
                    }`}
                  >
                    {question.correctAnswer === 0 && (
                      <Check className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                  <span>True</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      question.correctAnswer === 1
                        ? 'border-green-500 bg-green-100'
                        : 'border-gray-300'
                    }`}
                  >
                    {question.correctAnswer === 1 && (
                      <Check className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                  <span>False</span>
                </div>
              </div>
            ) : (
              question.options.map((option, idx) => {
                const isCorrect =
                  question.questionType === 'mcq'
                    ? question.correctAnswer === idx
                    : Array.isArray(question.correctAnswer) &&
                      question.correctAnswer.includes(idx);

                return (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isCorrect
                          ? 'border-green-500 bg-green-100'
                          : 'border-gray-300'
                      }`}
                    >
                      {isCorrect && <Check className="h-3 w-3 text-green-600" />}
                    </div>
                    <span className={isCorrect ? 'font-medium text-green-700' : ''}>
                      {String.fromCharCode(65 + idx)}. {option}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-900">
              <span className="font-medium">Explanation:</span> {question.explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuestionManagement({
  quizId,
  quizTitle,
  onClose,
}: QuestionManagementProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<QuestionFormData>(INITIAL_FORM_STATE);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load questions
  useEffect(() => {
    loadQuestions();
  }, [quizId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await getQuizById(quizId);
      setQuestions(response.quiz.questions || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load questions',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });

      // TODO: Update order in backend
      toast({
        title: 'Order updated',
        description: 'Question order has been updated',
      });
    }
  };

  // Open add dialog
  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      ...INITIAL_FORM_STATE,
      orderIndex: questions.length,
    });
    setIsDialogOpen(true);
  };

  // Open edit dialog
  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    const opts = question.options as any;
    const isMatch = question.questionType === 'match_the_column';
    setFormData({
      id: question.id,
      questionType: question.questionType as any,
      question: question.question,
      questionImage: question.questionImage || '',
      options:
        question.questionType === 'true_false'
          ? ['True', 'False']
          : isMatch
            ? []
            : question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      marks: question.marks,
      negativeMarks: question.negativeMarks,
      difficulty: question.difficulty,
      orderIndex: question.orderIndex,
      columnA: isMatch ? (opts?.columnA || ['', '', '', '']) : ['', '', '', ''],
      columnB: isMatch ? (opts?.columnB || ['', '', '', '']) : ['', '', '', ''],
      matchOptions: isMatch ? (opts?.matchOptions || ['', '', '', '']) : ['', '', '', ''],
    });
    setIsDialogOpen(true);
  };

  // Duplicate question
  const handleDuplicateQuestion = (question: Question) => {
    setEditingQuestion(null);
    const opts = question.options as any;
    const isMatch = question.questionType === 'match_the_column';
    setFormData({
      questionType: question.questionType as any,
      question: question.question + ' (Copy)',
      questionImage: question.questionImage || '',
      options: isMatch ? [] : question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      marks: question.marks,
      negativeMarks: question.negativeMarks,
      difficulty: question.difficulty,
      orderIndex: questions.length,
      columnA: isMatch ? (opts?.columnA || ['', '', '', '']) : ['', '', '', ''],
      columnB: isMatch ? (opts?.columnB || ['', '', '', '']) : ['', '', '', ''],
      matchOptions: isMatch ? (opts?.matchOptions || ['', '', '', '']) : ['', '', '', ''],
    });
    setIsDialogOpen(true);
  };

  // Delete question
  const handleDeleteQuestion = async (question: Question) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await deleteQuestion(quizId, question.id);
      toast({
        title: 'Success',
        description: 'Question deleted successfully',
      });
      loadQuestions();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete question',
      });
    }
  };

  // Save question
  const handleSaveQuestion = async () => {
    // Validation
    if (!formData.question.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Question text is required',
      });
      return;
    }

    // Match the Column validation
    if (formData.questionType === 'match_the_column') {
      if (formData.columnA.some((c) => !c.trim()) || formData.columnB.some((c) => !c.trim())) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'All Column A and Column B items must be filled' });
        return;
      }
      if (formData.matchOptions.some((m) => !m.trim())) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'All match answer options must be filled' });
        return;
      }
    } else if (
      formData.questionType !== 'true_false' &&
      formData.options.some((opt) => !opt.trim())
    ) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'All options must be filled',
      });
      return;
    }

    try {
      setIsSaving(true);

      // Build payload — for match_the_column, package options as structured object
      const payload = formData.questionType === 'match_the_column'
        ? {
            ...formData,
            options: {
              columnA: formData.columnA,
              columnB: formData.columnB,
              matchOptions: formData.matchOptions,
            },
          }
        : formData;

      if (editingQuestion) {
        // Update existing question
        await updateQuestion(quizId, editingQuestion.id, payload as any);
        toast({
          title: 'Success',
          description: 'Question updated successfully',
        });
      } else {
        // Add new question
        await addQuestions(quizId, [payload as any]);
        toast({
          title: 'Success',
          description: 'Question added successfully',
        });
      }

      setIsDialogOpen(false);
      loadQuestions();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save question',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle question type change
  const handleQuestionTypeChange = (type: string) => {
    const newFormData: QuestionFormData = {
      ...formData,
      questionType: type as any,
    };

    if (type === 'true_false') {
      newFormData.options = ['True', 'False'];
      newFormData.correctAnswer = 0;
    } else if (type === 'mcq') {
      if (formData.questionType === 'true_false' || formData.questionType === 'match_the_column') {
        newFormData.options = ['', '', '', ''];
      }
      newFormData.correctAnswer = 0;
    } else if (type === 'multiple_answer') {
      if (formData.questionType === 'true_false' || formData.questionType === 'match_the_column') {
        newFormData.options = ['', '', '', ''];
      }
      newFormData.correctAnswer = [];
    } else if (type === 'match_the_column') {
      newFormData.options = [];
      newFormData.columnA = ['', '', '', ''];
      newFormData.columnB = ['', '', '', ''];
      newFormData.matchOptions = ['', '', '', ''];
      newFormData.correctAnswer = 0;
    }

    setFormData(newFormData);
  };

  // Handle option change
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  // Add option
  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
    });
  };

  // Remove option
  const handleRemoveOption = (index: number) => {
    if (formData.options.length <= 2) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'At least 2 options are required',
      });
      return;
    }

    const newOptions = formData.options.filter((_, i) => i !== index);
    let newCorrectAnswer = formData.correctAnswer;

    if (formData.questionType === 'mcq' && formData.correctAnswer === index) {
      newCorrectAnswer = 0;
    } else if (
      formData.questionType === 'multiple_answer' &&
      Array.isArray(formData.correctAnswer)
    ) {
      newCorrectAnswer = formData.correctAnswer
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i));
    }

    setFormData({
      ...formData,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
    });
  };

  // Handle MCQ correct answer
  const handleMCQCorrectAnswer = (index: number) => {
    setFormData({ ...formData, correctAnswer: index });
  };

  // Handle multiple answer toggle
  const handleMultipleAnswerToggle = (index: number) => {
    const current = Array.isArray(formData.correctAnswer)
      ? formData.correctAnswer
      : [];
    const newAnswer = current.includes(index)
      ? current.filter((i) => i !== index)
      : [...current, index];
    setFormData({ ...formData, correctAnswer: newAnswer });
  };

  // Export questions
  const handleExportQuestions = async () => {
    try {
      await exportQuizQuestions(quizId);
      toast({
        title: 'Success',
        description: 'Questions exported successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to export questions',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions Management</CardTitle>
              <CardDescription>
                Managing questions for: <strong>{quizTitle}</strong>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportQuestions}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={handleAddQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
              {onClose && (
                <Button variant="ghost" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div>
              <strong>{questions.length}</strong> questions
            </div>
            <div>
              <strong>
                {questions.reduce((sum, q) => sum + q.marks, 0)}
              </strong>{' '}
              total marks
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No questions added yet</p>
            <Button onClick={handleAddQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((question, index) => (
              <SortableQuestionItem
                key={question.id}
                question={question}
                index={index}
                onEdit={() => handleEditQuestion(question)}
                onDelete={() => handleDeleteQuestion(question)}
                onDuplicate={() => handleDuplicateQuestion(question)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to{' '}
              {editingQuestion ? 'update' : 'create'} a question
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Question Type */}
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={formData.questionType}
                onValueChange={handleQuestionTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice (Single Answer)</SelectItem>
                  <SelectItem value="multiple_answer">
                    Multiple Choice (Multiple Answers)
                  </SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="match_the_column">Match the Column (सुमेलित कीजिए)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <Label>Question *</Label>
              <Textarea
                placeholder="Enter your question here..."
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Question Image URL */}
            <div className="space-y-2">
              <Label>Question Image URL (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.questionImage}
                  onChange={(e) =>
                    setFormData({ ...formData, questionImage: e.target.value })
                  }
                />
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {formData.questionImage && (
                <img
                  src={formData.questionImage}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              )}
            </div>

            {/* Match the Column Form */}
            {formData.questionType === 'match_the_column' && (
              <div className="space-y-4">
                {/* Column A */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">सूची-I (Column A) *</Label>
                    <Button variant="outline" size="sm" onClick={() => setFormData({ ...formData, columnA: [...formData.columnA, ''], columnB: [...formData.columnB, ''] })}>
                      <Plus className="h-3 w-3 mr-1" /> Add Row
                    </Button>
                  </div>
                  {formData.columnA.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-medium text-sm w-6">{String.fromCharCode(65 + idx)}.</span>
                      <Input placeholder={`Column A - Item ${idx + 1}`} value={item} onChange={(e) => { const a = [...formData.columnA]; a[idx] = e.target.value; setFormData({ ...formData, columnA: a }); }} className="flex-1" />
                      {formData.columnA.length > 2 && (
                        <Button variant="ghost" size="icon" onClick={() => {
                          const a = formData.columnA.filter((_, i) => i !== idx);
                          const b = formData.columnB.filter((_, i) => i !== idx);
                          setFormData({ ...formData, columnA: a, columnB: b });
                        }}><X className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Column B */}
                <div className="space-y-2">
                  <Label className="font-semibold">सूची-II (Column B) *</Label>
                  {formData.columnB.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-medium text-sm w-6">{idx + 1}.</span>
                      <Input placeholder={`Column B - Item ${idx + 1}`} value={item} onChange={(e) => { const b = [...formData.columnB]; b[idx] = e.target.value; setFormData({ ...formData, columnB: b }); }} className="flex-1" />
                    </div>
                  ))}
                </div>

                {/* Match Answer Options (MCQ-style) */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Answer Options (कूट) *</Label>
                    <Button variant="outline" size="sm" onClick={() => setFormData({ ...formData, matchOptions: [...formData.matchOptions, ''] })}>
                      <Plus className="h-3 w-3 mr-1" /> Add Option
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Enter answer combinations like "A-2, B-1, C-4, D-3" and select the correct one.</p>
                  {formData.matchOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <RadioGroup value={formData.correctAnswer.toString()} onValueChange={(v) => setFormData({ ...formData, correctAnswer: parseInt(v) })}>
                        <RadioGroupItem value={idx.toString()} />
                      </RadioGroup>
                      <span className="font-medium text-sm w-6">{String.fromCharCode(65 + idx)}.</span>
                      <Input placeholder={`e.g., A-${idx + 1}, B-${idx + 2 > formData.columnA.length ? 1 : idx + 2}, C-...`} value={opt} onChange={(e) => { const m = [...formData.matchOptions]; m[idx] = e.target.value; setFormData({ ...formData, matchOptions: m }); }} className="flex-1" />
                      {formData.matchOptions.length > 2 && (
                        <Button variant="ghost" size="icon" onClick={() => {
                          const m = formData.matchOptions.filter((_, i) => i !== idx);
                          let ca = formData.correctAnswer as number;
                          if (ca === idx) ca = 0;
                          else if (ca > idx) ca--;
                          setFormData({ ...formData, matchOptions: m, correctAnswer: ca });
                        }}><X className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options (MCQ / Multiple Answer) */}
            {formData.questionType !== 'true_false' && formData.questionType !== 'match_the_column' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Options *</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {formData.questionType === 'mcq' ? (
                        <RadioGroup
                          value={formData.correctAnswer.toString()}
                          onValueChange={(value) =>
                            handleMCQCorrectAnswer(parseInt(value))
                          }
                        >
                          <RadioGroupItem value={index.toString()} />
                        </RadioGroup>
                      ) : (
                        <Checkbox
                          checked={
                            Array.isArray(formData.correctAnswer) &&
                            formData.correctAnswer.includes(index)
                          }
                          onCheckedChange={() =>
                            handleMultipleAnswerToggle(index)
                          }
                        />
                      )}
                      <span className="font-medium text-sm">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.questionType === 'mcq'
                    ? 'Select the correct answer'
                    : 'Check all correct answers'}
                </p>
              </div>
            )}

            {/* True/False */}
            {formData.questionType === 'true_false' && (
              <div className="space-y-2">
                <Label>Correct Answer *</Label>
                <RadioGroup
                  value={formData.correctAnswer.toString()}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      correctAnswer: parseInt(value),
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="true" />
                    <Label htmlFor="true">True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="false" />
                    <Label htmlFor="false">False</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Explanation */}
            <div className="space-y-2">
              <Label>Explanation (Optional)</Label>
              <Textarea
                placeholder="Explain why this is the correct answer..."
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* Marks and Settings */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Marks *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.marks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      marks: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Negative Marks</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.25"
                  value={formData.negativeMarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      negativeMarks: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingQuestion ? 'Update' : 'Add'} Question
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
