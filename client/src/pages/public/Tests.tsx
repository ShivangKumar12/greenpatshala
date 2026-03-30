// client/src/pages/public/Tests.tsx
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen, Layers, FileQuestion, ArrowLeft, Loader2, Clock,
    Trophy, IndianRupee, ChevronRight, Sparkles, Lock, Unlock,
} from 'lucide-react';
import {
    getPublicSubjects, getSubjectWithChapters, getTestsBySubject,
    type TestSubject, type TestChapter,
} from '@/services/adminSubjectApi';

interface TestItem {
    id: number;
    title: string;
    description: string | null;
    thumbnail: string | null;
    category: string;
    difficulty: string;
    duration: number;
    total_marks: number;
    passing_marks: number;
    price: string;
    discount_price: string | null;
    isFree: boolean;
    freeQuestionsCount: number;
    certificateEligible: boolean;
    total_attempts: number;
    total_students: number;
}

type ViewState = 'subjects' | 'chapters' | 'tests';

export default function Tests() {
    const [, navigate] = useLocation();
    const [viewState, setViewState] = useState<ViewState>('subjects');
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState<(TestSubject & { chapterCount: number; testCount: number })[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<TestSubject | null>(null);
    const [chapters, setChapters] = useState<(TestChapter & { testCount: number })[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<TestChapter | null>(null);
    const [tests, setTests] = useState<TestItem[]>([]);

    const fetchSubjects = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getPublicSubjects();
            if (res.success) setSubjects(res.subjects);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    const handleSubjectClick = async (subject: TestSubject & { chapterCount: number }) => {
        setSelectedSubject(subject);
        setLoading(true);

        if (subject.chapterCount > 0) {
            // Show chapters
            try {
                const res = await getSubjectWithChapters(subject.id);
                if (res.success) {
                    setChapters(res.chapters);
                    setViewState('chapters');
                }
            } catch { /* ignore */ }
        } else {
            // No chapters → show tests directly
            try {
                const res = await getTestsBySubject(subject.id);
                if (res.success) {
                    setTests(res.tests);
                    setViewState('tests');
                }
            } catch { /* ignore */ }
        }
        setLoading(false);
    };

    const handleChapterClick = async (chapter: TestChapter) => {
        setSelectedChapter(chapter);
        setLoading(true);
        try {
            const res = await getTestsBySubject(selectedSubject!.id, chapter.id);
            if (res.success) {
                setTests(res.tests);
                setViewState('tests');
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    const handleBack = () => {
        if (viewState === 'tests' && chapters.length > 0) {
            setViewState('chapters');
            setSelectedChapter(null);
        } else {
            setViewState('subjects');
            setSelectedSubject(null);
            setSelectedChapter(null);
            setChapters([]);
            setTests([]);
        }
    };

    const getDifficultyColor = (d: string) => {
        switch (d?.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-teal-950 dark:via-emerald-950 dark:to-cyan-950 border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                    {viewState !== 'subjects' && (
                        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Button>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg">
                            <FileQuestion className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">
                                {viewState === 'subjects' && 'Test Series'}
                                {viewState === 'chapters' && selectedSubject?.name}
                                {viewState === 'tests' && (selectedChapter?.name || selectedSubject?.name)}
                            </h1>
                            <p className="text-muted-foreground">
                                {viewState === 'subjects' && 'Select a subject to start practicing'}
                                {viewState === 'chapters' && 'Select a chapter'}
                                {viewState === 'tests' && 'Available tests'}
                            </p>
                        </div>
                    </div>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                        <span className={viewState === 'subjects' ? 'text-foreground font-medium' : 'cursor-pointer hover:text-foreground'} onClick={() => viewState !== 'subjects' && handleBack()}>
                            Subjects
                        </span>
                        {selectedSubject && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className={viewState !== 'tests' ? 'text-foreground font-medium' : 'cursor-pointer hover:text-foreground'}>
                                    {selectedSubject.name}
                                </span>
                            </>
                        )}
                        {selectedChapter && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-foreground font-medium">{selectedChapter.name}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* SUBJECTS VIEW */}
                {viewState === 'subjects' && (
                    subjects.length === 0 ? (
                        <div className="text-center py-20">
                            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Subjects Available</h3>
                            <p className="text-muted-foreground">Check back soon for new test subjects.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjects.map((subject) => (
                                <Card
                                    key={subject.id}
                                    className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/60 overflow-hidden"
                                    onClick={() => handleSubjectClick(subject)}
                                >
                                    {subject.thumbnail && (
                                        <div className="h-40 overflow-hidden">
                                            <img src={subject.thumbnail} alt={subject.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    )}
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xl flex items-center justify-between">
                                            {subject.name}
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </CardTitle>
                                        {subject.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">{subject.description}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4 text-sm">
                                            <Badge variant="outline" className="gap-1">
                                                <Layers className="w-3 h-3" /> {subject.chapterCount} Chapters
                                            </Badge>
                                            <Badge variant="outline" className="gap-1">
                                                <FileQuestion className="w-3 h-3" /> {subject.testCount} Tests
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )
                )}

                {/* CHAPTERS VIEW */}
                {viewState === 'chapters' && (
                    chapters.length === 0 ? (
                        <div className="text-center py-20">
                            <Layers className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Chapters Available</h3>
                            <p className="text-muted-foreground">This subject has no chapters yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {chapters.map((chapter) => (
                                <Card
                                    key={chapter.id}
                                    className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/60"
                                    onClick={() => handleChapterClick(chapter)}
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center justify-between">
                                            {chapter.name}
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </CardTitle>
                                        {chapter.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">{chapter.description}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <Badge variant="outline" className="gap-1">
                                            <FileQuestion className="w-3 h-3" /> {chapter.testCount} Tests
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )
                )}

                {/* TESTS VIEW */}
                {viewState === 'tests' && (
                    tests.length === 0 ? (
                        <div className="text-center py-20">
                            <FileQuestion className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Tests Available</h3>
                            <p className="text-muted-foreground">No tests have been published for this selection yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tests.map((test) => {
                                const price = parseFloat(test.price || '0');
                                const discountPrice = test.discount_price ? parseFloat(test.discount_price) : null;
                                const isPaid = !test.isFree && price > 0;

                                return (
                                    <Card
                                        key={test.id}
                                        className="group hover:shadow-lg transition-all duration-300 border-border/60 overflow-hidden cursor-pointer"
                                        onClick={() => navigate(`/quiz/${test.id}`)}
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            {test.thumbnail && (
                                                <div className="md:w-48 h-32 md:h-auto overflow-hidden flex-shrink-0">
                                                    <img src={test.thumbnail} alt={test.title} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1 p-5">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{test.title}</h3>
                                                        {test.description && (
                                                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{test.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <Badge className={getDifficultyColor(test.difficulty)}>
                                                            {test.difficulty}
                                                        </Badge>
                                                        {test.certificateEligible && (
                                                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 gap-1">
                                                                <Trophy className="w-3 h-3" /> Certificate
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" /> {test.duration} min
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Trophy className="w-4 h-4" /> {test.total_marks} marks
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FileQuestion className="w-4 h-4" /> Pass: {test.passing_marks} marks
                                                    </span>
                                                    {test.freeQuestionsCount > 0 && (
                                                        <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
                                                            <Sparkles className="w-3 h-3" /> {test.freeQuestionsCount} Free Questions
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center gap-2">
                                                        {isPaid ? (
                                                            <>
                                                                <span className="flex items-center text-lg font-bold text-foreground">
                                                                    <IndianRupee className="w-4 h-4" />
                                                                    {discountPrice || price}
                                                                </span>
                                                                {discountPrice && (
                                                                    <span className="text-sm line-through text-muted-foreground">
                                                                        ₹{price}
                                                                    </span>
                                                                )}
                                                                <Lock className="w-4 h-4 text-orange-500 ml-1" />
                                                            </>
                                                        ) : (
                                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                                                                <Unlock className="w-3 h-3" /> Free
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <Button size="sm" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
                                                        Start Test <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
