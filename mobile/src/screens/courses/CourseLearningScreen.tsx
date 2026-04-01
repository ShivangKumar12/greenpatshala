// Course Learning Screen - Video/PDF player with lesson sidebar
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Dimensions, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { lessonsAPI, coursesAPI } from '../../services/api';
import api from '../../services/api';

const { width } = Dimensions.get('window');

type Lesson = {
    id: number; title: string; description?: string; contentType: string;
    videoUrl?: string; pdfUrl?: string; textContent?: string;
    duration?: number; orderIndex: number; moduleId: number;
    isFree: boolean; isCompleted: boolean; progressPercentage: number;
};

type Module = { id: number; title: string; orderIndex: number; lessons: Lesson[] };

export default function CourseLearningScreen({ route, navigation }: any) {
    const { courseId } = route.params;
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/lessons/course/${courseId}`);
                if (res.data.success) {
                    setCourse(res.data.course);
                    const mods = res.data.modules || [];
                    setModules(mods);
                    setProgress(res.data.enrollment?.progress || 0);
                    const allLessons = mods.flatMap((m: Module) => m.lessons);
                    const firstIncomplete = allLessons.find((l: Lesson) => !l.isCompleted);
                    setSelectedLesson(firstIncomplete || allLessons[0] || null);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load course');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [courseId]);

    const handleMarkComplete = useCallback(async () => {
        if (!selectedLesson) return;
        try {
            const res = await lessonsAPI.updateProgress(selectedLesson.id, { isCompleted: true, progressPercentage: 100 });
            if (res.data.success) {
                setModules(prev => prev.map(m => ({
                    ...m,
                    lessons: m.lessons.map(l => l.id === selectedLesson.id ? { ...l, isCompleted: true } : l),
                })));
                setSelectedLesson(prev => prev ? { ...prev, isCompleted: true } : null);
                setProgress(res.data.progress?.overallProgress || progress);
                Alert.alert('🎉 Completed!', 'Lesson marked as complete.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to mark complete');
        }
    }, [selectedLesson, progress]);

    const getYouTubeEmbedUrl = (url: string) => {
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
        return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : url;
    };

    if (loading) return (
        <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={s.loadText}>Loading course...</Text></View>
    );

    if (error) return (
        <View style={s.center}>
            <Ionicons name="alert-circle" size={48} color={COLORS.error} />
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={() => navigation.goBack()}>
                <Text style={s.retryText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = modules.reduce((sum, m) => sum + m.lessons.filter(l => l.isCompleted).length, 0);

    return (
        <View style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={s.courseTitle} numberOfLines={1}>{course?.title}</Text>
                    <Text style={s.progressText}>{completedLessons}/{totalLessons} lessons • {progress}%</Text>
                </View>
                <TouchableOpacity onPress={() => setShowSidebar(!showSidebar)} style={s.menuBtn}>
                    <Ionicons name={showSidebar ? 'close' : 'list'} size={20} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${progress}%` }]} />
            </View>

            {/* Content */}
            {selectedLesson ? (
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {/* Video Player */}
                    {selectedLesson.contentType === 'video' && selectedLesson.videoUrl && (
                        <View style={s.playerContainer}>
                            <WebView
                                source={{ uri: getYouTubeEmbedUrl(selectedLesson.videoUrl) }}
                                style={s.webview}
                                allowsFullscreenVideo
                                javaScriptEnabled
                                mediaPlaybackRequiresUserAction={false}
                            />
                        </View>
                    )}

                    {/* PDF Viewer */}
                    {selectedLesson.contentType === 'pdf' && selectedLesson.pdfUrl && (
                        <View style={[s.playerContainer, { height: 500 }]}>
                            <WebView
                                source={{ uri: `https://docs.google.com/viewer?url=${encodeURIComponent(selectedLesson.pdfUrl)}&embedded=true` }}
                                style={s.webview}
                            />
                        </View>
                    )}

                    {/* Text Content */}
                    {selectedLesson.contentType === 'text' && selectedLesson.textContent && (
                        <View style={s.textContent}>
                            <WebView
                                source={{ html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:system-ui;padding:16px;color:#161B26;line-height:1.6;font-size:16px}</style></head><body>${selectedLesson.textContent}</body></html>` }}
                                style={{ height: 400 }}
                                scrollEnabled={false}
                            />
                        </View>
                    )}

                    {/* Lesson Info */}
                    <View style={s.lessonInfo}>
                        <Text style={s.lessonTitle}>{selectedLesson.title}</Text>
                        {selectedLesson.description && <Text style={s.lessonDesc}>{selectedLesson.description}</Text>}
                        {!selectedLesson.isCompleted ? (
                            <TouchableOpacity style={s.completeBtn} onPress={handleMarkComplete}>
                                <Ionicons name="checkmark-circle" size={18} color={COLORS.textWhite} />
                                <Text style={s.completeBtnText}>Mark as Complete</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={s.completedBadge}>
                                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                                <Text style={s.completedText}>Completed</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <View style={s.center}><Text style={s.loadText}>Select a lesson</Text></View>
            )}

            {/* Sidebar Overlay */}
            {showSidebar && (
                <View style={s.sidebar}>
                    <View style={s.sidebarHeader}>
                        <Text style={s.sidebarTitle}>Course Content</Text>
                        <TouchableOpacity onPress={() => setShowSidebar(false)}>
                            <Ionicons name="close" size={22} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {modules.map(m => (
                            <View key={m.id}>
                                <Text style={s.moduleName}>{m.title}</Text>
                                {m.lessons.map(l => {
                                    const isActive = selectedLesson?.id === l.id;
                                    return (
                                        <TouchableOpacity key={l.id} style={[s.lessonItem, isActive && s.lessonItemActive]} onPress={() => { setSelectedLesson(l); setShowSidebar(false); }}>
                                            <Ionicons name={l.contentType === 'video' ? 'play-circle' : l.contentType === 'pdf' ? 'document-text' : 'book'} size={16} color={isActive ? COLORS.textWhite : COLORS.textSecondary} />
                                            <Text style={[s.lessonItemText, isActive && s.lessonItemTextActive]} numberOfLines={1}>{l.title}</Text>
                                            {l.isCompleted && <Ionicons name="checkmark-circle" size={16} color={isActive ? COLORS.textWhite : COLORS.success} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
    loadText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.md },
    errorText: { fontSize: FONTS.sizes.md, color: COLORS.error, marginTop: SPACING.md, textAlign: 'center' },
    retryBtn: { marginTop: SPACING.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary },
    retryText: { color: COLORS.textWhite, fontWeight: FONTS.weights.semibold },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: SPACING.md, paddingHorizontal: SPACING.base, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.borderLight, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    courseTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text },
    progressText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
    menuBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.borderLight, justifyContent: 'center', alignItems: 'center' },
    progressBar: { height: 3, backgroundColor: COLORS.borderLight },
    progressFill: { height: 3, backgroundColor: COLORS.primary },
    playerContainer: { width, height: width * 9 / 16, backgroundColor: '#000' },
    webview: { flex: 1 },
    textContent: { margin: SPACING.base },
    lessonInfo: { padding: SPACING.base },
    lessonTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
    lessonDesc: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.md },
    completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, gap: 8, ...SHADOWS.green },
    completeBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.textWhite },
    completedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryBg, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, gap: 8 },
    completedText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.success },
    sidebar: { position: 'absolute', top: 0, right: 0, bottom: 0, width: width * 0.8, backgroundColor: COLORS.surface, ...SHADOWS.xl, paddingTop: 50, zIndex: 100 },
    sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    sidebarTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
    moduleName: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.textSecondary, textTransform: 'uppercase', paddingHorizontal: SPACING.base, paddingTop: SPACING.md, paddingBottom: SPACING.xs },
    lessonItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, gap: SPACING.sm },
    lessonItemActive: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, marginHorizontal: SPACING.sm },
    lessonItemText: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
    lessonItemTextActive: { color: COLORS.textWhite },
});
