// client/src/pages/user/QuizAttempt.tsx - WITH RAZORPAY INTEGRATION
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, Clock, CheckCircle2, Lock, CreditCard, Gift, Loader2, Tag } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getQuizForAttempt, submitQuizAttempt } from "@/services/quizApi";
import { createQuizOrder, verifyPayment } from "@/services/paymentApi";
import { useToast } from "@/hooks/use-toast";
import { useQuizSocket } from "@/hooks/useQuizSocket";
import ActiveUsersCounter from "@/components/quiz/ActiveUsersCounter";

// Razorpay type declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Question {
  id: number;
  question: string;
  options: string[];
  marks: number;
}

interface Answer {
  questionId: number;
  selectedOption: number | null;
}

export default function QuizAttempt() {
  const [match, params] = useRoute("/quiz/:id");
  const quizId = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { activeUsers, isConnected } = useQuizSocket(quizId);

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch quiz data
  useEffect(() => {
    if (!match || !quizId) {
      navigate("/quizzes");
      return;
    }
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // Around line 108 in fetchQuiz function
  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await getQuizForAttempt(Number(quizId));

      // ✅ Check if quiz was already attempted
      if (response.previousAttempt) {
        toast({
          title: "Already Attempted",
          description: "You have already attempted this quiz.",
          variant: "destructive",
        });
        navigate(`/quiz-result/${response.previousAttempt.id}`);
        return;
      }

      setQuiz(response.quiz);
      setQuestions(response.quiz.questions);
      setTimeLeft(response.quiz.duration * 60);

      const isPreview = response.quiz.requiresPayment === true;
      setIsPreviewMode(isPreview);

      const initialAnswers = response.quiz.questions.map((q: Question) => ({
        questionId: q.id,
        selectedOption: null,
      }));
      setAnswers(initialAnswers);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to load quiz",
        variant: "destructive",
      });
      navigate("/quizzes");
    } finally {
      setLoading(false);
    }
  };


  // Timer countdown
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, timeLeft]);

  const handleStartQuiz = () => {
    if (!quiz || questions.length === 0) return;
    setQuizStarted(true);
  };

  const handleAnswerChange = (questionId: number, optionIndex: number) => {
    setAnswers((prev) =>
      prev.map((ans) =>
        ans.questionId === questionId
          ? { ...ans, selectedOption: optionIndex }
          : ans
      )
    );
  };

  const canNavigateToQuestion = (index: number): boolean => {
    if (!isPreviewMode) return true;
    const freeCount = quiz?.freeQuestionsCount || 0;
    return index < freeCount;
  };

  const handleNext = () => {
    const nextIndex = currentQuestion + 1;

    if (!canNavigateToQuestion(nextIndex)) {
      setShowPaymentModal(true);
      return;
    }

    if (nextIndex < questions.length) {
      setCurrentQuestion(nextIndex);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleQuestionJump = (index: number) => {
    if (!canNavigateToQuestion(index)) {
      setShowPaymentModal(true);
      return;
    }

    if (index >= 0 && index < questions.length) {
      setCurrentQuestion(index);
    }
  };

  const handleSubmit = async () => {
    if (submitting || !quiz) return;

    if (isPreviewMode) {
      toast({
        title: "Purchase Required",
        description: "You must purchase the full quiz to submit your answers.",
        variant: "destructive",
      });
      setShowPaymentModal(true);
      return;
    }

    const unanswered = answers.filter((a) => a.selectedOption === null).length;

    if (unanswered > 0 && timeLeft > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      const timeTaken = quiz.duration * 60 - timeLeft;

      const response = await submitQuizAttempt(Number(quizId), {
        answers,
        timeTaken,
      });

      toast({
        title: "Success",
        description: response.message,
      });

      if (response.showResults) {
        navigate(`/quiz-result/${response.attemptId}`);
      } else {
        navigate("/my-attempts");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to submit quiz",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ RAZORPAY PAYMENT INTEGRATION
  const handlePurchaseQuiz = async () => {
    if (!razorpayLoaded) {
      toast({
        title: "Error",
        description: "Payment system is loading. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingPayment(true);

      // Create order
      const orderData = await createQuizOrder(
        Number(quizId),
        couponCode || undefined
      );

      if (!orderData.success) {
        throw new Error("Failed to create payment order");
      }

      // Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: "Unchi Udaan",
        description: `Purchase: ${orderData.quiz?.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyData = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.success) {
              toast({
                title: "Payment Successful! 🎉",
                description: "Access granted. Reloading quiz...",
              });

              setShowPaymentModal(false);

              // Reload quiz to get full access
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error: any) {
            toast({
              title: "Verification Failed",
              description: error?.response?.data?.message || "Please contact support.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again anytime.",
              variant: "destructive",
            });
          },
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#e74c3c",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description:
          error?.response?.data?.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getAnsweredCount = () =>
    answers.filter((a) => a.selectedOption !== null).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  // Around line 550 (Quiz Start Screen)
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
            <p className="text-muted-foreground mb-6">{quiz.description}</p>

            {isPreviewMode && (
              <Alert className="mb-6 border-orange-500 bg-orange-50">
                <Gift className="h-5 w-5 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Preview Mode:</strong> {quiz.paymentMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* ✅ ADD: Show attempt info */}
            {quiz.attemptsAllowed && quiz.attemptsUsed !== undefined && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Attempt:</strong> {quiz.attemptsUsed + 1} of {quiz.attemptsAllowed}
                  {quiz.attemptsRemaining > 0 && (
                    <span className="text-green-600 ml-2">
                      ({quiz.attemptsRemaining} remaining)
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* 🔥 Real-time Active Users Counter */}
            <ActiveUsersCounter activeUsers={activeUsers} isConnected={isConnected} />

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Duration: {quiz.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                {isPreviewMode ? (
                  <>
                    <span>
                      Preview Questions: {quiz.freeQuestionsCount} of {quiz.totalQuestions}
                    </span>
                    <Lock className="w-4 h-4 text-orange-500 ml-1" />
                  </>
                ) : (
                  <span>Total Questions: {questions.length}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <span>Total Marks: {quiz.total_marks}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <span>Passing Marks: {quiz.passing_marks}</span>
              </div>
            </div>

            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Once you start the quiz, the timer will begin. You cannot pause
                or restart the quiz. Make sure you have a stable internet
                connection.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="flex-1"
                disabled={questions.length === 0}
              >
                {isPreviewMode ? "Start Preview" : "Start Quiz"}
              </Button>

              {isPreviewMode && (
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  size="lg"
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={processingPayment || !razorpayLoaded}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Purchase Full Quiz
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }


  const currentQ = questions[currentQuestion];
  const currentAnswer = answers.find((a) => a.questionId === currentQ.id);
  const isLastFreeQuestion = isPreviewMode && currentQuestion === (quiz.freeQuestionsCount - 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{quiz.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
                {isPreviewMode && (
                  <span className="text-orange-600 font-medium ml-2">
                    (Preview Mode - {quiz.freeQuestionsCount} Free)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* 🔥 Compact Active Users Counter in header */}
              <ActiveUsersCounter activeUsers={activeUsers} isConnected={isConnected} compact />
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 300
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground"
                  }`}
              >
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg font-bold">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="bg-orange-50 border-b border-orange-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-orange-800">
                  <strong>Free Preview:</strong> Answering question {currentQuestion + 1} of {quiz.freeQuestionsCount} free questions.
                  Purchase to access all {quiz.totalQuestions} questions.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowPaymentModal(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Purchase Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card className="p-6 mb-6">
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1}
                </span>
                <span className="float-right text-sm font-medium">
                  Marks: {currentQ.marks}
                </span>
              </div>

              <h2 className="text-xl font-semibold mb-6">
                {currentQ.question}
              </h2>

              <RadioGroup
                value={currentAnswer?.selectedOption?.toString()}
                onValueChange={(value) =>
                  handleAnswerChange(currentQ.id, parseInt(value, 10))
                }
              >
                {currentQ.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </Card>

            {isLastFreeQuestion && (
              <Alert className="mb-6 border-orange-500 bg-orange-50">
                <Lock className="h-5 w-5 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>This is your last free question!</strong> Purchase the full quiz to continue and submit your answers.
                </AlertDescription>
              </Alert>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || isPreviewMode}
                  className={isPreviewMode ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {isPreviewMode ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Purchase to Submit
                    </>
                  ) : submitting ? (
                    "Submitting..."
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {isLastFreeQuestion ? (
                    <>
                      Purchase to Continue
                      <Lock className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold mb-4">Question Navigator</h3>

              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Answered:</span>
                    <span className="font-semibold text-green-600">
                      {getAnsweredCount()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Not Answered:</span>
                    <span className="font-semibold text-orange-600">
                      {questions.length - getAnsweredCount()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((_, index) => {
                  const isAnswered = answers[index]?.selectedOption !== null;
                  const isCurrent = index === currentQuestion;
                  const isLocked = !canNavigateToQuestion(index);

                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionJump(index)}
                      disabled={isLocked}
                      className={`aspect-square rounded-lg text-sm font-medium transition-colors relative ${isCurrent
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : isLocked
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : isAnswered
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                      {isLocked ? (
                        <Lock className="w-3 h-3 absolute inset-0 m-auto" />
                      ) : (
                        index + 1
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={isPreviewMode ? () => setShowPaymentModal(true) : handleSubmit}
                disabled={submitting || processingPayment}
                className="w-full"
                variant={isPreviewMode ? "default" : "destructive"}
              >
                {isPreviewMode ? (
                  processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Purchase Quiz
                    </>
                  )
                ) : submitting ? (
                  "Submitting..."
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              Premium Content Locked
            </DialogTitle>
            <DialogDescription className="pt-4">
              You've reached the end of the free preview. To access all {quiz?.totalQuestions} questions and submit your quiz, purchase the full version.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Free Questions:</span>
                <span className="font-semibold">{quiz?.freeQuestionsCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="font-semibold">{quiz?.totalQuestions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Locked Questions:</span>
                <span className="font-semibold text-orange-600">
                  {(quiz?.totalQuestions || 0) - (quiz?.freeQuestionsCount || 0)}
                </span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">
                Full Quiz Price
              </p>
              <div className="flex items-baseline gap-2">
                {quiz?.discount_price && parseFloat(quiz.discount_price) > 0 ? (
                  <>
                    <span className="text-3xl font-bold text-green-700">
                      ₹{parseFloat(quiz.discount_price).toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{parseFloat(quiz.price).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-green-700">
                    ₹{parseFloat(quiz?.price || "0").toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Coupon Input */}
            <div className="space-y-2">
              <Label htmlFor="coupon" className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Have a coupon code?
              </Label>
              <Input
                id="coupon"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={processingPayment}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              disabled={processingPayment}
            >
              Continue Preview
            </Button>
            <Button
              type="button"
              onClick={handlePurchaseQuiz}
              className="bg-green-600 hover:bg-green-700"
              disabled={processingPayment || !razorpayLoaded}
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Purchase Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
