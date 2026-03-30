import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trophy, Eye } from "lucide-react";
import { getUserAttempts } from "@/services/quizApi";
import { useToast } from "@/hooks/use-toast";

export default function MyAttempts() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const data = await getUserAttempts();
      setAttempts(data.attempts || []);
    } catch (error: any) {
      console.error("Failed to load attempts:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load attempts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your attempts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Quiz Attempts</h1>
          <p className="text-muted-foreground">
            View all your quiz attempts and results
          </p>
        </div>

        {attempts.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No attempts yet</h2>
            <p className="text-muted-foreground mb-6">
              Start taking quizzes to see your results here
            </p>
            <Button onClick={() => navigate("/quizzes")}>Browse Quizzes</Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {attempts.map((attempt) => {
              // ✅ Safe property access with fallbacks
              const passingMarks = attempt.passing_marks || 0;
              const totalMarks = attempt.total_marks || 100;
              const score = attempt.score || 0;
              const passed = score >= passingMarks;
              const percentage = totalMarks > 0 ? ((score / totalMarks) * 100).toFixed(1) : "0.0";
              const correctAnswers = attempt.correct_answers || 0;
              const totalQuestions = attempt.total_questions || 0;
              const timeTaken = attempt.time_taken || 0;
              const showResults = attempt.show_results !== false; // default true

              return (
                <Card key={attempt.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">
                          Quiz Attempt #{attempt.id}
                          {attempt.quiz_id && ` - Quiz ID: ${attempt.quiz_id}`}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {attempt.submitted_at
                              ? new Date(attempt.submitted_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Date unavailable"}
                          </span>
                        </div>
                      </div>
                      <Badge className={passed ? "bg-green-500" : "bg-red-500"}>
                        {passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="font-semibold">
                            {score}/{totalMarks}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Time</p>
                          <p className="font-semibold">
                            {Math.floor(timeTaken / 60)}:
                            {(timeTaken % 60).toString().padStart(2, "0")}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Percentage</p>
                        <p className="font-semibold">{percentage}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Correct</p>
                        <p className="font-semibold">
                          {correctAnswers}/{totalQuestions}
                        </p>
                      </div>
                    </div>
                    {showResults && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/quiz-result/${attempt.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
