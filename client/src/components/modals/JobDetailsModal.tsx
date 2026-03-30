// client/src/components/modals/JobDetailsModal.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface SimpleJob {
  id: string;
  title: string;
  department: string;
  location: string;
  lastDate: string;
  postedDate: string;
  description: string;
  category: string;
  applyLink: string;
  // Optional extra fields if present in future
  organization?: string;
  vacancies?: number | string | null;
  qualification?: string;
  experience?: string;
  salary?: string;
  employmentType?: string;
  responsibilities?: string[] | null;
  eligibility?: string[] | null;
  howToApply?: string;
  importantDates?: Array<{ event: string; date: string }> | null;
  applicationFee?: string;
}

interface JobDetailsModalProps {
  job: SimpleJob;
  onClose: () => void;
}

export default function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  const handleApplyNow = () => {
    if (job.applyLink) {
      window.open(job.applyLink, '_blank');
    }
  };

  const responsibilities = Array.isArray(job.responsibilities)
    ? job.responsibilities
    : [];
  const eligibility = Array.isArray(job.eligibility) ? job.eligibility : [];
  const importantDates = Array.isArray(job.importantDates)
    ? job.importantDates
    : [];

  const formattedLastDate = job.lastDate
    ? new Date(job.lastDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Not specified';

  const formattedPostedDate = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Not specified';

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-background z-10 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {job.category && <Badge>{job.category}</Badge>}
                {job.department && (
                  <Badge variant="outline">{job.department}</Badge>
                )}
              </div>
              <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
              {job.organization && (
                <p className="text-muted-foreground">{job.organization}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-job-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-semibold text-sm">
                  {job.location || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Last Date</p>
                <p className="font-semibold text-sm text-destructive">
                  {formattedLastDate}
                </p>
              </div>
            </div>
            {job.salary && (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <p className="font-semibold text-sm">{job.salary}</p>
                </div>
              </div>
            )}
            {job.vacancies && (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Vacancies</p>
                  <p className="font-semibold text-sm">{job.vacancies}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-3">Job Description</h3>
            <p className="text-sm text-muted-foreground">
              {job.description || 'No description available.'}
            </p>
          </div>

          {/* Responsibilities (optional) */}
          {responsibilities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Key Responsibilities</h3>
              <ul className="space-y-2">
                {responsibilities.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility (optional) */}
          {(job.qualification || job.experience || eligibility.length > 0) && (
            <div>
              <h3 className="font-semibold mb-3">Eligibility Criteria</h3>
              <div className="space-y-3">
                {job.qualification && (
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">
                      Qualification
                    </p>
                    <p>{job.qualification}</p>
                  </div>
                )}
                {job.experience && (
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p>{job.experience}</p>
                  </div>
                )}
              </div>
              {eligibility.length > 0 && (
                <ul className="space-y-2 mt-4">
                  {eligibility.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Important Dates (optional) */}
          {importantDates.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Important Dates</h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                {importantDates.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.event}
                    </span>
                    <span className="font-semibold">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Fee (optional) */}
          {job.applicationFee && (
            <div>
              <h3 className="font-semibold mb-2">Application Fee</h3>
              <p className="text-sm text-muted-foreground">
                {job.applicationFee}
              </p>
            </div>
          )}

          {/* How to Apply (optional) */}
          {job.howToApply && (
            <div>
              <h3 className="font-semibold mb-2">How to Apply</h3>
              <p className="text-sm text-muted-foreground">
                {job.howToApply}
              </p>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 gap-2"
              size="lg"
              onClick={handleApplyNow}
              disabled={!job.applyLink}
              data-testid="button-apply-now-modal"
            >
              Apply Now
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Posted on {formattedPostedDate} | Always verify details on the official website
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
