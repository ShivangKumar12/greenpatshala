// client/src/components/instructor/tabs/InstructorCurrentAffairs.tsx
import CurrentAffairsManagement from '../../admin/components/CurrentAffairsManagement';

export default function InstructorCurrentAffairs() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Current Affairs</h2>
        <p className="text-muted-foreground">
          Create and manage current affairs content for students
        </p>
      </div>
      <CurrentAffairsManagement />
    </div>
  );
}
