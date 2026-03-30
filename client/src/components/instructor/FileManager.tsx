import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Copy, FileVideo, FileText, Image, FolderOpen } from 'lucide-react';

type UploadedFile = {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  courseId: number;
  createdAt: string;
};

type Props = {
  courseId?: number; // Optional: filter by course
};

export default function FileManager({ courseId }: Props) {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filterCourseId, setFilterCourseId] = useState(courseId?.toString() || '');

  useEffect(() => {
    loadFiles();
  }, [courseId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (courseId) {
        queryParams.append('courseId', courseId.toString());
      } else if (filterCourseId) {
        queryParams.append('courseId', filterCourseId);
      }

      const res = await fetch(`/api/upload/course-content/list?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load files');
      }

      setFiles(data.files || []);
    } catch (error: any) {
      console.error('Load files error:', error);
      toast({
        title: 'Failed to load files',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      setDeleting(fileId);
      const res = await fetch(`/api/upload/course-content/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete file');
      }

      toast({
        title: 'File deleted',
        description: 'File has been deleted successfully',
      });

      loadFiles();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: 'URL copied',
      description: 'File URL copied to clipboard',
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FileVideo className="w-5 h-5 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'asset':
        return <Image className="w-5 h-5 text-green-500" />;
      default:
        return <FolderOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Uploaded Files</CardTitle>
          <Button variant="outline" size="sm" onClick={loadFiles} disabled={loading}>
            Refresh
          </Button>
        </div>
        {!courseId && (
          <div className="flex gap-2 mt-4">
            <div className="flex-1">
              <Label className="text-xs">Filter by Course ID</Label>
              <Input
                type="number"
                placeholder="Course ID"
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-6"
              onClick={loadFiles}
            >
              Filter
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files uploaded yet</p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {getFileIcon(file.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.fileName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {file.fileType}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Course #{file.courseId}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyUrl(file.fileUrl)}
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.id)}
                      disabled={deleting === file.id}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
