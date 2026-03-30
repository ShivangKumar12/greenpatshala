// client/src/pages/admin/components/SubjectsManagement.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
    Plus, Pencil, Trash2, BookOpen, Loader2, Layers, FileQuestion,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    getAdminSubjects, createSubject, updateSubject, deleteSubject,
    type TestSubject,
} from '@/services/adminSubjectApi';

export default function SubjectsManagement() {
    const { toast } = useToast();
    const [subjects, setSubjects] = useState<TestSubject[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<TestSubject | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        thumbnail: '',
        isActive: true,
        orderIndex: 0,
    });

    const fetchSubjects = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAdminSubjects();
            if (res.success) setSubjects(res.subjects);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load subjects', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    const openCreateDialog = () => {
        setSelectedSubject(null);
        setFormData({ name: '', description: '', thumbnail: '', isActive: true, orderIndex: 0 });
        setDialogOpen(true);
    };

    const openEditDialog = (subject: TestSubject) => {
        setSelectedSubject(subject);
        setFormData({
            name: subject.name,
            description: subject.description || '',
            thumbnail: subject.thumbnail || '',
            isActive: subject.isActive,
            orderIndex: subject.orderIndex,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast({ title: 'Error', description: 'Subject name is required', variant: 'destructive' });
            return;
        }
        try {
            setSaving(true);
            if (selectedSubject) {
                await updateSubject(selectedSubject.id, formData);
                toast({ title: 'Success', description: 'Subject updated successfully' });
            } else {
                await createSubject(formData);
                toast({ title: 'Success', description: 'Subject created successfully' });
            }
            setDialogOpen(false);
            fetchSubjects();
        } catch (error: any) {
            toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to save subject', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedSubject) return;
        try {
            const res = await deleteSubject(selectedSubject.id);
            if (res.success) {
                toast({ title: 'Success', description: 'Subject deleted successfully' });
                fetchSubjects();
            } else {
                toast({ title: 'Error', description: res.message || 'Failed to delete', variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to delete subject', variant: 'destructive' });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedSubject(null);
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-teal-600" />
                        Test Subjects
                    </h2>
                    <p className="text-muted-foreground">Manage subjects for the test system</p>
                </div>
                <Button onClick={openCreateDialog} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Subject
                </Button>
            </div>

            {/* Subjects Grid */}
            {subjects.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <BookOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Subjects Yet</h3>
                        <p className="text-muted-foreground mb-4">Create your first test subject to get started</p>
                        <Button onClick={openCreateDialog} className="gap-2">
                            <Plus className="w-4 h-4" /> Create Subject
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
                        <Card key={subject.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                                    <Badge variant={subject.isActive ? 'default' : 'secondary'}>
                                        {subject.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                {subject.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{subject.description}</p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Layers className="w-4 h-4" /> {subject.chapterCount || 0} Chapters
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FileQuestion className="w-4 h-4" /> {subject.testCount || 0} Tests
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEditDialog(subject)}>
                                        <Pencil className="w-3 h-3" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive gap-1" onClick={() => { setSelectedSubject(subject); setDeleteDialogOpen(true); }}>
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
                        <DialogTitle>{selectedSubject ? 'Edit Subject' : 'Create Subject'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Subject Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Mathematics, Science, History"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the subject"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label>Thumbnail URL</Label>
                            <Input
                                value={formData.thumbnail}
                                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                placeholder="https://..."
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
                            {selectedSubject ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedSubject?.name}"? This will also delete all chapters under it.
                            Tests assigned to this subject must be removed first.
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
