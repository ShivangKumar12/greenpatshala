import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy, Clock, Target, Award, Download, Loader2 } from "lucide-react";
import { getQuizAttemptById } from "@/services/quizApi";
import { useUserCertificates, downloadCertificatePDF } from "@/services/certificateApi";
import { useToast } from "@/hooks/use-toast";

export default function QuizResult() {
  const [match, params] = useRoute("/quiz-result/:id");
  const attemptId = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const { data: certificates } = useUserCertificates();

  useEffect(() => {
    if (attemptId) {
      fetchResult();
    } else {
      navigate("/quizzes");
    }
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const data = await getQuizAttemptById(Number(attemptId));

      // ✅ Validate response structure
      if (!data?.attempt) {
        throw new Error("Invalid response: attempt data missing");
      }

      setAttempt(data.attempt);
    } catch (error: any) {
      console.error("Failed to load quiz result:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load results",
        variant: "destructive",
      });
      navigate("/quizzes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  // ✅ Add safety checks before accessing nested properties
  if (!attempt || !attempt.quiz_id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Result Not Available</h2>
          <p className="text-muted-foreground mb-4">
            Unable to load quiz results
          </p>
          <Button onClick={() => navigate("/quizzes")}>
            Back to Quizzes
          </Button>
        </Card>
      </div>
    );
  }

  // ✅ Safe property access with fallbacks
  const passingMarks = attempt.passing_marks || 0;
  const totalMarks = attempt.total_marks || 100;
  const score = attempt.score || 0;
  const passed = score >= passingMarks;
  const percentage = totalMarks > 0 ? ((score / totalMarks) * 100).toFixed(1) : "0.0";
  const correctAnswers = attempt.correct_answers || 0;
  const totalQuestions = attempt.total_questions || 0;
  const timeTaken = attempt.time_taken || 0;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Result Header */}
        <Card className="p-8 text-center mb-6">
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-red-100 dark:bg-red-900/30"
              }`}
          >
            {passed ? (
              <Trophy className="w-10 h-10 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {passed ? "Congratulations! 🎉" : "Better Luck Next Time"}
          </h1>
          <p className="text-muted-foreground mb-4">
            Quiz Attempt #{attempt.id}
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge className={passed ? "bg-green-500" : "bg-red-500"}>
              {passed ? "Passed" : "Failed"}
            </Badge>
            <span className="text-2xl font-bold">{percentage}%</span>
          </div>

          {attempt.status && (
            <Badge variant="outline" className="text-sm">
              Status: {attempt.status}
            </Badge>
          )}
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">
                  {score} / {totalMarks}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Time Taken</p>
                <p className="text-2xl font-bold">
                  {Math.floor(timeTaken / 60)}:
                  {(timeTaken % 60).toString().padStart(2, "0")}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
                <p className="text-2xl font-bold">
                  {correctAnswers} / {totalQuestions}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Submission Info */}
        {attempt.submitted_at && (
          <Card className="p-4 mb-6">
            <p className="text-sm text-muted-foreground text-center">
              Submitted on:{" "}
              {new Date(attempt.submitted_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center flex-wrap">
          {passed && certificates && certificates.length > 0 && (() => {
            const cert = certificates.find((c: any) => c.attemptId === attempt.id || (c.type === 'quiz' && c.quizId === attempt.quizId));
            if (cert) return (
              <Button
                onClick={async () => {
                  setDownloadingCert(true);
                  try {
                    await downloadCertificatePDF(cert.certificateId);
                    toast({ title: 'Downloaded!', description: 'Certificate PDF downloaded.' });
                  } catch {
                    toast({ title: 'Error', description: 'Failed to download certificate.', variant: 'destructive' });
                  } finally {
                    setDownloadingCert(false);
                  }
                }}
                disabled={downloadingCert}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 gap-2"
              >
                {downloadingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                Download Certificate
              </Button>
            );
            return null;
          })()}
          <Button onClick={() => navigate("/quizzes")} variant="outline">
            Back to Quizzes
          </Button>
          <Button onClick={() => navigate("/my-attempts")}>
            View All Attempts
          </Button>
          <Button onClick={() => navigate("/dashboard")} variant="secondary">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
