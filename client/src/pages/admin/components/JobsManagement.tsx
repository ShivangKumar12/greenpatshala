// client/src/pages/admin/components/JobsManagement.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Briefcase,
  Calendar,
  MapPin,
  ExternalLink,
  Eye,
  EyeOff,
  MoreVertical,
  Building2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllJobs, createJob, updateJob, deleteJob } from '@/services/jobApi';

interface Job {
  id: number;
  title: string;
  description: string | null;
  department: string | null;
  organization: string;
  location: string | null;
  state: string | null;
  positions: number | null;
  qualifications: string | null;
  experience: string | null;
  salary: string | null;
  ageLimit: string | null;
  applicationFee: string | null;
  applyUrl: string | null;
  lastDate: string | null;
  examDate: string | null;
  status: string;
  views: number;
  createdAt: string;
}

type JobFormState = {
  title: string;
  description: string;
  department: string;
  organization: string;
  location: string;
  state: string;
  positions: string;
  qualifications: string;
  experience: string;
  salary: string;
  ageLimit: string;
  applicationFee: string;
  applyUrl: string;
  lastDate: string;
  examDate: string;
  status: string;
};

const initialForm: JobFormState = {
  title: '',
  description: '',
  department: '',
  organization: '',
  location: '',
  state: '',
  positions: '',
  qualifications: '',
  experience: '',
  salary: '',
  ageLimit: '',
  applicationFee: '',
  applyUrl: '',
  lastDate: '',
  examDate: '',
  status: 'active',
};

export default function JobsManagement() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<JobFormState>(initialForm);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getAllJobs({});
      if (response.success) {
        setJobs(response.jobs);
      }
    } catch (error: any) {
      console.error('Failed to fetch jobs:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to load jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(q) ||
      job.organization.toLowerCase().includes(q);

    const matchesDepartment =
      departmentFilter === 'all' ||
      job.department?.toLowerCase() === departmentFilter.toLowerCase() ||
      job.organization.toLowerCase().includes(departmentFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || job.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const resetForm = () => {
    setFormData(initialForm);
  };

  const handleAddJob = async () => {
    try {
      if (!formData.title || !formData.organization || !formData.lastDate || !formData.applyUrl) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields (*)',
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        ...formData,
        positions: formData.positions ? parseInt(formData.positions, 10) : null,
      };

      await createJob(payload);
      toast({
        title: 'Job Added',
        description: 'New job post has been created successfully',
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create job post',
        variant: 'destructive',
      });
    }
  };

  const handleEditJob = async () => {
    if (!selectedJob) return;

    try {
      if (!formData.title || !formData.organization || !formData.lastDate || !formData.applyUrl) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields (*)',
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        ...formData,
        positions: formData.positions ? parseInt(formData.positions, 10) : null,
      };

      await updateJob(selectedJob.id, payload);
      toast({
        title: 'Job Updated',
        description: 'Job post has been updated successfully',
      });

      setIsEditDialogOpen(false);
      setSelectedJob(null);
      resetForm();
      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update job post',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    try {
      await deleteJob(selectedJob.id);
      toast({
        title: 'Job Deleted',
        description: 'Job post has been deleted successfully',
      });

      setIsDeleteDialogOpen(false);
      setSelectedJob(null);
      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete job post',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (job: Job) => {
    try {
      const newStatus = job.status === 'active' ? 'closed' : 'active';
      await updateJob(job.id, { status: newStatus });
      toast({
        title: newStatus === 'active' ? 'Job Activated' : 'Job Deactivated',
        description: `Job post has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      });
      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update job status',
        variant: 'destructive',
      });
    }
  };

  const openAddDialog = () => {
    setSelectedJob(null);
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      description: job.description || '',
      department: job.department || '',
      organization: job.organization,
      location: job.location || '',
      state: job.state || '',
      positions: job.positions?.toString() || '',
      qualifications: job.qualifications || '',
      experience: job.experience || '',
      salary: job.salary || '',
      ageLimit: job.ageLimit || '',
      applicationFee: job.applicationFee || '',
      applyUrl: job.applyUrl || '',
      lastDate: job.lastDate ? job.lastDate.split('T')[0] : '',
      examDate: job.examDate ? job.examDate.split('T')[0] : '',
      status: job.status,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-xl">Jobs Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Post and manage government job notifications
            </p>
          </div>

          {/* Add Job Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => (open ? openAddDialog() : setIsAddDialogOpen(false))}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Job
                            </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Job Post</DialogTitle>
                <DialogDescription>
                  Fill in the details to post a new job notification
                </DialogDescription>
              </DialogHeader>

              <JobForm
                formData={formData}
                setFormData={setFormData}
                onCancel={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
                onSubmit={handleAddJob}
                submitLabel="Create Job Post"
              />
            </DialogContent>
          </Dialog>
        </CardHeader>

        {/* Filters */}
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Banking">Banking</SelectItem>
                <SelectItem value="SSC">SSC</SelectItem>
                <SelectItem value="Railway">Railway</SelectItem>
                <SelectItem value="UPSC">UPSC</SelectItem>
                <SelectItem value="Defence">Defence</SelectItem>
                <SelectItem value="State PSC">State PSC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {job.department && (
                          <Badge variant="outline">{job.department}</Badge>
                        )}
                        <Badge
                          variant={job.status === 'active' ? 'default' : 'secondary'}
                        >
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(job)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(job)}>
                      {job.status === 'active' ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(job)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

                            {job.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {job.description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Org:</span>
                  <span className="font-medium">{job.organization}</span>
                </div>

                {job.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">
                      {job.location || job.state}
                    </span>
                  </div>
                )}

                {job.lastDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Date:</span>
                    <span className="font-medium">
                      {new Date(job.lastDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {job.positions && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Positions:</span>
                    <span className="font-medium">{job.positions}</span>
                  </div>
                )}
              </div>

              {job.salary && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Salary: </span>
                    <span className="font-medium">{job.salary}</span>
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span>
                    Posted{' '}
                    {new Date(job.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span>{job.views} views</span>
                </div>

                {job.applyUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(job.applyUrl!, '_blank')}
                  >
                    View Details
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No jobs found</p>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Job
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Post</DialogTitle>
            <DialogDescription>Update job post details</DialogDescription>
          </DialogHeader>

          <JobForm
            formData={formData}
            setFormData={setFormData}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedJob(null);
              resetForm();
            }}
            onSubmit={handleEditJob}
            submitLabel="Update Job Post"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Shared form used by both Add & Edit dialogs */
function JobForm({
  formData,
  setFormData,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  formData: JobFormState;
  setFormData: (data: JobFormState) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  const update = (field: keyof JobFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData({ ...formData, [field]: e.target.value });

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>
            Job Title <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="e.g., IBPS PO Recruitment 2025"
            value={formData.title}
            onChange={update('title')}
          />
        </div>

        <div className="space-y-2">
          <Label>
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder="Describe the job, recruitment process, and important details"
            value={formData.description}
            onChange={update('description')}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) =>
                setFormData({ ...formData, department: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Banking">Banking</SelectItem>
                <SelectItem value="SSC">SSC</SelectItem>
                <SelectItem value="Railway">Railway</SelectItem>
                <SelectItem value="UPSC">UPSC</SelectItem>
                <SelectItem value="Defence">Defence</SelectItem>
                <SelectItem value="State PSC">State PSC</SelectItem>
                <SelectItem value="Police">Police</SelectItem>
                <SelectItem value="Teaching">Teaching</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Organization <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., IBPS"
              value={formData.organization}
              onChange={update('organization')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="e.g., Mumbai"
              value={formData.location}
              onChange={update('location')}
            />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input
              placeholder="e.g., Maharashtra"
              value={formData.state}
              onChange={update('state')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Last Date to Apply <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.lastDate}
              onChange={update('lastDate')}
            />
          </div>
          <div className="space-y-2">
            <Label>Exam Date</Label>
            <Input
              type="date"
              value={formData.examDate}
              onChange={update('examDate')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Application Link <span className="text-red-500">*</span>
          </Label>
          <Input
            type="url"
            placeholder="https://"
            value={formData.applyUrl}
            onChange={update('applyUrl')}
          />
        </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Positions</Label>
            <Input
              type="number"
              placeholder="e.g., 4135"
              value={formData.positions}
              onChange={update('positions')}
            />
          </div>
          <div className="space-y-2">
            <Label>Salary Range</Label>
            <Input
              placeholder="e.g., ₹23,700 - ₹42,020"
              value={formData.salary}
              onChange={update('salary')}
            />
          </div>
          <div className="space-y-2">
            <Label>Application Fee</Label>
            <Input
              placeholder="e.g., ₹500"
              value={formData.applicationFee}
              onChange={update('applicationFee')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Age Limit</Label>
            <Input
              placeholder="e.g., 18-30 years"
              value={formData.ageLimit}
              onChange={update('ageLimit')}
            />
          </div>
          <div className="space-y-2">
            <Label>Experience</Label>
            <Input
              placeholder="e.g., 0-2 years"
              value={formData.experience}
              onChange={update('experience')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Qualifications</Label>
          <Textarea
            placeholder="e.g., Graduate in any discipline"
            value={formData.qualifications}
            onChange={update('qualifications')}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </DialogFooter>
    </>
  );
}


