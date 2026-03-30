// client/src/pages/admin/QuizResults.tsx
import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getQuizAttempts } from "@/services/quizApi";
import { useToast } from "@/hooks/use-toast";

interface Attempt {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  timeTaken: number;
  isPassed: number;
  status: string;
  completedAt: string;
}

export default function QuizResults() {
  const [match, params] = useRoute("/admin/quizzes/:id/results");
  const quizId = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<Attempt[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [totalMarks, setTotalMarks] = useState(0);
  const [passingMarks, setPassingMarks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!quizId) return;
    fetchResults();
  }, [quizId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = attempts.filter(
        (attempt) =>
          attempt.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attempt.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAttempts(filtered);
    } else {
      setFilteredAttempts(attempts);
    }
  }, [searchQuery, attempts]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await getQuizAttempts(Number(quizId));

      if (response.success) {
        setAttempts(response.attempts);
        setFilteredAttempts(response.attempts);
        setQuizTitle(response.quizTitle);
        setTotalMarks(response.totalMarks);
        setPassingMarks(response.passingMarks);
      }
    } catch (error: any) {
      console.error("Fetch results error:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Score",
      "Total Marks",
      "Percentage",
      "Correct",
      "Wrong",
      "Skipped",
      "Time Taken",
      "Status",
      "Completed At",
    ];

    const rows = filteredAttempts.map((attempt) => [
      attempt.userName,
      attempt.userEmail,
      attempt.score,
      totalMarks,
      ((attempt.score / totalMarks) * 100).toFixed(2) + "%",
      attempt.correctAnswers,
      attempt.wrongAnswers,
      attempt.skippedAnswers,
      formatTime(attempt.timeTaken),
      attempt.isPassed ? "Passed" : "Failed",
      formatDate(attempt.completedAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quiz-results-${quizId}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Results exported successfully",
    });
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

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{quizTitle}</h1>
          <p className="text-muted-foreground">
            All student attempts and results
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Results ({filteredAttempts.length})</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Marks: {totalMarks} | Passing: {passingMarks}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={() =>
                    navigate(`/admin/quizzes/${quizId}/statistics`)
                  }
                  variant="outline"
                  size="sm"
                >
                  View Statistics
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {filteredAttempts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No attempts found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Correct</TableHead>
                      <TableHead>Wrong</TableHead>
                      <TableHead>Skipped</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttempts.map((attempt) => {
                      const percentage = (
                        (attempt.score / totalMarks) *
                        100
                      ).toFixed(1);

                      return (
                        <TableRow key={attempt.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{attempt.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {attempt.userEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {attempt.score}/{totalMarks}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                parseFloat(percentage) >= 50
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {percentage}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600">
                              {attempt.correctAnswers}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-red-600">
                              {attempt.wrongAnswers}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-orange-600">
                              {attempt.skippedAnswers}
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatTime(attempt.timeTaken)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                attempt.isPassed ? "default" : "destructive"
                              }
                              className="gap-1"
                            >
                              {attempt.isPassed ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {attempt.isPassed ? "Passed" : "Failed"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(attempt.completedAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                navigate(`/quiz-result/${attempt.id}`)
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
