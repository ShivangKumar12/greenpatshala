// client/src/pages/instructor/QuizCreate.tsx
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  Eye
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  marks: number;
}

export default function QuizCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Intermediate',
    duration: 30,
    passingMarks: 40,
    totalMarks: 100,
    isPublished: false,
    shuffleQuestions: true,
    showResults: true,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const handleSaveQuiz = () => {
    if (!quizData.title || !quizData.category) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Questions',
        description: 'Please add at least one question to the quiz',
      });
      return;
    }

    // todo: remove mock functionality - save to backend
    toast({
      title: 'Quiz Saved',
      description: 'Your quiz has been saved successfully',
    });

    setLocation('/instructor');
  };

  const handleAddQuestion = (question: Question) => {
    setQuestions([...questions, question]);
    setShowQuestionForm(false);
    toast({
      title: 'Question Added',
      description: 'Question has been added to the quiz',
    });
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast({
      title: 'Question Deleted',
      description: 'Question has been removed from the quiz',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Button 
            variant="ghost" 
            className="gap-2 mb-4"
            onClick={() => setLocation('/instructor')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Create New Quiz</h1>
          <p className="text-muted-foreground mt-2">
            Build an engaging quiz for your students
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Quiz Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter quiz title"
                    value={quizData.title}
                    onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                    data-testid="input-quiz-title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the quiz"
                    rows={3}
                    value={quizData.description}
                    onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                    data-testid="textarea-quiz-description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={quizData.category}
                      onValueChange={(value) => setQuizData({ ...quizData, category: value })}
                    >
                      <SelectTrigger id="category" data-testid="select-quiz-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPSC">UPSC</SelectItem>
                        <SelectItem value="SSC">SSC</SelectItem>
                        <SelectItem value="Banking">Banking</SelectItem>
                        <SelectItem value="Railways">Railways</SelectItem>
                        <SelectItem value="State PSC">State PSC</SelectItem>
                        <SelectItem value="Teaching">Teaching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={quizData.difficulty}
                      onValueChange={(value) => setQuizData({ ...quizData, difficulty: value })}
                    >
                      <SelectTrigger id="difficulty" data-testid="select-quiz-difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      value={quizData.duration}
                      onChange={(e) => setQuizData({ ...quizData, duration: parseInt(e.target.value) })}
                      data-testid="input-quiz-duration"
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      min={1}
                      value={quizData.totalMarks}
                      onChange={(e) => setQuizData({ ...quizData, totalMarks: parseInt(e.target.value) })}
                      data-testid="input-total-marks"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passingMarks">Passing Marks (%)</Label>
                    <Input
                      id="passingMarks"
                      type="number"
                      min={0}
                      max={100}
                      value={quizData.passingMarks}
                      onChange={(e) => setQuizData({ ...quizData, passingMarks: parseInt(e.target.value) })}
                      data-testid="input-passing-marks"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {questions.length} question(s) added
                  </p>
                </div>
                <Button 
                  className="gap-2"
                  onClick={() => setShowQuestionForm(true)}
                  data-testid="button-add-question"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No questions added yet</p>
                    <p className="text-sm mt-2">Click "Add Question" to start building your quiz</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div 
                        key={question.id} 
                        className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              <Badge variant="secondary">{question.marks} marks</Badge>
                            </div>
                            <p className="font-medium mb-2">{question.question}</p>
                            <div className="space-y-1 text-sm">
                              {question.options.map((option, optIndex) => (
                                <div 
                                  key={optIndex}
                                  className={`flex items-center gap-2 ${
                                    optIndex === question.correctAnswer 
                                      ? 'text-green-600 dark:text-green-400 font-medium' 
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  <span className="shrink-0">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <span>{option}</span>
                                  {optIndex === question.correctAnswer && (
                                    <Badge variant="outline" className="text-xs">Correct</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteQuestion(question.id)}
                            data-testid={`button-delete-question-${index}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                    <p className="text-xs text-muted-foreground">
                      Randomize question order
                    </p>
                  </div>
                  <Switch
                    id="shuffleQuestions"
                    checked={quizData.shuffleQuestions}
                    onCheckedChange={(checked) => 
                      setQuizData({ ...quizData, shuffleQuestions: checked })
                    }
                    data-testid="switch-shuffle-questions"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showResults">Show Results</Label>
                    <p className="text-xs text-muted-foreground">
                      Display results after submission
                    </p>
                  </div>
                  <Switch
                    id="showResults"
                    checked={quizData.showResults}
                    onCheckedChange={(checked) => 
                      setQuizData({ ...quizData, showResults: checked })
                    }
                    data-testid="switch-show-results"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPublished">Published</Label>
                    <p className="text-xs text-muted-foreground">
                      Make quiz visible to students
                    </p>
                  </div>
                  <Switch
                    id="isPublished"
                    checked={quizData.isPublished}
                    onCheckedChange={(checked) => 
                      setQuizData({ ...quizData, isPublished: checked })
                    }
                    data-testid="switch-is-published"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <Button 
                  className="w-full gap-2"
                  onClick={handleSaveQuiz}
                  data-testid="button-save-quiz"
                >
                  <Save className="w-4 h-4" />
                  Save Quiz
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  disabled={questions.length === 0}
                  data-testid="button-preview-quiz"
                >
                  <Eye className="w-4 h-4" />
                  Preview Quiz
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3 text-sm">Quiz Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questions</span>
                    <span className="font-medium">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Marks</span>
                    <span className="font-medium">{questions.reduce((sum, q) => sum + q.marks, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{quizData.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={quizData.isPublished ? 'default' : 'secondary'}>
                      {quizData.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <QuestionForm 
          onSave={handleAddQuestion}
          onClose={() => setShowQuestionForm(false)}
        />
      )}
    </div>
  );
}

// Question Form Component
interface QuestionFormProps {
  onSave: (question: Question) => void;
  onClose: () => void;
  editQuestion?: Question;
}

function QuestionForm({ onSave, onClose, editQuestion }: QuestionFormProps) {
  const [question, setQuestion] = useState(editQuestion || {
    id: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    marks: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.question || question.options.some(opt => !opt)) {
      return;
    }

    onSave({
      ...question,
      id: question.id || Date.now().toString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{editQuestion ? 'Edit' : 'Add'} Question</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Question *</Label>
              <Textarea
                id="question"
                placeholder="Enter your question"
                rows={3}
                value={question.question}
                onChange={(e) => setQuestion({ ...question, question: e.target.value })}
                required
                data-testid="textarea-question"
              />
            </div>

            <div>
              <Label>Options *</Label>
              <div className="space-y-2 mt-2">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-8">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[index] = e.target.value;
                        setQuestion({ ...question, options: newOptions });
                      }}
                      required
                      data-testid={`input-option-${index}`}
                    />
                    <Switch
                      checked={question.correctAnswer === index}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setQuestion({ ...question, correctAnswer: index });
                        }
                      }}
                      data-testid={`switch-correct-${index}`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Toggle the switch to mark the correct answer
              </p>
            </div>

            <div>
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                placeholder="Explain why this is the correct answer"
                rows={2}
                value={question.explanation}
                onChange={(e) => setQuestion({ ...question, explanation: e.target.value })}
                data-testid="textarea-explanation"
              />
            </div>

            <div>
              <Label htmlFor="marks">Marks</Label>
              <Input
                id="marks"
                type="number"
                min={1}
                value={question.marks}
                onChange={(e) => setQuestion({ ...question, marks: parseInt(e.target.value) })}
                data-testid="input-question-marks"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" data-testid="button-save-question">
                {editQuestion ? 'Update' : 'Add'} Question
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
