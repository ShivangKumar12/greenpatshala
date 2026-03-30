// client/src/pages/admin/components/StudyMaterialsManagement.tsx - PRODUCTION READY
import { useState, useEffect, useCallback } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookMarked,
  Download,
  Eye,
  EyeOff,
  MoreVertical,
  FileText,
  Upload,
  File,
  X,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ✅ CONNECTED - Import API functions
import {
  getAdminStudyMaterials,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  togglePublishStudyMaterial,
  buildStudyMaterialFormData,
  validateStudyMaterial,
  formatFileSize,
  type StudyMaterial,
} from '@/services/studyMaterialsApi';

const CATEGORIES = ['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC', 'Other'];
const SUBJECTS = ['General Studies', 'Quantitative Aptitude', 'Reasoning', 'English', 'Current Affairs', 'Banking Awareness', 'Polity', 'History', 'Geography', 'Economy', 'Science'];

export default function StudyMaterialsManagement() {
  const { toast } = useToast();

  // States
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  
  // Upload states
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subject: '',
    isFree: true,
    price: '',
    discountPrice: '',
  });

  // ✅ CONNECTED - Debounced fetch
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStudyMaterials();
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter, subjectFilter, statusFilter]);

  // ✅ CONNECTED - Fetch materials from API
  const fetchStudyMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminStudyMaterials({
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        subject: subjectFilter !== 'all' ? subjectFilter : undefined,
        status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
      });

      const apiMaterials = response.materials || response.items || [];
      setMaterials(apiMaterials);
    } catch (error: any) {
      console.error('Failed to fetch study materials:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load study materials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, subjectFilter, statusFilter, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Only PDF files are allowed',
          variant: 'destructive',
        });
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'File size must be less than 100MB',
          variant: 'destructive',
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  // ✅ CONNECTED - Create material
  const handleAddMaterial = async () => {
    try {
      // Validate
      const validation = validateStudyMaterial(formData, true);
      if (!validation.valid) {
        toast({
          title: 'Validation Error',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      if (!selectedFile) {
        toast({
          title: 'No file selected',
          description: 'Please select a PDF file to upload',
          variant: 'destructive',
        });
        return;
      }

      setUploadingFile(true);

      // Build FormData
      const formDataToSend = buildStudyMaterialFormData(formData, selectedFile);

      // Create material
      await createStudyMaterial(formDataToSend);

      toast({
        title: 'Success',
        description: 'Study material uploaded successfully!',
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchStudyMaterials();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload study material',
        variant: 'destructive',
      });
    } finally {
      setUploadingFile(false);
    }
  };

  // ✅ CONNECTED - Edit material (with optional PDF)
  const handleEditMaterial = async () => {
    if (!selectedMaterial) return;

    try {
      // Validate
      const validation = validateStudyMaterial(formData, false);
      if (!validation.valid) {
        toast({
          title: 'Validation Error',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      setUploadingFile(true);

      // Build FormData if file selected, otherwise send JSON
      const payload = selectedFile
        ? buildStudyMaterialFormData(formData, selectedFile)
        : {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            subject: formData.subject,
            isPaid: !formData.isFree,
            price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
            discountPrice: formData.isFree || !formData.discountPrice 
              ? undefined 
              : parseFloat(formData.discountPrice),
          };

      await updateStudyMaterial(selectedMaterial.id, payload as any);

      toast({
        title: 'Success',
        description: 'Study material updated successfully!',
      });

      setIsEditDialogOpen(false);
      setSelectedMaterial(null);
      resetForm();
      fetchStudyMaterials();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update study material',
        variant: 'destructive',
      });
    } finally {
      setUploadingFile(false);
    }
  };

  // ✅ CONNECTED - Delete material
  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;

    try {
      await deleteStudyMaterial(selectedMaterial.id);

      toast({
        title: 'Success',
        description: 'Study material deleted successfully!',
      });

      setIsDeleteDialogOpen(false);
      setSelectedMaterial(null);
      fetchStudyMaterials();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete study material',
        variant: 'destructive',
      });
    }
  };

  // ✅ CONNECTED - Toggle publish
  const handleTogglePublish = async (material: StudyMaterial) => {
    try {
      await togglePublishStudyMaterial(material.id);

      toast({
        title: 'Success',
        description: `Study material ${material.isPublished ? 'unpublished' : 'published'} successfully!`,
      });

      fetchStudyMaterials();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setFormData({
      title: material.title,
      description: material.description || '',
      category: material.category,
      subject: material.subject,
      isFree: !material.isPaid,
      price: material.price?.toString() || '',
      discountPrice: material.discountPrice?.toString() || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      subject: '',
      isFree: true,
      price: '',
      discountPrice: '',
    });
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading study materials...</p>
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
            <CardTitle className="text-xl">Study Material Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Upload and manage study materials (PDFs) - {materials.length} total
            </p>
          </div>
          
          {/* Add Material Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Study Material
              </Button>
            </DialogTrigger>
            
            {/* Add Dialog Content */}
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Study Material</DialogTitle>
                <DialogDescription>
                  Upload a PDF file and fill in the details
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Upload PDF File *</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded">
                          <File className="w-6 h-6 text-primary" />
                          <div className="text-left min-w-0 flex-1">
                            <p className="font-medium truncate max-w-[250px]">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedFile(null);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="font-medium mb-1">Click to upload or drag and drop</p>
                          <p className="text-sm text-muted-foreground">PDF files only (max 100MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="e.g., UPSC Prelims Previous Year Papers"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe the study material content"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                {/* Category & Subject */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox
                      id="isFree"
                      checked={formData.isFree}
                      onCheckedChange={(checked) => setFormData({ ...formData, isFree: !!checked })}
                    />
                    <Label htmlFor="isFree" className="cursor-pointer text-sm">
                      This is a free resource
                    </Label>
                  </div>
                  
                  {!formData.isFree && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Price (₹) *</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 299"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Discount Price (₹)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 199"
                          value={formData.discountPrice}
                          onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  disabled={uploadingFile}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMaterial} disabled={uploadingFile || !selectedFile}>
                  {uploadingFile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Material'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        {/* Filters */}
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search study materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {SUBJECTS.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <Card key={material.id} className="hover-elevate group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {material.category}
                  </Badge>
                  <Badge
                    variant={material.isPublished ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {material.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  {material.isPaid && (
                    <Badge variant="secondary" className="text-xs">
                      Premium
                    </Badge>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(material)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTogglePublish(material)}>
                      {material.isPublished ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Publish
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(material)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-500/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-pink-600" />
              </div>

              <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {material.title}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {material.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subject</span>
                  <span className="font-medium">{material.subject}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">File Type</span>
                  <Badge variant="outline" className="text-xs">
                    {material.fileType}
                  </Badge>
                </div>
                {material.fileSize && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">File Size</span>
                    <span className="font-medium">{formatFileSize(material.fileSize)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    Downloads
                  </span>
                  <span className="font-medium">
                    {material.downloads.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  {!material.isPaid ? (
                    <span className="text-lg font-bold text-green-600">Free</span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-primary">
                        ₹{material.discountPrice || material.price}
                      </span>
                      {material.discountPrice && material.discountPrice < (material.price || 0) && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{material.price}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => window.open(material.fileUrl, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {materials.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No study materials found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Study Material</DialogTitle>
            <DialogDescription>
              Update study material details. Upload a new PDF to replace the existing file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Optional PDF Upload */}
            <div className="space-y-2">
              <Label>Upload New PDF (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload-edit"
                />
                <label htmlFor="file-upload-edit" className="cursor-pointer block">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded">
                      <File className="w-5 h-5 text-primary" />
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-medium truncate max-w-[200px] text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                        className="h-5 w-5 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                      <p className="text-sm font-medium">Click to replace PDF</p>
                      <p className="text-xs text-muted-foreground">Leave empty to keep existing file</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="e.g., UPSC Prelims Previous Year Papers"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the study material content"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            {/* Category & Subject */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(sub => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  id="editIsFree"
                  checked={formData.isFree}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFree: !!checked })}
                />
                <Label htmlFor="editIsFree" className="cursor-pointer text-sm">
                  This is a free resource
                </Label>
              </div>
              
              {!formData.isFree && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 299"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 199"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
              disabled={uploadingFile}
            >
              Cancel
            </Button>
            <Button onClick={handleEditMaterial} disabled={uploadingFile}>
              {uploadingFile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Material'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Study Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{selectedMaterial?.title}"</strong>? This
              action cannot be undone and the file will be permanently deleted from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMaterial}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
