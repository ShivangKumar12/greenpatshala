// Test Series Screen - Subject grid with drill-down navigation
// Matches web Tests.tsx with subject → chapter → test hierarchy
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { testSeriesAPI, quizzesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const GRID_GAP = SPACING.md;
const CARD_SIZE = (width - SPACING.base * 2 - GRID_GAP) / 2;

const subjectIcons: Record<string, { icon: string; color: string }> = {
    'History': { icon: 'book', color: '#8B5CF6' },
    'Geography': { icon: 'globe', color: '#3B82F6' },
    'Polity': { icon: 'flag', color: '#EF4444' },
    'Economy': { icon: 'trending-up', color: '#16A34A' },
    'Science': { icon: 'flask', color: '#06B6D4' },
    'Maths': { icon: 'calculator', color: '#F59E0B' },
    'English': { icon: 'language', color: '#EC4899' },
    'Reasoning': { icon: 'bulb', color: '#F97316' },
    'GK': { icon: 'earth', color: '#6366F1' },
    'Current Affairs': { icon: 'newspaper', color: '#14B8A6' },
    'default': { icon: 'document-text', color: COLORS.primary },
};

export default function TestSeriesScreen({ navigation }: any) {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'subjects' | 'quizzes'>('subjects');

    const loadData = useCallback(async () => {
        try {
            const [subjectsRes, quizzesRes] = await Promise.allSettled([
                testSeriesAPI.getPublicSubjects(),
                quizzesAPI.getAll({ limit: 20 }),
            ]);

            if (subjectsRes.status === 'fulfilled') {
                setSubjects(subjectsRes.value.data?.subjects || subjectsRes.value.data?.data || []);
            }
            if (quizzesRes.status === 'fulfilled') {
                const q = quizzesRes.value.data?.quizzes || quizzesRes.value.data?.data || [];
                setQuizzes(q.filter((quiz: any) => quiz.is_published === 1 || quiz.is_published === true));
            }
        } catch (err) {
            console.log('TestSeries load error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const getSubjectStyle = (name: string) => {
        return subjectIcons[name] || subjectIcons['default'];
    };

    const getDifficultyColor = (d: string) => {
        if (d === 'easy') return COLORS.success;
        if (d === 'hard') return COLORS.error;
        return COLORS.warning;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={styles.header}>
                <Animated.View entering={FadeInDown.delay(100)}>
                    <Text style={styles.headerTitle}>Test Series</Text>
                    <Text style={styles.headerSubtitle}>Practice with topic-wise tests & quizzes</Text>
                </Animated.View>
            </LinearGradient>

            {/* Tab Toggle */}
            <Animated.View entering={FadeInDown.delay(150)} style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'subjects' && styles.tabActive]}
                    onPress={() => setActiveTab('subjects')}
                >
                    <Ionicons name="grid" size={16} color={activeTab === 'subjects' ? COLORS.primary : COLORS.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'subjects' && styles.tabTextActive]}>By Subject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'quizzes' && styles.tabActive]}
                    onPress={() => setActiveTab('quizzes')}
                >
                    <Ionicons name="list" size={16} color={activeTab === 'quizzes' ? COLORS.primary : COLORS.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'quizzes' && styles.tabTextActive]}>All Quizzes</Text>
                </TouchableOpacity>
            </Animated.View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading tests...</Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* My Attempts Card */}
                    {user && (
                        <Animated.View entering={FadeInDown.delay(200)}>
                            <TouchableOpacity
                                style={styles.attemptsCard}
                                onPress={() => navigation.navigate('MyAttempts')}
                                activeOpacity={0.9}
                            >
                                <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.attemptsGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <View style={styles.attemptsIcon}>
                                        <Ionicons name="stats-chart" size={24} color="#3B82F6" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.attemptsTitle}>My Attempted Tests</Text>
                                        <Text style={styles.attemptsSubtitle}>View your scores & progress</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {activeTab === 'subjects' ? (
                        <>
                            {/* Subject Grid */}
                            <View style={styles.subjectGrid}>
                                {subjects.map((subject, i) => {
                                    const style = getSubjectStyle(subject.name || subject.title);
                                    return (
                                        <Animated.View
                                            key={subject.id}
                                            entering={FadeInDown.delay(250 + i * 60)}
                                            style={styles.subjectCardWrapper}
                                        >
                                            <TouchableOpacity
                                                style={styles.subjectCard}
                                                onPress={() => navigation.navigate('TestChapters', {
                                                    subjectId: subject.id,
                                                    subjectName: subject.name || subject.title,
                                                })}
                                                activeOpacity={0.9}
                                            >
                                                <View style={[styles.subjectIconBg, { backgroundColor: style.color + '15' }]}>
                                                    <Ionicons name={style.icon as any} size={28} color={style.color} />
                                                </View>
                                                <Text style={styles.subjectName} numberOfLines={2}>
                                                    {subject.name || subject.title}
                                                </Text>
                                                <Text style={styles.subjectCount}>
                                                    {subject.chaptersCount || subject.chapters_count || 0} Chapters
                                                </Text>
                                                {subject.testsCount > 0 && (
                                                    <View style={styles.testCountBadge}>
                                                        <Text style={styles.testCountText}>{subject.testsCount} Tests</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        </Animated.View>
                                    );
                                })}
                            </View>

                            {subjects.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="clipboard-outline" size={56} color={COLORS.textLight} />
                                    <Text style={styles.emptyTitle}>No Subjects Available</Text>
                                    <Text style={styles.emptyMessage}>Test series subjects will appear here once added.</Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <>
                            {/* All Quizzes List */}
                            <Text style={styles.resultCount}>
                                {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} available
                            </Text>
                            {quizzes.map((quiz, i) => (
                                <Animated.View key={quiz.id} entering={FadeInDown.delay(200 + i * 50)}>
                                    <TouchableOpacity
                                        style={styles.quizCard}
                                        onPress={() => navigation.navigate('QuizDetail', { id: quiz.id })}
                                        activeOpacity={0.9}
                                    >
                                        <View style={styles.quizCardHeader}>
                                            <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(quiz.difficulty) + '15' }]}>
                                                <Text style={[styles.diffText, { color: getDifficultyColor(quiz.difficulty) }]}>
                                                    {(quiz.difficulty || 'easy').toUpperCase()}
                                                </Text>
                                            </View>
                                            {quiz.isFree || !quiz.price || quiz.price === 0 ? (
                                                <Text style={styles.freeTag}>FREE</Text>
                                            ) : (
                                                <Text style={styles.priceTag}>₹{quiz.discount_price || quiz.price}</Text>
                                            )}
                                        </View>
                                        <Text style={styles.quizCardTitle} numberOfLines={2}>{quiz.title}</Text>
                                        <Text style={styles.quizCardDesc} numberOfLines={2}>{quiz.description || 'No description'}</Text>
                                        <View style={styles.quizCardMeta}>
                                            <View style={styles.metaItem}>
                                                <Ionicons name="help-circle-outline" size={14} color={COLORS.textSecondary} />
                                                <Text style={styles.metaText}>{quiz.total_questions || quiz.total_marks || 0} Q</Text>
                                            </View>
                                            <View style={styles.metaItem}>
                                                <Ionicons name="timer-outline" size={14} color={COLORS.textSecondary} />
                                                <Text style={styles.metaText}>{quiz.duration || 30} min</Text>
                                            </View>
                                            <View style={styles.metaItem}>
                                                <Ionicons name="trophy-outline" size={14} color={COLORS.textSecondary} />
                                                <Text style={styles.metaText}>{quiz.passing_marks || 0} pass</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                            {quizzes.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="help-circle-outline" size={56} color={COLORS.textLight} />
                                    <Text style={styles.emptyTitle}>No Quizzes Available</Text>
                                    <Text style={styles.emptyMessage}>Quizzes will appear here once published.</Text>
                                </View>
                            )}
                        </>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTitle: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    headerSubtitle: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

    tabBar: { flexDirection: 'row', marginHorizontal: SPACING.base, marginTop: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 4, ...SHADOWS.sm },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
    tabActive: { backgroundColor: COLORS.primaryBg },
    tabText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium, color: COLORS.textSecondary, marginLeft: 6 },
    tabTextActive: { color: COLORS.primary, fontWeight: FONTS.weights.semibold },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.md },
    scrollContent: { paddingTop: SPACING.md },

    attemptsCard: { marginHorizontal: SPACING.base, marginBottom: SPACING.md },
    attemptsGradient: { borderRadius: RADIUS.lg, padding: SPACING.base, flexDirection: 'row', alignItems: 'center' },
    attemptsIcon: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    attemptsTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    attemptsSubtitle: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

    subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.base, gap: GRID_GAP },
    subjectCardWrapper: { width: CARD_SIZE },
    subjectCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, alignItems: 'center', ...SHADOWS.card, minHeight: 140 },
    subjectIconBg: { width: 56, height: 56, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
    subjectName: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, textAlign: 'center', marginBottom: 4 },
    subjectCount: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
    testCountBadge: { backgroundColor: COLORS.primaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full, marginTop: 6 },
    testCountText: { fontSize: 10, fontWeight: FONTS.weights.bold, color: COLORS.primary },

    resultCount: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, paddingHorizontal: SPACING.base, marginBottom: SPACING.sm },

    quizCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginHorizontal: SPACING.base, marginBottom: SPACING.md, ...SHADOWS.card },
    quizCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.xs },
    diffText: { fontSize: 10, fontWeight: FONTS.weights.bold },
    freeTag: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.success },
    priceTag: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    quizCardTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 4, lineHeight: 22 },
    quizCardDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm, lineHeight: 18 },
    quizCardMeta: { flexDirection: 'row', gap: SPACING.base },
    metaItem: { flexDirection: 'row', alignItems: 'center' },
    metaText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginLeft: 4 },

    emptyState: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
    emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: SPACING.md },
    emptyMessage: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
});
