// client/src/pages/admin/components/ChaptersManagement.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
import {
    Plus, Pencil, Trash2, Layers, Loader2, FileQuestion, BookOpen,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    getAdminSubjects, getAdminChapters, createChapter, updateChapter, deleteChapter,
    type TestSubject, type TestChapter,
} from '@/services/adminSubjectApi';

export default function ChaptersManagement() {
    const { toast } = useToast();
    const [subjects, setSubjects] = useState<TestSubject[]>([]);
    const [chapters, setChapters] = useState<TestChapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<TestChapter | null>(null);
    const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        subjectId: 0,
        name: '',
        description: '',
        isActive: true,
        orderIndex: 0,
    });

    const fetchSubjects = useCallback(async () => {
        try {
            const res = await getAdminSubjects();
            if (res.success) setSubjects(res.subjects);
        } catch { /* ignore */ }
    }, []);

    const fetchChapters = useCallback(async () => {
        try {
            setLoading(true);
            const subId = filterSubjectId !== 'all' ? Number(filterSubjectId) : undefined;
            const res = await getAdminChapters(subId);
            if (res.success) setChapters(res.chapters);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load chapters', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [filterSubjectId, toast]);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);
    useEffect(() => { fetchChapters(); }, [fetchChapters]);

    const openCreateDialog = () => {
        setSelectedChapter(null);
        setFormData({ subjectId: subjects[0]?.id || 0, name: '', description: '', isActive: true, orderIndex: 0 });
        setDialogOpen(true);
    };

    const openEditDialog = (chapter: TestChapter) => {
        setSelectedChapter(chapter);
        setFormData({
            subjectId: chapter.subjectId,
            name: chapter.name,
            description: chapter.description || '',
            isActive: chapter.isActive,
            orderIndex: chapter.orderIndex,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast({ title: 'Error', description: 'Chapter name is required', variant: 'destructive' });
            return;
        }
        if (!formData.subjectId) {
            toast({ title: 'Error', description: 'Please select a subject', variant: 'destructive' });
            return;
        }
        try {
            setSaving(true);
            if (selectedChapter) {
                await updateChapter(selectedChapter.id, formData);
                toast({ title: 'Success', description: 'Chapter updated successfully' });
            } else {
                await createChapter(formData);
                toast({ title: 'Success', description: 'Chapter created successfully' });
            }
            setDialogOpen(false);
            fetchChapters();
        } catch (error: any) {
            toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to save chapter', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedChapter) return;
        try {
            const res = await deleteChapter(selectedChapter.id);
            if (res.success) {
                toast({ title: 'Success', description: 'Chapter deleted successfully' });
                fetchChapters();
            } else {
                toast({ title: 'Error', description: res.message || 'Failed to delete', variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to delete chapter', variant: 'destructive' });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedChapter(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="w-6 h-6 text-indigo-600" />
                        Test Chapters
                    </h2>
                    <p className="text-muted-foreground">Manage chapters within subjects</p>
                </div>
                <div className="flex gap-3 items-center">
                    <Select value={filterSubjectId} onValueChange={setFilterSubjectId}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjects.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={openCreateDialog} className="gap-2" disabled={subjects.length === 0}>
                        <Plus className="w-4 h-4" /> Add Chapter
                    </Button>
                </div>
            </div>

            {subjects.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <BookOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Subjects Available</h3>
                        <p className="text-muted-foreground">Create a subject first, then add chapters to it.</p>
                    </CardContent>
                </Card>
            ) : chapters.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Layers className="w-12 h-12 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Chapters Yet</h3>
                        <p className="text-muted-foreground mb-4">Create chapters to organize tests within subjects</p>
                        <Button onClick={openCreateDialog} className="gap-2">
                            <Plus className="w-4 h-4" /> Create Chapter
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chapters.map((chapter) => (
                        <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{chapter.name}</CardTitle>
                                    <Badge variant={chapter.isActive ? 'default' : 'secondary'}>
                                        {chapter.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <Badge variant="outline" className="w-fit mt-1">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    {chapter.subjectName || `Subject #${chapter.subjectId}`}
                                </Badge>
                                {chapter.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{chapter.description}</p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <FileQuestion className="w-4 h-4" /> {chapter.testCount || 0} Tests
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEditDialog(chapter)}>
                                        <Pencil className="w-3 h-3" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive gap-1" onClick={() => { setSelectedChapter(chapter); setDeleteDialogOpen(true); }}>
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedChapter ? 'Edit Chapter' : 'Create Chapter'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Subject *</Label>
                            <Select
                                value={formData.subjectId ? formData.subjectId.toString() : ''}
                                onValueChange={(val) => setFormData({ ...formData, subjectId: Number(val) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Chapter Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Algebra, Thermodynamics"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the chapter"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label>Display Order</Label>
                            <Input
                                type="number"
                                value={formData.orderIndex}
                                onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Active</Label>
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {selectedChapter ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedChapter?.name}"?
                            Tests assigned to this chapter must be removed first.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
