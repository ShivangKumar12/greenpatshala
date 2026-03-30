import StatCard from '../cards/StatCard';
import { BookOpen, FileQuestion, Trophy, Clock } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-xl">
      <StatCard title="Enrolled Courses" value={5} icon={BookOpen} variant="primary" />
      <StatCard title="Quizzes Completed" value={23} icon={FileQuestion} variant="success" />
      <StatCard title="Certificates Earned" value={3} icon={Trophy} variant="warning" />
      <StatCard title="Study Hours" value="142" icon={Clock} variant="default" />
    </div>
  );
}
