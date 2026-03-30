// client/src/components/instructor/tabs/InstructorStudyMaterial.tsx
import StudyMaterialsManagement from '../../admin/components/StudyMaterialManagement';

export default function InstructorStudyMaterial() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Study Materials</h2>
        <p className="text-muted-foreground">
          Upload and manage study materials for your courses
        </p>
      </div>
      <StudyMaterialsManagement />
    </div>
  );
}
