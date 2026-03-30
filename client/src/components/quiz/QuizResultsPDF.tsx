// client/src/components/quiz/QuizResultsPDF.tsx
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizResultsPDFProps {
  quizTitle: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: string;
  date: string;
  questions?: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

export default function QuizResultsPDF({
  quizTitle,
  studentName,
  score,
  totalQuestions,
  correctAnswers,
  timeTaken,
  date,
  questions,
}: QuizResultsPDFProps) {
  const { toast } = useToast();

  const handleDownloadResults = () => {
    // todo: remove mock functionality - implement PDF generation
    // This would typically use a library like jsPDF or call a backend API
    
    toast({
      title: 'Downloading Results',
      description: 'Your quiz results PDF is being generated...',
    });

    // Mock download
    setTimeout(() => {
      toast({
        title: 'Download Complete',
        description: 'Quiz results have been downloaded successfully',
      });
    }, 1500);
  };

  const handleDownloadQuestions = () => {
    // todo: remove mock functionality - implement questions PDF generation
    
    toast({
      title: 'Downloading Questions',
      description: 'Quiz questions PDF is being generated...',
    });

    setTimeout(() => {
      toast({
        title: 'Download Complete',
        description: 'Quiz questions have been downloaded successfully',
      });
    }, 1500);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button 
        variant="outline" 
        className="gap-2"
        onClick={handleDownloadResults}
        data-testid="button-download-results-pdf"
      >
        <Download className="w-4 h-4" />
        Download Results PDF
      </Button>
      
      {questions && questions.length > 0 && (
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleDownloadQuestions}
          data-testid="button-download-questions-pdf"
        >
          <Download className="w-4 h-4" />
          Download Questions PDF
        </Button>
      )}
    </div>
  );
}
