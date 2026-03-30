// client/src/pages/public/Quizzes.tsx
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QuizCard from "@/components/cards/QuizCard";
import { Search, Loader2 } from "lucide-react";
import { getAllQuizzes } from "@/services/quizApi";
import { useToast } from "@/hooks/use-toast";

type Difficulty = "Easy" | "Medium" | "Hard";
type PriceFilter = "all" | "free" | "paid";
type DifficultyFilter = "all" | Difficulty;

interface QuizCardData {
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
  isFree: boolean;
  difficulty: Difficulty;
  hasAccess?: boolean;
  freeQuestionsCount?: number; // ✅ NEW: Free preview questions
  isScheduled?: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<QuizCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);

      const filters: {
        difficulty?: string;
        courseId?: number;
      } = {};

      if (difficultyFilter !== "all") {
        filters.difficulty = difficultyFilter.toLowerCase();
      }

      const response = await getAllQuizzes(filters);
      console.log("✅ Full API Response:", response);

      let quizzesData: any[] = [];

      if (response && response.success && Array.isArray(response.quizzes)) {
        quizzesData = response.quizzes;
      } else if (Array.isArray(response)) {
        quizzesData = response;
      } else {
        console.error("❌ Unexpected response format:", response);
        throw new Error("Invalid response format from server");
      }

      const accessibleQuizzes = quizzesData.filter((quiz: any) => {
        return quiz.is_published === 1 || quiz.is_published === true;
      });

      const transformed: QuizCardData[] = accessibleQuizzes.map(
        (quiz: any): QuizCardData => {
          const rawDifficulty =
            typeof quiz.difficulty === "string"
              ? quiz.difficulty.toLowerCase()
              : "easy";
          const difficultyMap: Record<string, Difficulty> = {
            easy: "Easy",
            medium: "Medium",
            hard: "Hard",
          };
          const difficulty = difficultyMap[rawDifficulty] ?? ("Easy" as Difficulty);

          const price = parseFloat(quiz.price ?? "0");
          const discount = quiz.discount_price
            ? parseFloat(quiz.discount_price)
            : undefined;

          return {
            id: String(quiz.id),
            title: quiz.title,
            description: quiz.description || "No description available",
            category: quiz.category || "General",
            questionsCount:
              typeof quiz.total_questions === "number"
                ? quiz.total_questions
                : 0,
            duration: Number(quiz.duration) || 0,
            passingScore: Number(quiz.passing_marks) || 0,
            attempts:
              typeof quiz.total_attempts === "number"
                ? quiz.total_attempts
                : 0,
            originalPrice: isNaN(price) ? 0 : price,
            discountPrice: discount && !isNaN(discount) ? discount : undefined,
            isFree: quiz.isFree === true || !price || price === 0,
            difficulty,
            hasAccess: quiz.has_access === true,
            freeQuestionsCount: Number(quiz.freeQuestionsCount) || 0, // ✅ NEW: Map free preview count
            isScheduled: quiz.is_scheduled === 1 || quiz.is_scheduled === true,
            startTime: quiz.start_time ?? null,
            endTime: quiz.end_time ?? null,
          };
        }
      );

      console.log("🎨 Transformed quizzes:", transformed);
      setQuizzes(transformed);
    } catch (error: any) {
      console.error("❌ Fetch error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch quizzes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    if (
      searchQuery &&
      !quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (priceFilter === "free" && !quiz.isFree) return false;
    if (priceFilter === "paid" && quiz.isFree) return false;

    if (difficultyFilter !== "all" && quiz.difficulty !== difficultyFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Practice Quizzes
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Test your knowledge with our time-based quizzes. Start any quiz instantly and unlock full access as you go!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-quizzes"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select
                value={priceFilter}
                onValueChange={(v) => setPriceFilter(v as PriceFilter)}
              >
                <SelectTrigger className="w-32" data-testid="select-price">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={difficultyFilter}
                onValueChange={(v) =>
                  setDifficultyFilter(v as DifficultyFilter)
                }
              >
                <SelectTrigger
                  className="w-32"
                  data-testid="select-difficulty"
                >
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading..."
              : `Showing ${filteredQuizzes.length} ${filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}`}
          </p>
          {(priceFilter !== "all" || difficultyFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPriceFilter("all");
                setDifficultyFilter("all");
              }}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} {...quiz} />
              ))}
            </div>

            {filteredQuizzes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No quizzes found matching your criteria.
                  {quizzes.length === 0 && " Please check back later for new quizzes."}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setPriceFilter("all");
                    setDifficultyFilter("all");
                  }}
                  data-testid="button-reset-filters"
                >
                  Reset All Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
