// Test Chapters Screen - Shows chapters for a selected subject
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

export default function TestChaptersScreen({ route, navigation }: any) {
    const { subjectId, subjectName } = route.params;
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchChapters = async () => {
        try {
            const res = await testSeriesAPI.getSubjectWithChapters(subjectId);
            setChapters(res.data?.chapters || res.data?.data || []);
        } catch (err) {
            console.log('Chapters load error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchChapters(); }, [subjectId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchChapters();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>{subjectName}</Text>
                        <Text style={styles.headerSubtitle}>{chapters.length} Chapters</Text>
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
                    {chapters.map((chapter, i) => (
                        <Animated.View key={chapter.id} entering={FadeInDown.delay(100 + i * 60)}>
                            <TouchableOpacity
                                style={styles.chapterCard}
                                onPress={() => navigation.navigate('TestList', {
                                    chapterId: chapter.id,
                                    chapterName: chapter.name || chapter.title,
                                    subjectName,
                                })}
                                activeOpacity={0.9}
                            >
                                <View style={styles.chapterNumber}>
                                    <Text style={styles.chapterNumberText}>{i + 1}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.chapterTitle} numberOfLines={2}>
                                        {chapter.name || chapter.title}
                                    </Text>
                                    <View style={styles.chapterMeta}>
                                        <Ionicons name="document-text-outline" size={13} color={COLORS.textSecondary} />
                                        <Text style={styles.chapterMetaText}>
                                            {chapter.testsCount || chapter.tests_count || 0} Tests
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    {chapters.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="folder-open-outline" size={56} color={COLORS.textLight} />
                            <Text style={styles.emptyTitle}>No Chapters Yet</Text>
                            <Text style={styles.emptyMessage}>Chapters for {subjectName} will appear here once added.</Text>
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
    chapterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
    chapterNumber: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    chapterNumberText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    chapterTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 4 },
    chapterMeta: { flexDirection: 'row', alignItems: 'center' },
    chapterMetaText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginLeft: 4 },
    emptyState: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
    emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: SPACING.md },
    emptyMessage: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center', paddingHorizontal: SPACING.xl },
});
