// client/src/components/upload/FileUpload.tsx - WITH IMAGE PREVIEW
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, File, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onUpload: (file: File) => Promise<void>;
  label?: string;
  description?: string;
  uploadedFileUrl?: string;
  uploadedFileName?: string;
  showPreview?: boolean; // ✅ NEW: Show image preview
}

export default function FileUpload({
  accept = '*',
  maxSize = 10,
  onUpload,
  label = 'Upload File',
  description = 'Click to browse or drag and drop',
  uploadedFileUrl,
  uploadedFileName,
  showPreview = false, // ✅ NEW: Default false
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(''); // ✅ NEW: Preview URL
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    setError('');

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `File size must be less than ${maxSize}MB`,
      });
      return false;
    }

    // Check file type if specified
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;

      const isValid = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        return mimeType.match(type.replace('*', '.*'));
      });

      if (!isValid) {
        setError(`File type not supported. Allowed: ${accept}`);
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: `Allowed types: ${accept}`,
        });
        return false;
      }
    }

    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    
    // ✅ NEW: Generate preview for images
    if (showPreview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      setError('Upload failed. Please try again.');
      setPreviewUrl(''); // ✅ Clear preview on error
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your file',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(''); // ✅ Clear preview
    setUploadProgress(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayFileName = uploadedFileName || selectedFile?.name;
  const isComplete = uploadProgress === 100 || uploadedFileUrl;
  const isImage = accept.includes('image'); // ✅ Check if accepting images
  const displayPreview = showPreview && (previewUrl || uploadedFileUrl); // ✅ Show preview

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        data-testid="file-input"
      />

      {!selectedFile && !uploadedFileUrl ? (
        <Card
          className={`cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-dashed hover:border-primary/50'
          }`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          data-testid="upload-dropzone"
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {isImage ? (
                <ImageIcon className="w-6 h-6 text-primary" />
              ) : (
                <Upload className="w-6 h-6 text-primary" />
              )}
            </div>
            <h4 className="font-semibold mb-1">{label}</h4>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {description}
            </p>
            <Button variant="outline" size="sm" data-testid="button-browse">
              Browse Files
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Max file size: {maxSize}MB
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* ✅ NEW: Image Preview */}
              {displayPreview ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                  <img
                    src={previewUrl || uploadedFileUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  error 
                    ? 'bg-destructive/10' 
                    : isComplete 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-primary/10'
                }`}>
                  {error ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : isComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <File className="w-5 h-5 text-primary" />
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{displayFileName}</p>
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={handleRemove}
                    disabled={uploading}
                    data-testid="button-remove-file"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}

                {isComplete && !error && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Upload complete
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
