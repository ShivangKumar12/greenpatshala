// client/src/components/upload/ImageUpload.tsx
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Camera } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<string>; // Returns uploaded image URL
  currentImageUrl?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  maxSizeMB?: number;
  label?: string;
}

export default function ImageUpload({
  onUpload,
  currentImageUrl,
  aspectRatio = 'square',
  maxSizeMB = 5,
  label = 'Upload Image',
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please select an image file',
      });
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `Image size must be less than ${maxSizeMB}MB`,
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const uploadedUrl = await onUpload(file);
      setPreviewUrl(uploadedUrl);
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully',
      });
    } catch (error) {
      setPreviewUrl(currentImageUrl || '');
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your image',
      });
    } finally {
      setUploading(false);
    }
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
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        data-testid="image-input"
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className={`relative ${aspectRatioClasses[aspectRatio]} bg-muted`}>
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleClick}
                    disabled={uploading}
                    data-testid="button-change-image"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Change
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                    disabled={uploading}
                    data-testid="button-remove-image"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </>
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleClick}
                data-testid="image-dropzone"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">{label}</h4>
                <p className="text-sm text-muted-foreground text-center px-4">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Max {maxSizeMB}MB
                </p>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
