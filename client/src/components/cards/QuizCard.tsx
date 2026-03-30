// client/src/components/cards/QuizCard.tsx
import { useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileQuestion, Target, Users, Play, Gift } from "lucide-react";

interface QuizCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  questionsCount: number;
  duration: number;
  passingScore: number;
  attempts: number;
  originalPrice: number;
  discountPrice?: number;
  isFree?: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
  hasAccess?: boolean;
  freeQuestionsCount?: number; // ✅ NEW: Free preview questions

  // Scheduling
  isScheduled?: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

type QuizScheduleState = "normal" | "upcoming" | "live" | "ended";

// Parse MySQL DATETIME string as local Date
const parseDateTime = (s: string | null | undefined): Date | null => {
  if (!s) return null;
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d.getTime()) ? null : d;
};

// dd/mm/yy hh:mm
const formatDateTime = (date: Date | null) => {
  if (!date) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  const hh = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${mins}`;
};

export default function QuizCard({
  id,
  title,
  description,
  category,
  questionsCount,
  duration,
  passingScore,
  attempts,
  originalPrice,
  discountPrice,
  isFree = false,
  difficulty,
  hasAccess = false,
  freeQuestionsCount = 0, // ✅ NEW
  isScheduled = false,
  startTime,
  endTime,
}: QuizCardProps) {
  const [, navigate] = useLocation();

  const hasDiscount = discountPrice !== undefined && discountPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  const difficultyColors: Record<QuizCardProps["difficulty"], string> = {
    Easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const { scheduleState, startDate, endDate } = useMemo(() => {
    if (!isScheduled || !startTime || !endTime) {
      return {
        scheduleState: "normal" as QuizScheduleState,
        startDate: null as Date | null,
        endDate: null as Date | null,
      };
    }

    const start = parseDateTime(startTime);
    const end = parseDateTime(endTime);
    if (!start || !end) {
      return {
        scheduleState: "normal" as QuizScheduleState,
        startDate: null,
        endDate: null,
      };
    }

    const now = new Date();

    let state: QuizScheduleState = "normal";
    if (now < start) state = "upcoming";
    else if (now >= start && now <= end) state = "live";
    else if (now > end) state = "ended";

    return { scheduleState: state, startDate: start, endDate: end };
  }, [isScheduled, startTime, endTime]);

  // ✅ NEW: Disable only for scheduled quizzes that are upcoming/ended
  const isStartDisabled = isScheduled && (scheduleState === "upcoming" || scheduleState === "ended");

  // ✅ NEW: Always navigate to quiz attempt page (payment happens during quiz)
  const handleStartQuiz = () => {
    if (!isStartDisabled) {
      navigate(`/quiz/${id}`);
    }
  };

  // ✅ NEW: Dynamic button label
  const buttonLabel = (() => {
    if (isScheduled && scheduleState === "upcoming") return "Starts Soon";
    if (isScheduled && scheduleState === "ended") return "Closed";
    return "Start Now";
  })();

  // ✅ NEW: Calculate final price
  const finalPrice = discountPrice ?? originalPrice;

  return (
    <Card className="group glass-panel premium-shadow flex flex-col h-full" data-testid={`card-quiz-${id}`}>
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted/30 border-border/50 rounded-md">
            {category}
          </Badge>
          <div className="flex items-center gap-2">
            {isScheduled && scheduleState === "live" && (
              <Badge className="bg-emerald-500/90 text-white text-[10px] uppercase font-bold tracking-wide rounded-md px-2 shadow-sm border-0 animate-pulse">Live</Badge>
            )}
            {isScheduled && scheduleState === "upcoming" && (
              <Badge className="bg-orange-500/90 text-white text-[10px] uppercase font-bold tracking-wide rounded-md px-2 shadow-sm border-0">Upcoming</Badge>
            )}
            {isScheduled && scheduleState === "ended" && (
              <Badge className="bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-wide rounded-md px-2 shadow-sm border border-border/50">Ended</Badge>
            )}
            <Badge className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border-0 shadow-sm ${difficultyColors[difficulty]}`}>{difficulty}</Badge>
          </div>
        </div>

        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
          <FileQuestion className="w-6 h-6 text-primary" />
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        {/* Schedule info */}
        {isScheduled && scheduleState === "upcoming" && startDate && (
          <p className="text-xs text-amber-600 mb-3">
            Starts at {formatDateTime(startDate)}
          </p>
        )}
        {isScheduled && scheduleState === "live" && endDate && (
          <p className="text-xs text-emerald-600 mb-3">
            Live until {formatDateTime(endDate)}
          </p>
        )}
        {isScheduled && scheduleState === "ended" && endDate && (
          <p className="text-xs text-muted-foreground mb-3">
            Ended at {formatDateTime(endDate)}
          </p>
        )}

        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-muted-foreground mt-auto pt-4 border-t border-border/40">
          <div className="flex items-center gap-1.5 font-medium">
            <FileQuestion className="w-4 h-4 text-primary/70" />
            <span>{questionsCount} Qs</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-primary/70" />
            <span>{duration} mins</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Target className="w-4 h-4 text-primary/70" />
            <span>{passingScore}% pass</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="w-4 h-4 text-primary/70" />
            <span>{attempts.toLocaleString()} attp.</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 bg-muted/20 border-t flex flex-col gap-3">
        {/* ✅ NEW: Pricing Display */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-baseline gap-2">
            {isFree ? (
              <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                <Gift className="w-4 h-4" />
                Free
              </span>
            ) : (
              <>
                <span className="text-lg font-bold">
                  ₹{finalPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                    <Badge className="bg-red-500/90 text-white rounded-md px-2 py-0 border-0 shadow-sm text-[10px] font-bold">
                      {discountPercent}% OFF
                    </Badge>
                  </>
                )}
              </>
            )}
          </div>

          {/* ✅ NEW: Always show "Start Now" button */}
          <Button
            size="sm"
            data-testid={`button-start-quiz-${id}`}
            onClick={handleStartQuiz}
            disabled={isStartDisabled}
            className="gap-2 btn-premium rounded-full px-5 font-medium"
          >
            <Play className="w-4 h-4 fill-current" />
            {buttonLabel}
          </Button>
        </div>

        {/* ✅ NEW: Preview Info for Paid Quizzes */}
        {!isFree && !hasAccess && freeQuestionsCount > 0 && (
          <div className="w-full p-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-xs text-orange-700 dark:text-orange-400 text-center flex items-center justify-center gap-1">
              <Gift className="w-3 h-3" />
              Try {freeQuestionsCount} {freeQuestionsCount === 1 ? 'question' : 'questions'} free, then unlock for ₹{finalPrice}
            </p>
          </div>
        )}

        {/* ✅ NEW: Already Purchased Badge */}
        {!isFree && hasAccess && (
          <div className="w-full p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-xs text-green-700 dark:text-green-400 text-center font-medium">
              ✓ Full Access Unlocked
            </p>
          </div>
        )}

        {/* ✅ NEW: Paid Quiz (No Preview) */}
        {!isFree && !hasAccess && freeQuestionsCount === 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Start quiz and purchase when ready
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
