// client/src/components/instructor/tabs/InstructorJobs.tsx
import { useEffect, useState } from 'react';
import JobsManagement from '../../admin/components/JobsManagement';

export default function InstructorJobs() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Job Openings</h2>
        <p className="text-muted-foreground">
          Post and manage government job opportunities
        </p>
      </div>
      <JobsManagement />
    </div>
  );
}
