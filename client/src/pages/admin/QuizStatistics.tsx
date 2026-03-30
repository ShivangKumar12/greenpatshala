// client/src/pages/admin/QuizStatistics.tsx
import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, TrendingUp, Clock, CheckCircle, XCircle, Award } from "lucide-react";
import { getQuizStatistics } from "@/services/quizApi";
import { useToast } from "@/hooks/use-toast";

interface Statistics {
  totalAttempts: number;
  averageScore: number;
  averageTimeTaken: number;
  passedCount: number;
  failedCount: number;
  passRate: number;
  totalMarks: number;
  passingMarks: number;
}

export default function QuizStatistics() {
  const [match, params] = useRoute("/admin/quizzes/:id/statistics");
  const quizId = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    fetchStatistics();
  }, [quizId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await getQuizStatistics(Number(quizId));
      
      if (response.success) {
        setStatistics(response.statistics);
      }
    } catch (error: any) {
      console.error("Fetch statistics error:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load statistics",
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No statistics available</p>
          <Button onClick={() => navigate("/admin")} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Quiz Statistics
          </h1>
          <p className="text-muted-foreground">
            Detailed performance analytics for this quiz
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Attempts
                  </p>
                  <p className="text-3xl font-bold">
                    {statistics.totalAttempts}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Average Score
                  </p>
                  <p className="text-3xl font-bold">
                    {statistics.averageScore.toFixed(1)}
                    <span className="text-lg text-muted-foreground">
                      /{statistics.totalMarks}
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Pass Rate
                  </p>
                  <p className="text-3xl font-bold">
                    {statistics.passRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Avg. Time
                  </p>
                  <p className="text-3xl font-bold">
                    {formatTime(statistics.averageTimeTaken)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pass/Fail Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Pass/Fail Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold">Passed</p>
                      <p className="text-sm text-muted-foreground">
                        Score ≥ {statistics.passingMarks}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {statistics.passedCount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {statistics.totalAttempts > 0
                        ? (
                            (statistics.passedCount / statistics.totalAttempts) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="font-semibold">Failed</p>
                      <p className="text-sm text-muted-foreground">
                        Score &lt; {statistics.passingMarks}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">
                      {statistics.failedCount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {statistics.totalAttempts > 0
                        ? (
                            (statistics.failedCount / statistics.totalAttempts) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Marks</span>
                  <span className="font-semibold">{statistics.totalMarks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Passing Marks</span>
                  <span className="font-semibold">{statistics.passingMarks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Score</span>
                  <span className="font-semibold">
                    {statistics.averageScore.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Average Percentage
                  </span>
                  <span className="font-semibold">
                    {statistics.totalMarks > 0
                      ? ((statistics.averageScore / statistics.totalMarks) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Average Time Taken
                  </span>
                  <span className="font-semibold">
                    {formatTime(statistics.averageTimeTaken)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button onClick={() => navigate(`/admin/quizzes/${quizId}/results`)}>
            View All Results
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
