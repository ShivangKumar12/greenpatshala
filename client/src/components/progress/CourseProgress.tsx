// client/src/components/progress/CourseProgress.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  Lock, 
  PlayCircle,
  Clock,
  Trophy
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  completed: boolean;
}

interface CourseProgressProps {
  courseTitle: string;
  modules: Module[];
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  certificateEarned?: boolean;
}

export default function CourseProgress({
  courseTitle,
  modules,
  overallProgress,
  completedLessons,
  totalLessons,
  certificateEarned,
}: CourseProgressProps) {
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{courseTitle}</CardTitle>
            {certificateEarned && (
              <Badge className="bg-yellow-600 gap-1">
                <Trophy className="w-3 h-3" />
                Certificate Earned
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedLessons} of {totalLessons} lessons completed
            </span>
            <span className="font-medium">
              {totalLessons - completedLessons} remaining
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Module Progress */}
      {modules.map((module) => (
        <Card key={module.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{module.title}</CardTitle>
              {module.completed && (
                <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {module.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    lesson.locked
                      ? 'bg-muted/30 cursor-not-allowed'
                      : lesson.completed
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                      : 'hover:bg-muted/50 cursor-pointer'
                  }`}
                  data-testid={`lesson-${lesson.id}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="shrink-0">
                      {lesson.locked ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : lesson.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        lesson.locked ? 'text-muted-foreground' : ''
                      }`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </div>
                    </div>
                  </div>

                  {!lesson.locked && !lesson.completed && (
                    <Button size="sm" variant="ghost" className="gap-1 shrink-0">
                      <PlayCircle className="w-4 h-4" />
                      Start
                    </Button>
                  )}

                  {lesson.completed && (
                    <Button size="sm" variant="ghost" className="gap-1 shrink-0">
                      Review
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
