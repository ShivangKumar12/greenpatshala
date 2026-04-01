// Test List Screen - Shows tests for a selected chapter
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { testSeriesAPI } from '../../services/api';

export default function TestListScreen({ route, navigation }: any) {
    const { chapterId, chapterName, subjectName } = route.params;
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTests = async () => {
        try {
            const res = await testSeriesAPI.getChapterTests(chapterId);
            setTests(res.data?.tests || res.data?.data || []);
        } catch (err) {
            console.log('Tests load error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTests(); }, [chapterId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTests();
        setRefreshing(false);
    };

    const getDiffColor = (d: string) => {
        if (d === 'easy') return COLORS.success;
        if (d === 'hard') return COLORS.error;
        return COLORS.warning;
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>{chapterName}</Text>
                        <Text style={styles.headerSubtitle}>{subjectName} • {tests.length} Tests</Text>
                    </View>
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    contentContainerStyle={styles.scrollContent}
                >
                    {tests.map((test, i) => (
                        <Animated.View key={test.id} entering={FadeInDown.delay(100 + i * 60)}>
                            <TouchableOpacity
                                style={styles.testCard}
                                onPress={() => navigation.navigate('QuizDetail', { id: test.quiz_id || test.id })}
                                activeOpacity={0.9}
                            >
                                <View style={styles.testLeft}>
                                    <LinearGradient colors={COLORS.gradientAccent} style={styles.testIcon}>
                                        <Ionicons name="document-text" size={18} color={COLORS.textWhite} />
                                    </LinearGradient>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.testTitle} numberOfLines={2}>{test.title || test.name}</Text>
                                    <View style={styles.testMeta}>
                                        <Text style={styles.testMetaText}>{test.total_questions || 0} Qs</Text>
                                        <Text style={styles.testMetaDot}>•</Text>
                                        <Text style={styles.testMetaText}>{test.duration || 30} min</Text>
                                        <Text style={styles.testMetaDot}>•</Text>
                                        <Text style={styles.testMetaText}>{test.total_marks || 0} marks</Text>
                                    </View>
                                    <View style={styles.testBadges}>
                                        <View style={[styles.badge, { backgroundColor: getDiffColor(test.difficulty) + '15' }]}>
                                            <Text style={[styles.badgeText, { color: getDiffColor(test.difficulty) }]}>
                                                {(test.difficulty || 'medium').toUpperCase()}
                                            </Text>
                                        </View>
                                        {(test.isFree || !test.price || test.price == 0) && (
                                            <View style={[styles.badge, { backgroundColor: COLORS.success + '15' }]}>
                                                <Text style={[styles.badgeText, { color: COLORS.success }]}>FREE</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    {tests.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-outline" size={56} color={COLORS.textLight} />
                            <Text style={styles.emptyTitle}>No Tests Available</Text>
                            <Text style={styles.emptyMessage}>Tests for this chapter will appear here.</Text>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    headerSubtitle: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: SPACING.base },
    testCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOWS.card },
    testLeft: { marginRight: SPACING.md },
    testIcon: { width: 42, height: 42, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
    testTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 4, lineHeight: 22 },
    testMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    testMetaText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
    testMetaDot: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginHorizontal: 6 },
    testBadges: { flexDirection: 'row', gap: 6 },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.xs },
    badgeText: { fontSize: 9, fontWeight: FONTS.weights.bold },
    emptyState: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
    emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: SPACING.md },
    emptyMessage: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
});
