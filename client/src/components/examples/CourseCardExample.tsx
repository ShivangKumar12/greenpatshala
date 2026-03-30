import CourseCard from '../cards/CourseCard';

export default function CourseCardExample() {
  return (
    <div className="max-w-sm">
      <CourseCard
        id="1"
        title="Complete UPSC CSE Preparation"
        description="Comprehensive course covering all subjects for UPSC Civil Services Examination with expert guidance."
        instructor="Dr. Rajesh Kumar"
        duration="12 months"
        lessons={450}
        students={15420}
        rating={4.8}
        originalPrice={49999}
        discountPrice={29999}
        category="UPSC"
        level="Advanced"
      />
    </div>
  );
}
