// client/src/components/cards/StudyMaterialCard.tsx - PRODUCTION READY WITH PAYMENT REDIRECT
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Lock, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  updateStudyMaterial,
  deleteStudyMaterial,
  incrementDownload,
} from '@/services/studyMaterialsApi';
import PDFViewer from '@/components/PDFViewer';
import LockedPDFPreview from '@/components/LockedPDFPreview';

interface StudyMaterialCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  fileType: 'pdf' | 'doc' | 'video' | 'link';
  downloads: number;
  originalPrice: number;
  discountPrice?: number;
  isFree?: boolean;
  isPurchased?: boolean;
  tags: string[];
  fileUrl?: string;
  totalPages?: number;
  onUpdate?: () => void;
  isAdmin?: boolean;
}

export default function StudyMaterialCard({
  id,
  title,
  description,
  category,
  subject,
  fileType,
  downloads,
  originalPrice,
  discountPrice,
  isFree = false,
  isPurchased = false,
  tags,
  fileUrl,
  totalPages,
  onUpdate,
  isAdmin = false,
}: StudyMaterialCardProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title,
    description,
    category,
    subject,
    price: originalPrice.toString(),
    discountPrice: discountPrice?.toString() || '',
    isFree,
  });

  const hasDiscount =
    discountPrice !== undefined && discountPrice < originalPrice;
  const canAccess = isFree || isPurchased;

  const fileTypeIcons = {
    pdf: '📄',
    doc: '📝',
    video: '🎥',
    link: '🔗',
  } as const;

  const fileTypeColors = {
    pdf: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    doc: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    video:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    link: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  } as const;

  // Update Study Material
  const handleUpdate = async () => {
    try {
      setUploading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('isFree', formData.isFree.toString());

      if (!formData.isFree) {
        formDataToSend.append('price', formData.price || '0');
        if (formData.discountPrice) {
          formDataToSend.append('discountPrice', formData.discountPrice);
        }
      }

      if (pdfFile) {
        formDataToSend.append('file', pdfFile);
      }

      await updateStudyMaterial(Number(id), formDataToSend as any);

      toast({
        title: 'Success',
        description: 'Study material updated successfully',
      });

      setIsEditDialogOpen(false);
      setPdfFile(null);
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete Study Material
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteStudyMaterial(Number(id));

      toast({
        title: 'Success',
        description: 'Study material deleted successfully',
      });

      setIsDeleteDialogOpen(false);
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Download with Counter
  const handleDownload = async () => {
    try {
      await incrementDownload(Number(id));

      const downloadUrl = fileUrl?.startsWith('http')
        ? fileUrl
        : `${window.location.origin}${fileUrl}`;
      window.open(downloadUrl, '_blank');

      toast({
        title: 'Downloading',
        description: 'Your download has started',
      });

      onUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  // Preview PDF
  const handlePreview = () => {
    setIsPreviewDialogOpen(true);
  };

  // Handle Purchase -> redirect to dedicated payment page
  const handlePurchase = () => {
    setIsPreviewDialogOpen(false);
    navigate(`/payment/material/${id}`);
  };

  return (
    <>
      <Card
        className="hover-elevate transition-shadow duration-200"
        data-testid={`card-material-${id}`}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            {/* File Type Icon */}
            <div
              className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center ${
                fileTypeColors[fileType]
              }`}
            >
              <span className="text-2xl">{fileTypeIcons[fileType]}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 w-full">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {subject}
                </Badge>
                {!canAccess && (
                  <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    Premium
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2 break-words">
                {title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-3 break-words">
                {description}
              </p>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 3 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      +{tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground order-2 sm:order-1">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden xs:inline">
                      {downloads.toLocaleString()} downloads
                    </span>
                    <span className="xs:hidden">
                      {downloads > 999
                        ? `${(downloads / 1000).toFixed(1)}k`
                        : downloads}
                    </span>
                  </span>
                  <span className="uppercase font-medium">{fileType}</span>
                  {totalPages && <span>{totalPages} pages</span>}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 order-1 sm:order-2">
                  {/* Price Badge */}
                  {!isFree && !isPurchased && (
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {hasDiscount ? (
                        <>
                          <span className="line-through text-muted-foreground mr-1 text-xs">
                            ₹{originalPrice}
                          </span>
                          <span className="text-base">₹{discountPrice}</span>
                        </>
                      ) : (
                        `₹${originalPrice}`
                      )}
                    </span>
                  )}
                  {isFree && (
                    <Badge className="bg-green-600 text-white">Free</Badge>
                  )}

                  {/* Admin Actions */}
                  {isAdmin ? (
                    <div className="flex gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(true)}
                        className="h-9 w-9 sm:w-auto p-0 sm:px-3"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline ml-2">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="h-9 w-9 sm:w-auto p-0 sm:px-3"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline ml-2">Delete</span>
                      </Button>
                    </div>
                  ) : canAccess ? (
                    /* Free/Purchased Material Actions */
                    <div className="flex gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePreview}
                        data-testid={`button-preview-material-${id}`}
                        className="h-9 w-9 sm:w-auto p-0 sm:px-3"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline ml-2">Preview</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDownload}
                        data-testid={`button-download-material-${id}`}
                        className="h-9 px-3"
                      >
                        <Download className="w-3.5 h-3.5 mr-1 sm:mr-2" />
                        <span className="hidden xs:inline">Download</span>
                        <span className="xs:hidden">Get</span>
                      </Button>
                    </div>
                  ) : (
                    /* Paid Material Actions */
                    <div className="flex gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePreview}
                        data-testid={`button-preview-material-${id}`}
                        className="h-9 w-9 sm:w-auto p-0 sm:px-3"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline ml-2">Preview</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={handlePurchase}
                        data-testid={`button-buy-material-${id}`}
                        className="h-9 px-4"
                      >
                        Buy Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Study Material</DialogTitle>
            <DialogDescription>
              Update material details and upload new PDF if needed
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter material title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Enter material description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPSC">UPSC</SelectItem>
                    <SelectItem value="SSC">SSC</SelectItem>
                    <SelectItem value="Banking">Banking</SelectItem>
                    <SelectItem value="Railways">Railways</SelectItem>
                    <SelectItem value="State PSC">State PSC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="e.g., History, Maths"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  disabled={formData.isFree}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Discount Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.discountPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPrice: e.target.value })
                  }
                  disabled={formData.isFree}
                  placeholder="Optional"
                />
              </div>
            </div>

                        <div className="flex items-center space-x-2">
              <Checkbox
                id="isFree"
                checked={formData.isFree}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFree: !!checked })
                }
              />
              <Label htmlFor="isFree" className="cursor-pointer">
                Free Material
              </Label>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label>Upload New PDF (Optional)</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
              {pdfFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {pdfFile.name} (
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={uploading}>
              {uploading ? 'Updating...' : 'Update Material'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Study Material?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <strong>{title}</strong> and remove the file from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog - Full or Locked */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-sm flex-wrap">
              <span className="capitalize">{category}</span>
              <span>•</span>
              <span>{subject}</span>
              {totalPages && (
                <>
                  <span>•</span>
                  <span>{totalPages} pages</span>
                </>
              )}
              {!canAccess && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Premium Preview
                  </Badge>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* PDF Viewer Container */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {fileUrl ? (
              canAccess ? (
                <PDFViewer
                  pdfUrl={
                    fileUrl.startsWith('http')
                      ? fileUrl
                      : `${window.location.origin}${fileUrl}`
                  }
                  title={title}
                  className="w-full h-full"
                />
              ) : (
                <LockedPDFPreview
                  pdfUrl={
                    fileUrl.startsWith('http')
                      ? fileUrl
                      : `${window.location.origin}${fileUrl}`
                  }
                  title={title}
                  price={originalPrice}
                  discountPrice={discountPrice}
                  category={category}
                  subject={subject}
                  totalPages={totalPages}
                  onPurchase={handlePurchase}
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <p className="text-muted-foreground">PDF not available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

