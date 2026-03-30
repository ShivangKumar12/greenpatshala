// client/src/pages/admin/components/CurrentAffairsManagement.tsx
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
  Newspaper,
  Calendar,
  MoreVertical,
  Tag,
  Link2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getCurrentAffairs,
  createCurrentAffair,
  updateCurrentAffair,
  deleteCurrentAffair,
  type CurrentAffair,
  type CurrentAffairPayload,
} from '@/services/currentAffairsApi';

type Importance = 'low' | 'medium' | 'high';

interface FormState {
  title: string;
  summary: string;
  content: string;
  category: string;
  date: string; // yyyy-mm-dd
  tags: string; // comma separated
  importance: Importance;
  thumbnail: string;
  source: string;
  sourceUrl: string;
}

const emptyForm: FormState = {
  title: '',
  summary: '',
  content: '',
  category: '',
  date: '',
  tags: '',
  importance: 'medium',
  thumbnail: '',
  source: '',
  sourceUrl: '',
};

export default function CurrentAffairsManagement() {
  const { toast } = useToast();

  const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [importanceFilter, setImportanceFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedAffair, setSelectedAffair] = useState<CurrentAffair | null>(
    null,
  );
  const [formData, setFormData] = useState<FormState>(emptyForm);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCurrentAffairs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryFilter, importanceFilter, searchQuery, monthFilter]);

  const fetchCurrentAffairs = async () => {
    try {
      setLoading(true);

      const filters: any = {
        page,
        limit: 20,
      };

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      if (categoryFilter !== 'all') {
        filters.category = categoryFilter;
      }

      if (importanceFilter !== 'all') {
        filters.importance = importanceFilter;
      }

      if (monthFilter !== 'all') {
        // monthFilter is yyyy-mm; build from/to
        const [year, month] = monthFilter.split('-');
        const fromDate = `${year}-${month}-01T00:00:00`;
        const toDate = `${year}-${month}-31T23:59:59`;
        filters.fromDate = fromDate;
        filters.toDate = toDate;
      }

      const res = await getCurrentAffairs(filters);

      setAffairs(res.items);
      setTotalPages(res.pagination.totalPages);
    } catch (error: any) {
      console.error('Failed to fetch current affairs:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to load current affairs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAffair = async () => {
    try {
      if (!formData.title || !formData.content || !formData.category || !formData.date) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields (*)',
          variant: 'destructive',
        });
        return;
      }

      const payload: CurrentAffairPayload = {
        title: formData.title,
        summary: formData.summary || undefined,
        content: formData.content,
        category: formData.category,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
        thumbnail: formData.thumbnail || undefined,
        source: formData.source || undefined,
                sourceUrl: formData.sourceUrl || undefined,
        date: `${formData.date}T00:00:00`,
        importance: formData.importance,
      };

      await createCurrentAffair(payload);

      toast({
        title: 'Current affair added',
        description: 'New current affair has been created successfully',
      });

      setIsAddDialogOpen(false);
      resetForm();
      setPage(1);
      fetchCurrentAffairs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to create current affair',
        variant: 'destructive',
      });
    }
  };

  const handleEditAffair = async () => {
    if (!selectedAffair) return;

    try {
      if (!formData.title || !formData.content || !formData.category || !formData.date) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields (*)',
          variant: 'destructive',
        });
        return;
      }

      const payload: Partial<CurrentAffairPayload> = {
        title: formData.title,
        summary: formData.summary || undefined,
        content: formData.content,
        category: formData.category,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        thumbnail: formData.thumbnail || undefined,
        source: formData.source || undefined,
        sourceUrl: formData.sourceUrl || undefined,
        date: `${formData.date}T00:00:00`,
        importance: formData.importance,
      };

      await updateCurrentAffair(selectedAffair.id, payload);

      toast({
        title: 'Current affair updated',
        description: 'Current affair has been updated successfully',
      });

      setIsEditDialogOpen(false);
      setSelectedAffair(null);
      resetForm();
      fetchCurrentAffairs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to update current affair',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAffair = async () => {
    if (!selectedAffair) return;

    try {
      await deleteCurrentAffair(selectedAffair.id);

      toast({
        title: 'Current affair deleted',
        description: 'Current affair has been deleted successfully',
      });

      setIsDeleteDialogOpen(false);
      setSelectedAffair(null);
      fetchCurrentAffairs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to delete current affair',
        variant: 'destructive',
      });
    }
  };

  const openAddDialog = () => {
    resetForm();
    setSelectedAffair(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (affair: CurrentAffair) => {
    setSelectedAffair(affair);
    setFormData({
      title: affair.title,
      summary: affair.summary || '',
      content: affair.content,
      category: affair.category,
      date: affair.date ? affair.date.split('T')[0] : '',
      tags: Array.isArray(affair.tags) ? affair.tags.join(', ') : '',
      importance: (affair.importance as Importance) || 'medium',
      thumbnail: affair.thumbnail || '',
      source: affair.source || '',
      sourceUrl: affair.sourceUrl || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (affair: CurrentAffair) => {
    setSelectedAffair(affair);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(emptyForm);
  };

  const getImportanceBadgeVariant = (importance: string) => {
    switch (importance.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const filteredAffairs = affairs.filter((affair) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      affair.title.toLowerCase().includes(q) ||
      (affair.summary || '').toLowerCase().includes(q) ||
      affair.content.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === 'all' || affair.category === categoryFilter;

    const matchesImportance =
      importanceFilter === 'all' ||
      affair.importance?.toLowerCase() === importanceFilter.toLowerCase();

    const matchesMonth =
      monthFilter === 'all' ||
      (affair.date &&
        affair.date.startsWith(monthFilter)); // yyyy-mm

    return matchesSearch && matchesCategory && matchesImportance && matchesMonth;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading current affairs...</p>
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
            <CardTitle className="text-xl">Current Affairs Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage daily current affairs updates
            </p>
          </div>
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => (open ? openAddDialog() : setIsAddDialogOpen(false))}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Current Affair
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Current Affair</DialogTitle>
                <DialogDescription>
                  Add a new current affairs update
                </DialogDescription>
              </DialogHeader>

              <CurrentAffairForm
                formData={formData}
                setFormData={setFormData}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddAffair}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        {/* Filters */}
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search current affairs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="National">National</SelectItem>
                <SelectItem value="International Relations">
                  International Relations
                </SelectItem>
                <SelectItem value="Economy">Economy</SelectItem>
                <SelectItem value="Science & Technology">
                  Science & Technology
                </SelectItem>
                <SelectItem value="Environment">Environment</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Defence">Defence</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Judiciary">Judiciary</SelectItem>
                <SelectItem value="Agriculture">Agriculture</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={importanceFilter}
              onValueChange={(value) => {
                setImportanceFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Importance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="month"
              className="w-full sm:w-40"
              value={monthFilter === 'all' ? '' : monthFilter}
              onChange={(e) => {
                const value = e.target.value || 'all';
                setMonthFilter(value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Affairs List */}
      <div className="space-y-4">
        {filteredAffairs.map((affair) => (
          <Card key={affair.id} className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{affair.category}</Badge>
                    {affair.importance && (
                      <Badge variant={getImportanceBadgeVariant(affair.importance)}>
                        {affair.importance.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    {affair.title}
                  </h3>
                  {affair.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {affair.summary}
                    </p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(affair)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(affair)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {affair.content}
              </p>

              {Array.isArray(affair.tags) && affair.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {affair.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between pt-3 border-t text-sm text-muted-foreground gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {affair.date
                      ? new Date(affair.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'No date'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4" />
                  <span>
                    Added on{' '}
                    {new Date(affair.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAffairs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No current affairs found</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Current Affair</DialogTitle>
            <DialogDescription>Update current affair details</DialogDescription>
          </DialogHeader>

          <CurrentAffairForm
            formData={formData}
            setFormData={setFormData}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedAffair(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditAffair}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Current Affair</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedAffair?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAffair}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Shared form used in Add & Edit */
function CurrentAffairForm({
  formData,
  setFormData,
}: {
  formData: FormState;
  setFormData: (data: FormState) => void;
}) {
  const update =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData({ ...formData, [field]: e.target.value });

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="e.g., India Achieves Economic Milestone"
          value={formData.title}
          onChange={update('title')}
        />
      </div>

      <div className="space-y-2">
        <Label>Short Summary</Label>
        <Textarea
          placeholder="2–3 lines summary for list cards"
          value={formData.summary}
          onChange={update('summary')}
          rows={3}
        />
      </div>

            <div className="space-y-2">
        <Label>
          Content <span className="text-red-500">*</span>
        </Label>
        <Textarea
          placeholder="Describe the current affair in detail"
          value={formData.content}
          onChange={update('content')}
          rows={6}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="National">National</SelectItem>
              <SelectItem value="International Relations">
                International Relations
              </SelectItem>
              <SelectItem value="Economy">Economy</SelectItem>
              <SelectItem value="Science & Technology">
                Science & Technology
              </SelectItem>
              <SelectItem value="Environment">Environment</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Defence">Defence</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Judiciary">Judiciary</SelectItem>
              <SelectItem value="Agriculture">Agriculture</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>
            Importance <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.importance}
            onValueChange={(value: Importance) =>
              setFormData({ ...formData, importance: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select importance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Date <span className="text-red-500">*</span>
        </Label>
        <Input
          type="date"
          value={formData.date}
          onChange={update('date')}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags (comma separated)</Label>
        <Input
          placeholder="e.g., Economy, GDP, Growth"
          value={formData.tags}
          onChange={update('tags')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Thumbnail URL <span className="text-xs text-muted-foreground">(optional)</span>
          </Label>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="https://example.com/image.jpg"
              value={formData.thumbnail}
              onChange={update('thumbnail')}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Source (name)</Label>
          <Input
            placeholder="e.g., PIB, The Hindu"
            value={formData.source}
            onChange={update('source')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Source URL</Label>
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://official-source-link"
            value={formData.sourceUrl}
            onChange={update('sourceUrl')}
          />
        </div>
      </div>
    </div>
  );
}



