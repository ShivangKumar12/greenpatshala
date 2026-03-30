// client/src/pages/admin/components/CategoriesManagement.tsx
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
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    Edit,
    Trash2,
    FolderOpen,
    Layers,
} from 'lucide-react';
import {
    getAdminAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAdminSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    type Category,
    type Subcategory,
} from '@/services/adminCategoryApi';

export default function CategoriesManagement() {
    const { toast } = useToast();

    // States
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [subLoading, setSubLoading] = useState(true);

    // Category dialogs
    const [isCatAddOpen, setIsCatAddOpen] = useState(false);
    const [isCatEditOpen, setIsCatEditOpen] = useState(false);
    const [isCatDeleteOpen, setIsCatDeleteOpen] = useState(false);
    const [selectedCat, setSelectedCat] = useState<Category | null>(null);
    const [catForm, setCatForm] = useState({ name: '', description: '' });

    // Subcategory dialogs
    const [isSubAddOpen, setIsSubAddOpen] = useState(false);
    const [isSubEditOpen, setIsSubEditOpen] = useState(false);
    const [isSubDeleteOpen, setIsSubDeleteOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState<Subcategory | null>(null);
    const [subForm, setSubForm] = useState({ name: '', description: '', categoryId: '' });
    const [subFilterCat, setSubFilterCat] = useState('all');

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAdminAllCategories();
            if (res.success) setCategories(res.categories);
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to load categories', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Fetch subcategories
    const fetchSubcategories = useCallback(async () => {
        try {
            setSubLoading(true);
            const catId = subFilterCat !== 'all' ? Number(subFilterCat) : undefined;
            const res = await getAdminSubcategories(catId);
            if (res.success) setSubcategories(res.subcategories);
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to load subcategories', variant: 'destructive' });
        } finally {
            setSubLoading(false);
        }
    }, [subFilterCat, toast]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);
    useEffect(() => { fetchSubcategories(); }, [fetchSubcategories]);

    // ============ CATEGORY HANDLERS ============
    const handleAddCategory = async () => {
        if (!catForm.name.trim()) {
            toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
            return;
        }
        try {
            await createCategory({ name: catForm.name, description: catForm.description || undefined });
            toast({ title: 'Success', description: 'Category created!' });
            setIsCatAddOpen(false);
            setCatForm({ name: '', description: '' });
            fetchCategories();
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to create category', variant: 'destructive' });
        }
    };

    const handleEditCategory = async () => {
        if (!selectedCat) return;
        try {
            await updateCategory(selectedCat.id, { name: catForm.name, description: catForm.description });
            toast({ title: 'Success', description: 'Category updated!' });
            setIsCatEditOpen(false);
            setSelectedCat(null);
            fetchCategories();
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update', variant: 'destructive' });
        }
    };

    const handleDeleteCategory = async () => {
        if (!selectedCat) return;
        try {
            await deleteCategory(selectedCat.id);
            toast({ title: 'Deleted', description: 'Category deactivated' });
            setIsCatDeleteOpen(false);
            setSelectedCat(null);
            fetchCategories();
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
        }
    };

    // ============ SUBCATEGORY HANDLERS ============
    const handleAddSubcategory = async () => {
        if (!subForm.name.trim() || !subForm.categoryId) {
            toast({ title: 'Error', description: 'Name and Category are required', variant: 'destructive' });
            return;
        }
        try {
            await createSubcategory({
                categoryId: Number(subForm.categoryId),
                name: subForm.name,
                description: subForm.description || undefined,
            });
            toast({ title: 'Success', description: 'Subcategory created!' });
            setIsSubAddOpen(false);
            setSubForm({ name: '', description: '', categoryId: '' });
            fetchSubcategories();
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to create subcategory', variant: 'destructive' });
        }
    };

    const handleEditSubcategory = async () => {
        if (!selectedSub) return;
        try {
            await updateSubcategory(selectedSub.id, {
                name: subForm.name,
                description: subForm.description,
                categoryId: subForm.categoryId ? Number(subForm.categoryId) : undefined,
            });
            toast({ title: 'Success', description: 'Subcategory updated!' });
            setIsSubEditOpen(false);
            setSelectedSub(null);
            fetchSubcategories();
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update', variant: 'destructive' });
        }
    };

    const handleDeleteSubcategory = async () => {
        if (!selectedSub) return;
        try {
            await deleteSubcategory(selectedSub.id);
            toast({ title: 'Deleted', description: 'Subcategory deactivated' });
            setIsSubDeleteOpen(false);
            setSelectedSub(null);
            fetchSubcategories();
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="categories">
                <TabsList>
                    <TabsTrigger value="categories" className="gap-2">
                        <FolderOpen className="w-4 h-4" />
                        Categories
                    </TabsTrigger>
                    <TabsTrigger value="subcategories" className="gap-2">
                        <Layers className="w-4 h-4" />
                        Subcategories
                    </TabsTrigger>
                </TabsList>

                {/* ==================== CATEGORIES TAB ==================== */}
                <TabsContent value="categories">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Categories</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">{categories.length} total</p>
                            </div>
                            <Button className="gap-2" onClick={() => { setCatForm({ name: '', description: '' }); setIsCatAddOpen(true); }}>
                                <Plus className="w-4 h-4" /> Add Category
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                </div>
                            ) : categories.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No categories yet</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categories.map((cat) => (
                                        <Card key={cat.id} className={`border ${!cat.isActive ? 'opacity-50' : ''}`}>
                                            <CardContent className="pt-4 pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">{cat.name}</h3>
                                                        {cat.description && (
                                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant={cat.isActive ? 'default' : 'secondary'}>
                                                                {cat.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">/{cat.slug}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedCat(cat);
                                                                setCatForm({ name: cat.name, description: cat.description || '' });
                                                                setIsCatEditOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => { setSelectedCat(cat); setIsCatDeleteOpen(true); }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ==================== SUBCATEGORIES TAB ==================== */}
                <TabsContent value="subcategories">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Subcategories</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">{subcategories.length} total</p>
                            </div>
                            <div className="flex gap-2">
                                <Select value={subFilterCat} onValueChange={setSubFilterCat}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button className="gap-2" onClick={() => { setSubForm({ name: '', description: '', categoryId: '' }); setIsSubAddOpen(true); }}>
                                    <Plus className="w-4 h-4" /> Add Subcategory
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {subLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                </div>
                            ) : subcategories.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No subcategories yet</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {subcategories.map((sub) => (
                                        <Card key={sub.id} className={`border ${!sub.isActive ? 'opacity-50' : ''}`}>
                                            <CardContent className="pt-4 pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">{sub.name}</h3>
                                                        {sub.description && (
                                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sub.description}</p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="outline">{sub.categoryName || `Cat #${sub.categoryId}`}</Badge>
                                                            <Badge variant={sub.isActive ? 'default' : 'secondary'}>
                                                                {sub.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedSub(sub);
                                                                setSubForm({ name: sub.name, description: sub.description || '', categoryId: sub.categoryId.toString() });
                                                                setIsSubEditOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => { setSelectedSub(sub); setIsSubDeleteOpen(true); }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* ==================== DIALOGS ==================== */}

            {/* Add Category */}
            <Dialog open={isCatAddOpen} onOpenChange={setIsCatAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Category</DialogTitle>
                        <DialogDescription>Add a new quiz/course category</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name <span className="text-red-500">*</span></Label>
                            <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g., UPSC" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder="Optional description" rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCatAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCategory}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Category */}
            <Dialog open={isCatEditOpen} onOpenChange={setIsCatEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>Update category details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCatEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditCategory}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Category */}
            <AlertDialog open={isCatDeleteOpen} onOpenChange={setIsCatDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will deactivate <strong>{selectedCat?.name}</strong>. Quizzes/courses using it won't be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedCat(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add Subcategory */}
            <Dialog open={isSubAddOpen} onOpenChange={setIsSubAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Subcategory</DialogTitle>
                        <DialogDescription>Add a subcategory under a category</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category <span className="text-red-500">*</span></Label>
                            <Select value={subForm.categoryId} onValueChange={(v) => setSubForm({ ...subForm, categoryId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                <SelectContent>
                                    {categories.filter(c => c.isActive).map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Name <span className="text-red-500">*</span></Label>
                            <Input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="e.g., General Studies" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSubAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSubcategory}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Subcategory */}
            <Dialog open={isSubEditOpen} onOpenChange={setIsSubEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Subcategory</DialogTitle>
                        <DialogDescription>Update subcategory details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={subForm.categoryId} onValueChange={(v) => setSubForm({ ...subForm, categoryId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                <SelectContent>
                                    {categories.filter(c => c.isActive).map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSubEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditSubcategory}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Subcategory */}
            <AlertDialog open={isSubDeleteOpen} onOpenChange={setIsSubDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subcategory?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will deactivate <strong>{selectedSub?.name}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedSub(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSubcategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
