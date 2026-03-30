// client/src/components/cards/JobCard.tsx

import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Building2, ExternalLink, Clock } from 'lucide-react';
import JobDetailsModal from '@/components/modals/JobDetailsModal';

interface JobCardProps {
  id: string;
  title: string;
  department: string;
  location: string;
  lastDate: string;
  applyLink: string;
  description: string;
  category: string;
  postedDate: string;
}

export default function JobCard({
  id,
  title,
  department,
  location,
  lastDate,
  applyLink,
  description,
  category,
  postedDate,
}: JobCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const isExpiringSoon = () => {
    const lastDateObj = new Date(lastDate);
    const today = new Date();
    const diffDays = Math.ceil(
      (lastDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 7 && diffDays > 0;
  };

  const isExpired = () => {
    return new Date(lastDate) < new Date();
  };

  const job = {
    id,
    title,
    department,
    location,
    lastDate,
    applyLink,
    description,
    category,
    postedDate,
  };

  return (
    <>
      <Card className="group glass-panel premium-shadow flex flex-col h-full" data-testid={`card-job-${id}`}>
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge variant="outline" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted/30 border-border/50 rounded-md">
                  {category}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1 shadow-sm rounded-md px-2.5 py-0.5 backdrop-blur-sm border-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Building2 className="w-3 h-3" />
                  {department}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                {title}
              </h3>
            </div>
            {isExpiringSoon() && !isExpired() && (
              <Badge className="bg-orange-500/90 text-white shrink-0 text-[10px] uppercase font-bold tracking-wide rounded-md px-2 shadow-sm border-0 animate-pulse">
                Expiring Soon
              </Badge>
            )}
            {isExpired() && (
              <Badge variant="destructive" className="shrink-0 text-[10px] uppercase font-bold tracking-wide rounded-md px-2 shadow-sm border-0">
                Expired
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-y-3 gap-x-4 text-xs font-medium text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border/40">
              <MapPin className="w-4 h-4 text-primary/70" />
              {location}
            </span>
            <span className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border/40">
              <Calendar className="w-4 h-4 text-primary/70" />
              Last Date:{' '}
              {new Date(lastDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border/40">
              <Clock className="w-4 h-4 text-primary/70" />
              Posted:{' '}
              {new Date(postedDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>

          <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              data-testid={`button-view-job-${id}`}
              className="rounded-full px-5 transition-all hover:bg-muted"
            >
              View Details
            </Button>
            <Button
              size="sm"
              disabled={isExpired()}
              onClick={() => window.open(applyLink, '_blank')}
              data-testid={`button-apply-job-${id}`}
              className="btn-premium rounded-full px-5 font-medium gap-1.5"
            >
              Apply Now
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <JobDetailsModal
          job={job} // full job object passed to modal
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}
