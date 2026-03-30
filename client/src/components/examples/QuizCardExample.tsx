import QuizCard from '../cards/QuizCard';

export default function QuizCardExample() {
  return (
    <div className="max-w-sm">
      <QuizCard
        id="1"
        title="Current Affairs Weekly Test"
        description="Test your knowledge of the latest national and international events."
        category="Current Affairs"
        questionsCount={50}
        duration={30}
        passingScore={60}
        attempts={45230}
        originalPrice={99}
        isFree={true}
        difficulty="Medium"
      />
    </div>
  );
}
