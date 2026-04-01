// Home Screen - Dashboard with carousels, stats, and quick actions
// Matches web Home.tsx with mobile-optimized layout
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, Dimensions, FlatList, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight, SlideInRight, FadeIn } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI, quizzesAPI, currentAffairsAPI, jobsAPI, feedbackAPI } from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;

export default function HomeScreen({ navigation }: any) {
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [currentAffairs, setCurrentAffairs] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const bannerRef = useRef<FlatList>(null);
    const [bannerIndex, setBannerIndex] = useState(0);

    const banners = [
        { id: 1, title: 'Explore Courses', subtitle: 'Start learning today with expert-curated courses', icon: 'book', colors: [COLORS.primary, '#16A34A'] as const, screen: 'CoursesTab' },
        { id: 2, title: 'Practice Quizzes', subtitle: 'Test your knowledge with time-based quizzes', icon: 'help-circle', colors: ['#F59E0B', '#D97706'] as const, screen: 'TestsTab' },
        { id: 3, title: 'Current Affairs', subtitle: 'Stay updated with daily news for exams', icon: 'newspaper', colors: ['#8B5CF6', '#7C3AED'] as const, screen: 'StudyTab' },
        { id: 4, title: 'Government Jobs', subtitle: 'Find latest sarkari naukri opportunities', icon: 'briefcase', colors: ['#3B82F6', '#2563EB'] as const, screen: 'JobDetail' },
    ];

    // Auto-scroll banners
    useEffect(() => {
        const timer = setInterval(() => {
            setBannerIndex(prev => {
                const next = (prev + 1) % banners.length;
                bannerRef.current?.scrollToIndex({ index: next, animated: true });
                return next;
            });
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const loadData = useCallback(async () => {
        try {
            const [coursesRes, quizzesRes, affairsRes, jobsRes] = await Promise.allSettled([
                coursesAPI.getAll({ limit: 6 }),
                quizzesAPI.getAll({ limit: 6 }),
                currentAffairsAPI.getAll({ limit: 6 }),
                jobsAPI.getAll({ limit: 5, status: 'active' }),
            ]);
            if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data?.courses || coursesRes.value.data?.data || []);
            if (quizzesRes.status === 'fulfilled') {
                const q = quizzesRes.value.data?.quizzes || quizzesRes.value.data?.data || [];
                setQuizzes(q.filter((quiz: any) => quiz.is_published === 1 || quiz.is_published === true));
            }
            if (affairsRes.status === 'fulfilled') setCurrentAffairs(affairsRes.value.data?.data || affairsRes.value.data?.items || affairsRes.value.data?.currentAffairs || []);
            if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data?.jobs || jobsRes.value.data?.data || []);
        } catch (err) {
            console.log('Home load error:', err);
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const quickActions = [
        { icon: 'document-text', label: 'Study\nNotes', color: '#EC4899', screen: 'StudyTab' },
        { icon: 'clipboard', label: 'Test\nSeries', color: '#8B5CF6', screen: 'TestsTab' },
        { icon: 'help-circle', label: 'Practice\nQuizzes', color: '#F59E0B', screen: 'CoursesTab' },
        { icon: 'newspaper', label: 'Current\nAffairs', color: '#3B82F6', screen: 'StudyTab' },
        { icon: 'briefcase', label: 'Govt\nJobs', color: '#16A34A', screen: 'ProfileTab' },
    ];

    const SectionHeader = ({ title, subtitle, onSeeAll, delay = 0 }: any) => (
        <Animated.View entering={FadeInDown.delay(delay)} style={styles.sectionHeader}>
            <View>
                <Text style={styles.sectionTitle}>{title}</Text>
                {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
            </View>
            {onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn}>
                    <Text style={styles.seeAllText}>See All</Text>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
                </TouchableOpacity>
            )}
        </Animated.View>
    );

    const renderBanner = ({ item }: any) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate(item.screen)}
            style={styles.bannerCard}
        >
            <LinearGradient colors={item.colors} style={styles.bannerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.bannerContent}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.bannerTitle}>{item.title}</Text>
                        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                        <View style={styles.bannerCta}>
                            <Text style={styles.bannerCtaText}>Explore Now</Text>
                            <Ionicons name="arrow-forward" size={14} color={COLORS.textWhite} />
                        </View>
                    </View>
                    <View style={styles.bannerIconBg}>
                        <Ionicons name={item.icon as any} size={40} color="rgba(255,255,255,0.3)" />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    const SkeletonLoader = () => (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3].map(i => (
                <Animated.View key={i} entering={FadeInDown.delay(i * 100)} style={styles.skeletonCard}>
                    <View style={styles.skeletonImage} />
                    <View style={styles.skeletonLines}>
                        <View style={[styles.skeletonLine, { width: '80%' }]} />
                        <View style={[styles.skeletonLine, { width: '60%' }]} />
                        <View style={[styles.skeletonLine, { width: '40%' }]} />
                    </View>
                </Animated.View>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
            >
                {/* Hero Header */}
                <LinearGradient
                    colors={[COLORS.primaryDarker, COLORS.primary, COLORS.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroGradient}
                >
                    <Animated.View entering={FadeInDown.delay(100)} style={styles.heroTop}>
                        <View>
                            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
                            <Ionicons name="notifications-outline" size={22} color={COLORS.textWhite} />
                            <View style={styles.notifBadge} />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Search Bar */}
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <TouchableOpacity style={styles.searchBanner} activeOpacity={0.8}>
                            <Ionicons name="search" size={18} color={COLORS.textSecondary} />
                            <Text style={styles.searchPlaceholder}>Search courses, quizzes, jobs...</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </LinearGradient>

                {/* Banner Carousel */}
                <Animated.View entering={FadeInDown.delay(250)} style={styles.bannerSection}>
                    <FlatList
                        ref={bannerRef}
                        data={banners}
                        renderItem={renderBanner}
                        keyExtractor={item => String(item.id)}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        pagingEnabled
                        snapToInterval={width - 32}
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: SPACING.base }}
                        onMomentumScrollEnd={(e) => {
                            const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                            setBannerIndex(idx);
                        }}
                    />
                    <View style={styles.dotContainer}>
                        {banners.map((_, i) => (
                            <View key={i} style={[styles.dot, bannerIndex === i && styles.dotActive]} />
                        ))}
                    </View>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.delay(300)} style={styles.quickActions}>
                    {quickActions.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.quickActionItem}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: item.color + '12' }]}>
                                <Ionicons name={item.icon as any} size={22} color={item.color} />
                            </View>
                            <Text style={styles.quickActionLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* Stats Bar */}
                <Animated.View entering={FadeInDown.delay(350)} style={styles.statsBar}>
                    <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.statsGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        {[
                            { value: courses.length.toString() + '+', label: 'Courses' },
                            { value: quizzes.length.toString() + '+', label: 'Quizzes' },
                            { value: jobs.length.toString() + '+', label: 'Jobs' },
                        ].map((stat, i) => (
                            <View key={i} style={[styles.statItem, i < 2 && styles.statDivider]}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </LinearGradient>
                </Animated.View>

                {loading ? <SkeletonLoader /> : (
                    <>
                        {/* Popular Courses */}
                        {courses.length > 0 && (
                            <>
                                <SectionHeader
                                    title="Popular Courses"
                                    subtitle="Start learning today"
                                    onSeeAll={() => navigation.navigate('CoursesTab')}
                                    delay={400}
                                />
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                    {courses.slice(0, 6).map((course, i) => (
                                        <Animated.View key={course.id} entering={SlideInRight.delay(i * 80)} style={{ width: CARD_WIDTH, marginRight: SPACING.md }}>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('CourseDetail', { id: course.id })}
                                                style={styles.courseCard}
                                                activeOpacity={0.9}
                                            >
                                                <LinearGradient colors={COLORS.gradientAccent} style={styles.courseThumbnail}>
                                                    <Ionicons name="book" size={28} color={COLORS.textWhite} />
                                                </LinearGradient>
                                                <View style={styles.courseInfo}>
                                                    <View style={styles.categoryBadge}>
                                                        <Text style={styles.categoryText}>{course.category || 'General'}</Text>
                                                    </View>
                                                    <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                                                    <View style={styles.courseMetaRow}>
                                                        <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
                                                        <Text style={styles.courseMeta}>{course.duration || 'Self-paced'}</Text>
                                                        <Ionicons name="people-outline" size={12} color={COLORS.textSecondary} style={{ marginLeft: 8 }} />
                                                        <Text style={styles.courseMeta}>{course.totalStudents || 0}</Text>
                                                    </View>
                                                    {course.isFree || (!course.originalPrice && !course.price) ? (
                                                        <Text style={styles.freeLabel}>FREE</Text>
                                                    ) : (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <Text style={styles.priceLabel}>₹{course.discountPrice || course.originalPrice || course.price}</Text>
                                                            {course.discountPrice && course.originalPrice && (
                                                                <Text style={styles.originalPrice}>₹{course.originalPrice}</Text>
                                                            )}
                                                        </View>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))}
                                </ScrollView>
                            </>
                        )}

                        {/* Latest Quizzes */}
                        {quizzes.length > 0 && (
                            <>
                                <SectionHeader
                                    title="Practice Quizzes"
                                    subtitle="Test your knowledge"
                                    onSeeAll={() => navigation.navigate('TestsTab')}
                                    delay={500}
                                />
                                {quizzes.slice(0, 4).map((quiz, i) => (
                                    <Animated.View key={quiz.id} entering={FadeInDown.delay(550 + i * 60)}>
                                        <TouchableOpacity
                                            style={styles.quizItem}
                                            onPress={() => navigation.navigate('QuizDetail', { id: quiz.id })}
                                            activeOpacity={0.9}
                                        >
                                            <View style={[styles.quizDot, {
                                                backgroundColor: quiz.difficulty === 'easy' ? COLORS.success :
                                                    quiz.difficulty === 'hard' ? COLORS.error : COLORS.warning
                                            }]} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.quizItemTitle} numberOfLines={1}>{quiz.title}</Text>
                                                <Text style={styles.quizItemMeta}>
                                                    {quiz.duration || 30} min • {quiz.total_marks || quiz.total_questions || 0} marks
                                                    {(quiz.isFree || !quiz.price || quiz.price === 0) ? ' • Free' : ` • ₹${quiz.discount_price || quiz.price}`}
                                                </Text>
                                            </View>
                                            <View style={[styles.diffBadge, {
                                                backgroundColor: (quiz.difficulty === 'easy' ? COLORS.success :
                                                    quiz.difficulty === 'hard' ? COLORS.error : COLORS.warning) + '15'
                                            }]}>
                                                <Text style={[styles.diffText, {
                                                    color: quiz.difficulty === 'easy' ? COLORS.success :
                                                        quiz.difficulty === 'hard' ? COLORS.error : COLORS.warning
                                                }]}>{(quiz.difficulty || 'easy').toUpperCase()}</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} style={{ marginLeft: 8 }} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </>
                        )}

                        {/* Current Affairs */}
                        {currentAffairs.length > 0 && (
                            <>
                                <SectionHeader
                                    title="Current Affairs"
                                    subtitle="Stay updated daily"
                                    onSeeAll={() => navigation.navigate('StudyTab')}
                                    delay={650}
                                />
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                    {currentAffairs.slice(0, 6).map((item, i) => (
                                        <Animated.View key={item.id} entering={SlideInRight.delay(i * 80)} style={{ width: width * 0.58, marginRight: SPACING.md }}>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('CurrentAffairDetail', { id: item.id })}
                                                style={styles.affairCard}
                                                activeOpacity={0.9}
                                            >
                                                <View style={styles.affairCategoryBadge}>
                                                    <Text style={styles.affairCategoryText}>{item.category}</Text>
                                                </View>
                                                <Text style={styles.affairTitle} numberOfLines={3}>{item.title}</Text>
                                                <Text style={styles.affairDate}>
                                                    {new Date(item.date || item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))}
                                </ScrollView>
                            </>
                        )}

                        {/* Job Opportunities */}
                        {jobs.length > 0 && (
                            <>
                                <SectionHeader
                                    title="Government Jobs"
                                    subtitle="Latest sarkari naukri"
                                    onSeeAll={() => navigation.navigate('ProfileTab')}
                                    delay={750}
                                />
                                {jobs.slice(0, 4).map((job, i) => (
                                    <Animated.View key={job.id} entering={FadeInDown.delay(800 + i * 60)}>
                                        <TouchableOpacity
                                            style={styles.jobItem}
                                            onPress={() => navigation.navigate('JobDetail', { id: job.id })}
                                            activeOpacity={0.9}
                                        >
                                            <LinearGradient colors={COLORS.gradientAccent} style={styles.jobItemIcon}>
                                                <Ionicons name="briefcase" size={16} color={COLORS.textWhite} />
                                            </LinearGradient>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.jobItemTitle} numberOfLines={1}>{job.title}</Text>
                                                <Text style={styles.jobItemOrg}>{job.organization}</Text>
                                                {job.lastDate && (
                                                    <Text style={styles.jobDeadline}>
                                                        Last Date: {new Date(job.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </Text>
                                                )}
                                            </View>
                                            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </>
                        )}
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    heroGradient: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    greeting: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.85)', fontWeight: FONTS.weights.medium },
    userName: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.textWhite, marginTop: 2 },
    notifBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    notifBadge: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
    searchBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.base, height: 46, ...SHADOWS.sm },
    searchPlaceholder: { marginLeft: SPACING.sm, fontSize: FONTS.sizes.md, color: COLORS.placeholder },

    // Banner
    bannerSection: { marginTop: -8 },
    bannerCard: { width: width - 32, marginRight: 0 },
    bannerGradient: { borderRadius: RADIUS.xl, padding: SPACING.lg, marginVertical: SPACING.sm, minHeight: 130 },
    bannerContent: { flexDirection: 'row', alignItems: 'center' },
    bannerTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.textWhite, marginBottom: 4 },
    bannerSubtitle: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', lineHeight: 18, marginBottom: SPACING.sm },
    bannerCta: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
    bannerCtaText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.textWhite, marginRight: 4 },
    bannerIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: SPACING.md },
    dotContainer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: SPACING.sm },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border, marginHorizontal: 3 },
    dotActive: { width: 20, backgroundColor: COLORS.primary, borderRadius: 3 },

    // Quick Actions
    quickActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.base },
    quickActionItem: { alignItems: 'center', width: (width - 32) / 5 },
    quickActionIcon: { width: 50, height: 50, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    quickActionLabel: { fontSize: 10, fontWeight: FONTS.weights.medium, color: COLORS.text, textAlign: 'center', lineHeight: 14 },

    // Stats Bar
    statsBar: { marginHorizontal: SPACING.base, marginBottom: SPACING.md },
    statsGradient: { borderRadius: RADIUS.lg, flexDirection: 'row', paddingVertical: SPACING.base },
    statItem: { flex: 1, alignItems: 'center' },
    statDivider: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)' },
    statValue: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    statLabel: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

    // Section Header
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
    sectionSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
    seeAllText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.primary, marginRight: 4 },

    // Horizontal List
    horizontalList: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm },

    // Course Card
    courseCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.card },
    courseThumbnail: { height: 100, justifyContent: 'center', alignItems: 'center' },
    courseInfo: { padding: SPACING.md },
    categoryBadge: { backgroundColor: COLORS.primaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.xs, alignSelf: 'flex-start', marginBottom: 6 },
    categoryText: { fontSize: 10, fontWeight: FONTS.weights.bold, color: COLORS.primary, textTransform: 'uppercase' },
    courseTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 6, lineHeight: 20 },
    courseMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    courseMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginLeft: 3 },
    priceLabel: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    originalPrice: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, textDecorationLine: 'line-through', marginLeft: 6 },
    freeLabel: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.success },

    // Quiz List Item
    quizItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SPACING.base, marginBottom: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg, ...SHADOWS.sm },
    quizDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.md },
    quizItemTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text },
    quizItemMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
    diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.xs },
    diffText: { fontSize: 9, fontWeight: FONTS.weights.bold },

    // Affair Card
    affairCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, height: 140, ...SHADOWS.card, justifyContent: 'space-between' },
    affairCategoryBadge: { backgroundColor: COLORS.primaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.xs, alignSelf: 'flex-start' },
    affairCategoryText: { fontSize: 9, fontWeight: FONTS.weights.bold, color: COLORS.primary, textTransform: 'uppercase' },
    affairTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text, lineHeight: 20, flex: 1, marginVertical: 6 },
    affairDate: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },

    // Job Item
    jobItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SPACING.base, marginBottom: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg, ...SHADOWS.sm },
    jobItemIcon: { width: 38, height: 38, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    jobItemTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text },
    jobItemOrg: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
    jobDeadline: { fontSize: 10, color: COLORS.error, marginTop: 2, fontWeight: FONTS.weights.medium },

    // Skeleton
    skeletonContainer: { padding: SPACING.base },
    skeletonCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOWS.sm },
    skeletonImage: { width: 80, height: 80, borderRadius: RADIUS.md, backgroundColor: COLORS.borderLight },
    skeletonLines: { flex: 1, marginLeft: SPACING.md, justifyContent: 'center' },
    skeletonLine: { height: 12, backgroundColor: COLORS.borderLight, borderRadius: RADIUS.xs, marginBottom: SPACING.sm },
});
