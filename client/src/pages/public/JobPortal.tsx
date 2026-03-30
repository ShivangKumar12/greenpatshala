// client/src/pages/public/JobPortal.tsx
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import JobCard from '@/components/cards/JobCard';
import { Search, MapPin, Building2 } from 'lucide-react';
import { getAllJobs, getStates, getOrganizations } from '@/services/jobApi';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: number;
  title: string;
  organization: string;
  department: string | null;
  location: string | null;
  state: string | null;
  positions: number | null;
  qualifications: string | null;
  experience: string | null;
  salary: string | null;
  ageLimit: string | null;
  applicationFee: string | null;
  description: string | null;
  responsibilities: any;
  requirements: any;
  benefits: any;
  applyUrl: string | null;
  lastDate: string | null;
  examDate: string | null;
  status: string;
  views: number;
  createdAt: string;
}

// Department categories for filtering
const departments = ['All', 'Railway', 'Banking', 'SSC', 'UPSC', 'Defence', 'State Govt', 'Teaching', 'Other'];

export default function JobPortal() {
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [states, setStates] = useState<string[]>([]);
  const [organizations, setOrganizations] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
    fetchFilters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedDepartment, selectedLocation, sortBy, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getAllJobs({ status: 'active' });

      if (response.success) {
        setJobs(response.jobs);
        setFilteredJobs(response.jobs);
      }
    } catch (error: any) {
      console.error('Fetch jobs error:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to load jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [statesRes, orgsRes] = await Promise.all([
        getStates(),
        getOrganizations(),
      ]);

      if (statesRes.success) setStates(statesRes.states);
      if (orgsRes.success) setOrganizations(orgsRes.organizations);
    } catch (error) {
      console.error('Fetch filters error:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.organization.toLowerCase().includes(query) ||
          job.department?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(
        (job) =>
          job.department?.toLowerCase().includes(selectedDepartment.toLowerCase()) ||
          job.organization.toLowerCase().includes(selectedDepartment.toLowerCase())
      );
    }

    // Location filter
    if (selectedLocation !== 'All') {
      filtered = filtered.filter(
        (job) =>
          job.state === selectedLocation ||
          job.location?.includes(selectedLocation)
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'deadline') {
      filtered.sort((a, b) => {
        if (!a.lastDate) return 1;
        if (!b.lastDate) return -1;
        return new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime();
      });
    }

    setFilteredJobs(filtered);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('All');
    setSelectedLocation('All');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Updated Daily
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Government Job Portal</h1>
          <p className="text-muted-foreground max-w-2xl">
            Find the latest government job opportunities across India. Stay updated with new openings in banking, railways, SSC, UPSC, and more.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-card rounded-lg border p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-jobs"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger data-testid="select-department">
                <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger data-testid="select-location">
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Locations</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {departments.slice(1).map((dept) => (
            <Badge
              key={dept}
              variant={selectedDepartment === dept ? 'default' : 'outline'}
              className="cursor-pointer hover-elevate"
              onClick={() => setSelectedDepartment(selectedDepartment === dept ? 'All' : dept)}
              data-testid={`badge-dept-${dept.toLowerCase().replace(' ', '-')}`}
            >
              {dept}
            </Badge>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredJobs.length} jobs found
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="deadline">Deadline Soon</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              id={String(job.id)}
              title={job.title}
              department={job.department || job.organization}
              location={job.location || job.state || 'All India'}
              lastDate={job.lastDate || ''}
              applyLink={job.applyUrl || ''}
              description={job.description || ''}
              category={job.department || 'General'}
              postedDate={job.createdAt}
            />
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No jobs found matching your criteria</p>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              data-testid="button-reset-filters"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {filteredJobs.length > 0 && filteredJobs.length >= 10 && (
          <div className="mt-8 text-center">
            <Button variant="outline" data-testid="button-load-more">
              Load More Jobs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
