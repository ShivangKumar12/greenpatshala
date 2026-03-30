import JobCard from '../cards/JobCard';

export default function JobCardExample() {
  return (
    <div className="max-w-2xl">
      <JobCard
        id="1"
        title="IBPS PO Recruitment 2024 - 3049 Posts"
        department="Banking"
        location="All India"
        lastDate="2024-12-31"
        applyLink="https://ibps.in"
        description="Institute of Banking Personnel Selection invites applications for Probationary Officers in various participating banks."
        category="Bank PO"
        postedDate="2024-11-15"
      />
    </div>
  );
}
