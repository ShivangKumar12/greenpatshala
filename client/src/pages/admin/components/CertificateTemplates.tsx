// client/src/pages/admin/components/CertificateTemplates.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    useTemplates,
    useCreateTemplate,
    useUpdateTemplate,
    useDeleteTemplate,
    useSetDefaultTemplate,
    useAllCertificates,
} from '@/services/certificateApi';
import {
    Award,
    Plus,
    Trash2,
    Edit,
    Star,
    GripVertical,
    Download,
    Eye,
    ArrowLeft,
    Save,
    Upload,
    Type,
    Calendar,
    Hash,
    FileText,
    User,
    BookOpen,
    Palette,
    Sparkles,
    ChevronDown,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface TemplateField {
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    fontSize: number;
    fontColor: string;
    width: number;
    height: number;
}

const AVAILABLE_FIELDS = [
    { type: '{user_name}', label: 'User Name', icon: User },
    { type: '{course_name}', label: 'Course/Quiz Name', icon: BookOpen },
    { type: '{completion_date}', label: 'Completion Date', icon: Calendar },
    { type: '{certificate_id}', label: 'Certificate ID', icon: Hash },
    { type: '{achievement_text}', label: 'Achievement Text', icon: FileText },
];

const SAMPLE_DATA: Record<string, string> = {
    '{user_name}': 'John Doe',
    '{course_name}': 'Introduction to React',
    '{completion_date}': '2026-03-10',
    '{certificate_id}': 'CERT-AB12-CD34',
    '{achievement_text}': 'has successfully completed the course',
};

// ============================================
// PRESET TEMPLATES
// ============================================
interface PresetTemplate {
    name: string;
    description: string;
    theme: string;
    bgGradient: string;
    borderColor: string;
    accentColor: string;
    fields: TemplateField[];
}

const PRESET_TEMPLATES: PresetTemplate[] = [
    {
        name: 'Classic Gold',
        description: 'Traditional academic style with elegant golden accents',
        theme: 'gold',
        bgGradient: 'from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40',
        borderColor: 'border-amber-300 dark:border-amber-700',
        accentColor: 'text-amber-600 dark:text-amber-400',
        fields: [
            { id: 'f1', type: '{achievement_text}', label: 'Achievement Text', x: 171, y: 180, fontSize: 16, fontColor: '#8B7355', width: 500, height: 40 },
            { id: 'f2', type: '{user_name}', label: 'User Name', x: 171, y: 230, fontSize: 40, fontColor: '#1a1a2e', width: 500, height: 60 },
            { id: 'f3', type: '{course_name}', label: 'Course/Quiz Name', x: 171, y: 310, fontSize: 22, fontColor: '#C9A96E', width: 500, height: 45 },
            { id: 'f4', type: '{completion_date}', label: 'Completion Date', x: 171, y: 420, fontSize: 13, fontColor: '#666666', width: 250, height: 30 },
            { id: 'f5', type: '{certificate_id}', label: 'Certificate ID', x: 421, y: 420, fontSize: 13, fontColor: '#999999', width: 250, height: 30 },
        ],
    },
    {
        name: 'Modern Blue',
        description: 'Clean corporate style with professional blue tones',
        theme: 'blue',
        bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40',
        borderColor: 'border-blue-300 dark:border-blue-700',
        accentColor: 'text-blue-600 dark:text-blue-400',
        fields: [
            { id: 'f1', type: '{achievement_text}', label: 'Achievement Text', x: 171, y: 160, fontSize: 15, fontColor: '#4A6FA5', width: 500, height: 40 },
            { id: 'f2', type: '{user_name}', label: 'User Name', x: 171, y: 215, fontSize: 38, fontColor: '#1E3A5F', width: 500, height: 55 },
            { id: 'f3', type: '{course_name}', label: 'Course/Quiz Name', x: 171, y: 290, fontSize: 20, fontColor: '#2563EB', width: 500, height: 45 },
            { id: 'f4', type: '{completion_date}', label: 'Completion Date', x: 171, y: 400, fontSize: 12, fontColor: '#64748B', width: 250, height: 30 },
            { id: 'f5', type: '{certificate_id}', label: 'Certificate ID', x: 421, y: 400, fontSize: 12, fontColor: '#94A3B8', width: 250, height: 30 },
        ],
    },
    {
        name: 'Elegant Emerald',
        description: 'Growth-inspired design with lush green aesthetics',
        theme: 'emerald',
        bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40',
        borderColor: 'border-emerald-300 dark:border-emerald-700',
        accentColor: 'text-emerald-600 dark:text-emerald-400',
        fields: [
            { id: 'f1', type: '{achievement_text}', label: 'Achievement Text', x: 171, y: 170, fontSize: 15, fontColor: '#047857', width: 500, height: 40 },
            { id: 'f2', type: '{user_name}', label: 'User Name', x: 171, y: 225, fontSize: 36, fontColor: '#064E3B', width: 500, height: 55 },
            { id: 'f3', type: '{course_name}', label: 'Course/Quiz Name', x: 171, y: 300, fontSize: 20, fontColor: '#059669', width: 500, height: 45 },
            { id: 'f4', type: '{completion_date}', label: 'Completion Date', x: 171, y: 410, fontSize: 13, fontColor: '#6B7280', width: 250, height: 30 },
            { id: 'f5', type: '{certificate_id}', label: 'Certificate ID', x: 421, y: 410, fontSize: 13, fontColor: '#9CA3AF', width: 250, height: 30 },
        ],
    },
    {
        name: 'Royal Purple',
        description: 'Premium prestigious design with rich purple palette',
        theme: 'purple',
        bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40',
        borderColor: 'border-purple-300 dark:border-purple-700',
        accentColor: 'text-purple-600 dark:text-purple-400',
        fields: [
            { id: 'f1', type: '{achievement_text}', label: 'Achievement Text', x: 171, y: 175, fontSize: 15, fontColor: '#7C3AED', width: 500, height: 40 },
            { id: 'f2', type: '{user_name}', label: 'User Name', x: 171, y: 230, fontSize: 38, fontColor: '#3B0764', width: 500, height: 55 },
            { id: 'f3', type: '{course_name}', label: 'Course/Quiz Name', x: 171, y: 305, fontSize: 21, fontColor: '#8B5CF6', width: 500, height: 45 },
            { id: 'f4', type: '{completion_date}', label: 'Completion Date', x: 171, y: 415, fontSize: 13, fontColor: '#6B7280', width: 250, height: 30 },
            { id: 'f5', type: '{certificate_id}', label: 'Certificate ID', x: 421, y: 415, fontSize: 13, fontColor: '#9CA3AF', width: 250, height: 30 },
        ],
    },
    {
        name: 'Minimalist Dark',
        description: 'Sleek modern design with dark accents and clean typography',
        theme: 'dark',
        bgGradient: 'from-slate-100 to-gray-100 dark:from-slate-900/60 dark:to-gray-900/60',
        borderColor: 'border-slate-400 dark:border-slate-600',
        accentColor: 'text-slate-700 dark:text-slate-300',
        fields: [
            { id: 'f1', type: '{achievement_text}', label: 'Achievement Text', x: 171, y: 185, fontSize: 14, fontColor: '#475569', width: 500, height: 35 },
            { id: 'f2', type: '{user_name}', label: 'User Name', x: 171, y: 235, fontSize: 36, fontColor: '#0F172A', width: 500, height: 55 },
            { id: 'f3', type: '{course_name}', label: 'Course/Quiz Name', x: 171, y: 310, fontSize: 18, fontColor: '#334155', width: 500, height: 40 },
            { id: 'f4', type: '{completion_date}', label: 'Completion Date', x: 171, y: 420, fontSize: 12, fontColor: '#64748B', width: 250, height: 30 },
            { id: 'f5', type: '{certificate_id}', label: 'Certificate ID', x: 421, y: 420, fontSize: 12, fontColor: '#94A3B8', width: 250, height: 30 },
        ],
    },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function CertificateTemplates() {
    const [view, setView] = useState<'list' | 'builder' | 'certificates'>('list');
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [presetFields, setPresetFields] = useState<TemplateField[] | null>(null);
    const [presetName, setPresetName] = useState<string>('');

    const handleUsePreset = (preset: PresetTemplate) => {
        setEditingTemplate(null);
        setPresetFields(preset.fields);
        setPresetName(preset.name);
        setView('builder');
    };

    return (
        <div className="space-y-6">
            {view === 'list' && (
                <TemplateList
                    onCreateNew={() => { setEditingTemplate(null); setPresetFields(null); setPresetName(''); setView('builder'); }}
                    onEdit={(template: any) => { setEditingTemplate(template); setPresetFields(null); setPresetName(''); setView('builder'); }}
                    onViewCertificates={() => setView('certificates')}
                    onUsePreset={handleUsePreset}
                />
            )}
            {view === 'builder' && (
                <TemplateBuilder
                    template={editingTemplate}
                    onBack={() => setView('list')}
                    initialPresetFields={presetFields}
                    initialPresetName={presetName}
                />
            )}
            {view === 'certificates' && (
                <CertificatesList onBack={() => setView('list')} />
            )}
        </div>
    );
}

// ============================================
// TEMPLATE LIST VIEW
// ============================================
function TemplateList({
    onCreateNew,
    onEdit,
    onViewCertificates,
    onUsePreset,
}: {
    onCreateNew: () => void;
    onEdit: (t: any) => void;
    onViewCertificates: () => void;
    onUsePreset: (preset: PresetTemplate) => void;
}) {
    const { data: templates, isLoading } = useTemplates();
    const deleteMutation = useDeleteTemplate();
    const setDefaultMutation = useSetDefaultTemplate();
    const { toast } = useToast();

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast({ title: 'Template deleted', description: 'The certificate template has been removed.' });
        } catch {
            toast({ title: 'Error', description: 'Failed to delete template.', variant: 'destructive' });
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await setDefaultMutation.mutateAsync(id);
            toast({ title: 'Default set', description: 'This template will be used for new certificates.' });
        } catch {
            toast({ title: 'Error', description: 'Failed to set default.', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="h-6 w-6 text-amber-500" />
                        Certificate Templates
                    </h2>
                    <p className="text-muted-foreground mt-1">Create and manage certificate designs</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onViewCertificates}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Certificates
                    </Button>
                    <Button onClick={onCreateNew} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Template
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : !templates || templates.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Award className="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
                        <p className="text-muted-foreground mb-4 text-center max-w-md">
                            Create your first certificate template to start issuing certificates to students.
                        </p>
                        <Button onClick={onCreateNew} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Template
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template: any) => (
                        <Card key={template.id} className="relative group hover:shadow-lg transition-shadow">
                            {template.isDefault && (
                                <Badge className="absolute top-3 right-3 bg-amber-500 text-white z-10">
                                    <Star className="h-3 w-3 mr-1" /> Default
                                </Badge>
                            )}
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    {Array.isArray(template.fields)
                                        ? template.fields.length
                                        : JSON.parse(template.fields || '[]').length}{' '}
                                    fields configured
                                </p>
                            </CardHeader>
                            <CardContent>
                                {/* Mini preview */}
                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg h-32 flex items-center justify-center mb-4 relative overflow-hidden">
                                    <div className="absolute inset-2 border border-amber-300 dark:border-amber-700 rounded" />
                                    <div className="text-center z-10">
                                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">Certificate</p>
                                        <p className="text-xs font-bold mt-1">{template.name}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => onEdit(template)} className="flex-1">
                                        <Edit className="h-3 w-3 mr-1" /> Edit
                                    </Button>
                                    {!template.isDefault && (
                                        <Button size="sm" variant="outline" onClick={() => handleSetDefault(template.id)}>
                                            <Star className="h-3 w-3" />
                                        </Button>
                                    )}
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(template.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Preset Templates Gallery */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-semibold">Preset Templates</h3>
                    <span className="text-sm text-muted-foreground">— Quick-start with professional designs</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {PRESET_TEMPLATES.map((preset) => (
                        <Card key={preset.name} className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer ${preset.borderColor}`}>
                            <CardContent className="p-0">
                                {/* Preview Header */}
                                <div className={`bg-gradient-to-br ${preset.bgGradient} p-4 rounded-t-lg relative overflow-hidden`}>
                                    <div className={`absolute inset-2 border ${preset.borderColor} rounded opacity-40`} />
                                    <div className="text-center relative z-10 py-3">
                                        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${preset.accentColor} mb-1`}>Certificate of Achievement</p>
                                        <div className="h-px w-12 mx-auto bg-current opacity-30 mb-2" style={{ color: 'currentColor' }} />
                                        <p className="text-xs font-bold text-foreground/80">John Doe</p>
                                        <p className={`text-[9px] mt-1 ${preset.accentColor} opacity-80`}>Introduction to React</p>
                                    </div>
                                </div>
                                {/* Info */}
                                <div className="p-3">
                                    <h4 className="font-semibold text-sm">{preset.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{preset.description}</p>
                                    <Button
                                        size="sm"
                                        className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 text-xs h-8"
                                        onClick={() => onUsePreset(preset)}
                                    >
                                        <Palette className="h-3 w-3 mr-1" />
                                        Use This Template
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================
// TEMPLATE BUILDER (DRAG & DROP EDITOR)
// ============================================
function TemplateBuilder({
    template,
    onBack,
    initialPresetFields,
    initialPresetName,
}: {
    template: any;
    onBack: () => void;
    initialPresetFields?: TemplateField[] | null;
    initialPresetName?: string;
}) {
    const [name, setName] = useState(template?.name || initialPresetName || '');
    const [isDefault, setIsDefault] = useState(template?.isDefault || false);
    const [showPresetDropdown, setShowPresetDropdown] = useState(false);
    const [fields, setFields] = useState<TemplateField[]>(() => {
        if (template?.fields) {
            const parsed = typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields;
            return parsed.map((f: any, i: number) => ({ ...f, id: f.id || `field-${i}` }));
        }
        if (initialPresetFields) {
            return initialPresetFields.map((f, i) => ({ ...f, id: f.id || `field-${i}` }));
        }
        return [];
    });

    const loadPreset = (preset: PresetTemplate) => {
        setFields(preset.fields.map((f, i) => ({ ...f, id: `field-${Date.now()}-${i}` })));
        if (!name.trim()) setName(preset.name);
        setSelectedFieldId(null);
        setShowPresetDropdown(false);
        toast({ title: `Loaded "${preset.name}"`, description: 'Fields populated from preset. Adjust positions as needed.' });
    };
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const canvasRef = useRef<HTMLDivElement>(null);
    const createMutation = useCreateTemplate();
    const updateMutation = useUpdateTemplate();
    const { toast } = useToast();

    const CANVAS_WIDTH = 842; // A4 landscape approx
    const CANVAS_HEIGHT = 595;

    const selectedField = fields.find(f => f.id === selectedFieldId);

    // Add field from palette
    const addField = (fieldType: string, label: string) => {
        const existing = fields.find(f => f.type === fieldType);
        if (existing) {
            toast({ title: 'Already added', description: `${label} is already on the canvas.` });
            return;
        }

        const newField: TemplateField = {
            id: `field-${Date.now()}`,
            type: fieldType,
            label,
            x: CANVAS_WIDTH / 2 - 100,
            y: 100 + fields.length * 60,
            fontSize: fieldType === '{user_name}' ? 36 : fieldType === '{course_name}' ? 22 : 14,
            fontColor: fieldType === '{user_name}' || fieldType === '{course_name}' ? '#1a1a2e' : '#666666',
            width: CANVAS_WIDTH - 160,
            height: 50,
        };

        setFields(prev => [...prev, newField]);
        setSelectedFieldId(newField.id);
    };

    const removeField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    const updateField = (id: string, updates: Partial<TemplateField>) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    // Mouse drag handling
    const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
        e.preventDefault();
        const field = fields.find(f => f.id === fieldId);
        if (!field || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;

        setDragOffset({
            x: (e.clientX - rect.left) * scaleX - field.x,
            y: (e.clientY - rect.top) * scaleY - field.y,
        });
        setDragging(fieldId);
        setSelectedFieldId(fieldId);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragging || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;

        const x = Math.max(0, Math.min(CANVAS_WIDTH - 100, (e.clientX - rect.left) * scaleX - dragOffset.x));
        const y = Math.max(0, Math.min(CANVAS_HEIGHT - 30, (e.clientY - rect.top) * scaleY - dragOffset.y));

        updateField(dragging, { x, y });
    }, [dragging, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setDragging(null);
    }, []);

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [dragging, handleMouseMove, handleMouseUp]);

    const handleSave = async () => {
        if (!name.trim()) {
            toast({ title: 'Error', description: 'Please enter a template name.', variant: 'destructive' });
            return;
        }
        if (fields.length === 0) {
            toast({ title: 'Error', description: 'Add at least one field.', variant: 'destructive' });
            return;
        }

        try {
            const payload = {
                name: name.trim(),
                fields: fields.map(({ id, label, ...rest }) => rest),
                isDefault,
            };

            if (template?.id) {
                await updateMutation.mutateAsync({ id: template.id, ...payload });
                toast({ title: 'Updated', description: 'Template saved successfully.' });
            } else {
                await createMutation.mutateAsync(payload);
                toast({ title: 'Created', description: 'New template created successfully.' });
            }
            onBack();
        } catch {
            toast({ title: 'Error', description: 'Failed to save template.', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <h2 className="text-xl font-bold">
                        {template ? 'Edit Template' : 'Create New Template'}
                    </h2>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Template'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Left Panel - Settings & Fields */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Template Settings */}
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm">Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-3">
                            <div>
                                <Label className="text-xs">Template Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Elegant Gold"
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="rounded"
                                />
                                <Label htmlFor="isDefault" className="text-xs cursor-pointer">Set as default template</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Load Preset */}
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                Quick Presets
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-between text-xs"
                                    onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Palette className="h-3 w-3" />
                                        Load a Preset
                                    </span>
                                    <ChevronDown className={`h-3 w-3 transition-transform ${showPresetDropdown ? 'rotate-180' : ''}`} />
                                </Button>
                                {showPresetDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 py-1">
                                        {PRESET_TEMPLATES.map(preset => (
                                            <button
                                                key={preset.name}
                                                className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors flex items-center gap-2"
                                                onClick={() => loadPreset(preset)}
                                            >
                                                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${preset.bgGradient} ${preset.borderColor} border`} />
                                                <div>
                                                    <p className="font-medium">{preset.name}</p>
                                                    <p className="text-muted-foreground text-[10px]">{preset.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Available Fields */}
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm">Available Fields</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-1.5">
                            {AVAILABLE_FIELDS.map(field => {
                                const isAdded = fields.some(f => f.type === field.type);
                                return (
                                    <button
                                        key={field.type}
                                        onClick={() => addField(field.type, field.label)}
                                        disabled={isAdded}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${isAdded
                                            ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 cursor-not-allowed'
                                            : 'hover:bg-accent cursor-pointer'
                                            }`}
                                    >
                                        <field.icon className="h-3.5 w-3.5" />
                                        <span className="flex-1 text-left">{field.label}</span>
                                        {isAdded ? (
                                            <Badge variant="secondary" className="text-[10px] px-1.5">Added</Badge>
                                        ) : (
                                            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Selected Field Properties */}
                    {selectedField && (
                        <Card className="border-amber-200 dark:border-amber-800">
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-sm flex items-center justify-between">
                                    <span>Field Properties</span>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => removeField(selectedField.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 space-y-3">
                                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{selectedField.label}</p>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-[10px]">X Position</Label>
                                        <Input
                                            type="number"
                                            value={Math.round(selectedField.x)}
                                            onChange={(e) => updateField(selectedField.id, { x: Number(e.target.value) })}
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px]">Y Position</Label>
                                        <Input
                                            type="number"
                                            value={Math.round(selectedField.y)}
                                            onChange={(e) => updateField(selectedField.id, { y: Number(e.target.value) })}
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-[10px]">Font Size</Label>
                                        <Input
                                            type="number"
                                            value={selectedField.fontSize}
                                            onChange={(e) => updateField(selectedField.id, { fontSize: Number(e.target.value) })}
                                            className="h-7 text-xs"
                                            min={8}
                                            max={72}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px]">Font Color</Label>
                                        <div className="flex gap-1 mt-1">
                                            <input
                                                type="color"
                                                value={selectedField.fontColor}
                                                onChange={(e) => updateField(selectedField.id, { fontColor: e.target.value })}
                                                className="h-7 w-7 rounded cursor-pointer border"
                                            />
                                            <Input
                                                value={selectedField.fontColor}
                                                onChange={(e) => updateField(selectedField.id, { fontColor: e.target.value })}
                                                className="h-7 text-xs flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-[10px]">Width</Label>
                                    <Input
                                        type="number"
                                        value={selectedField.width}
                                        onChange={(e) => updateField(selectedField.id, { width: Number(e.target.value) })}
                                        className="h-7 text-xs"
                                        min={50}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Panel - Canvas Preview */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Live Preview
                                <span className="text-xs text-muted-foreground font-normal">(Drag fields to position them)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div
                                ref={canvasRef}
                                className="relative w-full bg-[#FFFDF5] border-2 border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden select-none"
                                style={{
                                    aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
                                }}
                                onClick={(e) => {
                                    if (e.target === canvasRef.current) setSelectedFieldId(null);
                                }}
                            >
                                {/* Default certificate border decorations */}
                                <div className="absolute inset-[3%] border-2 border-[#C9A96E] rounded pointer-events-none" />
                                <div className="absolute inset-[4.5%] border border-[#E8D5A3] rounded pointer-events-none" />

                                {/* Title (static) */}
                                <div
                                    className="absolute w-full text-center pointer-events-none"
                                    style={{ top: '10%' }}
                                >
                                    <p className="text-[#C9A96E] font-bold tracking-[0.15em] text-[min(1.5vw,14px)]">
                                        ★ CERTIFICATE OF ACHIEVEMENT ★
                                    </p>
                                </div>

                                {/* Draggable Fields */}
                                {fields.map((field) => {
                                    const scaleStyle = {
                                        left: `${(field.x / CANVAS_WIDTH) * 100}%`,
                                        top: `${(field.y / CANVAS_HEIGHT) * 100}%`,
                                        width: `${(field.width / CANVAS_WIDTH) * 100}%`,
                                        fontSize: `${(field.fontSize / CANVAS_HEIGHT) * 100}%`,
                                        color: field.fontColor,
                                    };

                                    return (
                                        <div
                                            key={field.id}
                                            className={`absolute cursor-grab active:cursor-grabbing text-center transition-shadow ${selectedFieldId === field.id
                                                ? 'ring-2 ring-amber-500 ring-offset-1 bg-amber-50/50 dark:bg-amber-950/30 rounded'
                                                : 'hover:ring-1 hover:ring-amber-300 rounded'
                                                }`}
                                            style={scaleStyle}
                                            onMouseDown={(e) => handleMouseDown(e, field.id)}
                                            onClick={(e) => { e.stopPropagation(); setSelectedFieldId(field.id); }}
                                        >
                                            <div className="flex items-center justify-center gap-1 py-0.5">
                                                <GripVertical className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                                                <span className="truncate font-medium" style={{ color: field.fontColor }}>
                                                    {SAMPLE_DATA[field.type] || field.type}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Footer (static) */}
                                <div
                                    className="absolute w-full text-center pointer-events-none"
                                    style={{ bottom: '5%' }}
                                >
                                    <p className="text-[#bbbbbb] text-[min(0.8vw,8px)]">Powered by Unchi Udaan</p>
                                </div>

                                {/* Empty state */}
                                {fields.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center text-muted-foreground/50">
                                            <Type className="h-8 w-8 mx-auto mb-2" />
                                            <p className="text-sm">Add fields from the left panel</p>
                                            <p className="text-xs">Then drag them to position</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ============================================
// CERTIFICATES LIST VIEW (Admin)
// ============================================
function CertificatesList({ onBack }: { onBack: () => void }) {
    const { data: certs, isLoading } = useAllCertificates();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="h-6 w-6 text-amber-500" />
                        Issued Certificates
                    </h2>
                    <p className="text-muted-foreground text-sm">All certificates generated for students</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : !certs || certs.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Award className="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold">No Certificates Issued Yet</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Certificates will appear here when students pass eligible quizzes.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="text-left p-3 font-medium">Certificate ID</th>
                                <th className="text-left p-3 font-medium">Student</th>
                                <th className="text-left p-3 font-medium">Type</th>
                                <th className="text-left p-3 font-medium">Course / Quiz</th>
                                <th className="text-left p-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certs.map((cert: any) => (
                                <tr key={cert.id} className="border-b hover:bg-muted/30 transition-colors">
                                    <td className="p-3">
                                        <code className="text-xs bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded text-amber-700 dark:text-amber-300">
                                            {cert.certificateId}
                                        </code>
                                    </td>
                                    <td className="p-3 font-medium">{cert.userName}</td>
                                    <td className="p-3">
                                        <Badge variant="secondary" className="capitalize">{cert.type}</Badge>
                                    </td>
                                    <td className="p-3">{cert.itemName}</td>
                                    <td className="p-3 text-muted-foreground">{cert.completionDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
