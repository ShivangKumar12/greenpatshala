import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileVideo, FileText, Image, X, Check } from 'lucide-react';

type FileType = 'video' | 'pdf' | 'asset';

type Course = {
  id: number;
  title: string;
};

type Props = {
  onUploadComplete: (fileUrl: string, fileType: FileType, fileId: number) => void;
  defaultType?: FileType;
  defaultCourseId?: number; // Optional default course
};

export default function FileUploader({ onUploadComplete, defaultType = 'video', defaultCourseId }: Props) {
  const { toast } = useToast();
  const [fileType, setFileType] = useState<FileType>(defaultType);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  
  // Course selection
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(defaultCourseId?.toString() || '');
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch courses on mount
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoadingCourses(true);
        const res = await fetch('/api/courses', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
          },
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setCourses(data.courses || []);
          if (data.courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(data.courses[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    }

    fetchCourses();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadedUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedCourseId) {
      toast({
        title: 'No course selected',
        description: 'Please select a course',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('courseId', selectedCourseId);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          setUploadedUrl(data.file.fileUrl);
          onUploadComplete(data.file.fileUrl, data.file.fileType, data.file.id);
          toast({
            title: 'Upload successful',
            description: 'File has been uploaded successfully',
          });
          // Clear file input after successful upload
          setSelectedFile(null);
        } else {
          throw new Error('Upload failed');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload file. Please try again.',
          variant: 'destructive',
        });
        setUploading(false);
      });

      xhr.open('POST', '/api/upload/course-content');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('auth_token') || ''}`);
      xhr.send(formData);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadedUrl(null);
    setUploadProgress(0);
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'video':
        return <FileVideo className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'asset':
        return <Image className="w-5 h-5" />;
    }
  };

  const getAcceptTypes = () => {
    switch (fileType) {
      case 'video':
        return 'video/*';
      case 'pdf':
        return 'application/pdf';
      case 'asset':
        return 'image/*';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Course Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 1. File Type */}
        <div className="space-y-2">
          <Label>1. Select Upload Type</Label>
          <Select value={fileType} onValueChange={(v) => setFileType(v as FileType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">
                <div className="flex items-center gap-2">
                  <FileVideo className="w-4 h-4" />
                  Video
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF Document
                </div>
              </SelectItem>
              <SelectItem value="asset">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Image/Asset
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 2. Course Selection */}
        <div className="space-y-2">
          <Label>2. Select Course</Label>
          {loadingCourses ? (
            <div className="text-sm text-muted-foreground">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-sm text-muted-foreground">No courses available</div>
          ) : (
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* 3. File Selection */}
        <div className="space-y-2">
          <Label>3. Select File</Label>
          <div className="flex gap-2">
            <Input
              type="file"
              accept={getAcceptTypes()}
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {selectedFile && !uploading && (
              <Button variant="ghost" size="icon" onClick={handleClear}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Success Message */}
        {uploadedUrl && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Upload Complete
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 truncate">
                {uploadedUrl}
              </p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={!selectedFile || !selectedCourseId || uploading}
        >
          {getFileIcon()}
          <span className="ml-2">{uploading ? 'Uploading...' : 'Upload File'}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
