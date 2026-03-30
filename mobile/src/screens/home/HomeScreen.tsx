// Home / Dashboard Screen - Student's main screen with animated sections
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight, SlideInRight } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { StatCard, CourseCard, LoadingSkeleton } from '../../components/SharedComponents';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI, quizzesAPI, currentAffairsAPI, jobsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [currentAffairs, setCurrentAffairs] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        try {
            const [coursesRes, quizzesRes, affairsRes, jobsRes] = await Promise.allSettled([
                coursesAPI.getAll({ limit: 5 }),
                quizzesAPI.getAll({ limit: 5 }),
                currentAffairsAPI.getAll({ limit: 5 }),
                jobsAPI.getAll({ limit: 5 }),
            ]);
            if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data?.courses || coursesRes.value.data?.data || []);
            if (quizzesRes.status === 'fulfilled') setQuizzes(quizzesRes.value.data?.quizzes || quizzesRes.value.data?.data || []);
            if (affairsRes.status === 'fulfilled') setCurrentAffairs(affairsRes.value.data?.data || affairsRes.value.data?.currentAffairs || []);
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

    const SectionHeader = ({ title, subtitle, onSeeAll, delay = 0 }: any) => (
        <Animated.View entering={FadeInDown.delay(delay)} style={styles.sectionHeader}>
            <View>
                <Text style={styles.sectionTitle}>{title}</Text>
                {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
            </View>
            {onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn}>
                    <Text style={styles.seeAllText}>See All</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                </TouchableOpacity>
            )}
        </Animated.View>
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
                            <Ionicons name="notifications-outline" size={24} color={COLORS.textWhite} />
                            <View style={styles.notifBadge} />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Search Banner */}
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <TouchableOpacity style={styles.searchBanner} activeOpacity={0.8}>
                            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                            <Text style={styles.searchPlaceholder}>Search courses, quizzes, jobs...</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </LinearGradient>

                {/* Quick Stats */}
                <Animated.View entering={FadeInDown.delay(300)} style={styles.statsRow}>
                    <StatCard title="Courses" value={courses.length} icon="book" color={COLORS.primary} index={0} />
                    <StatCard title="Quizzes" value={quizzes.length} icon="help-circle" color={COLORS.warning} index={1} />
                    <StatCard title="Jobs" value={jobs.length} icon="briefcase" color={COLORS.info} index={2} />
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.delay(400)} style={styles.quickActions}>
                    {[
                        { icon: 'book', label: 'Courses', screen: 'CoursesTab', color: COLORS.primary },
                        { icon: 'help-circle', label: 'Quizzes', screen: 'QuizzesTab', color: '#F59E0B' },
                        { icon: 'newspaper', label: 'Affairs', screen: 'CurrentAffairs', color: '#8B5CF6' },
                        { icon: 'document-text', label: 'Study', screen: 'StudyMaterials', color: '#EC4899' },
                    ].map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.quickActionItem}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: item.color + '15' }]}>
                                <Ionicons name={item.icon as any} size={24} color={item.color} />
                            </View>
                            <Text style={styles.quickActionLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {loading ? <LoadingSkeleton count={3} /> : (
                    <>
                        {/* Popular Courses */}
                        {courses.length > 0 && (
                            <>
                                <SectionHeader title="Popular Courses" subtitle="Start learning today" onSeeAll={() => navigation.navigate('CoursesTab')} delay={500} />
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                    {courses.slice(0, 5).map((course, i) => (
                                        <Animated.View key={course.id} entering={SlideInRight.delay(i * 100)} style={styles.horizontalCard}>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('CourseDetail', { id: course.id })}
                                                style={styles.miniCourseCard}
                                                activeOpacity={0.9}
                                            >
                                                <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.miniThumbnail}>
                                                    <Ionicons name="book" size={28} color={COLORS.textWhite} />
                                                </LinearGradient>
                                                <Text style={styles.miniTitle} numberOfLines={2}>{course.title}</Text>
                                                <Text style={styles.miniMeta}>{course.category} • {course.duration}</Text>
                                                {course.isFree ? (
                                                    <Text style={styles.miniFree}>FREE</Text>
                                                ) : (
                                                    <Text style={styles.miniPrice}>₹{course.discountPrice || course.originalPrice}</Text>
                                                )}
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))}
                                </ScrollView>
                            </>
                        )}

                        {/* Latest Quizzes */}
                        {quizzes.length > 0 && (
                            <>
                                <SectionHeader title="Latest Quizzes" subtitle="Test your knowledge" onSeeAll={() => navigation.navigate('QuizzesTab')} delay={600} />
                                {quizzes.slice(0, 3).map((quiz, i) => (
                                    <Animated.View key={quiz.id} entering={FadeInDown.delay(700 + i * 80)}>
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
                                                <Text style={styles.quizItemMeta}>{quiz.duration} min • {quiz.total_marks} marks</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </>
                        )}

                        {/* Current Affairs */}
                        {currentAffairs.length > 0 && (
                            <>
                                <SectionHeader title="Current Affairs" subtitle="Stay updated" onSeeAll={() => navigation.navigate('CurrentAffairs')} delay={800} />
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                    {currentAffairs.slice(0, 5).map((item, i) => (
                                        <Animated.View key={item.id} entering={SlideInRight.delay(i * 100)} style={styles.horizontalCard}>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('CurrentAffairDetail', { id: item.id })}
                                                style={styles.affairCard}
                                                activeOpacity={0.9}
                                            >
                                                <View style={styles.affairCategory}>
                                                    <Text style={styles.affairCategoryText}>{item.category}</Text>
                                                </View>
                                                <Text style={styles.affairTitle} numberOfLines={3}>{item.title}</Text>
                                                <Text style={styles.affairDate}>
                                                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))}
                                </ScrollView>
                            </>
                        )}

                        {/* Latest Jobs */}
                        {jobs.length > 0 && (
                            <>
                                <SectionHeader title="Job Opportunities" subtitle="Build your career" onSeeAll={() => navigation.navigate('JobsTab')} delay={900} />
                                {jobs.slice(0, 3).map((job, i) => (
                                    <Animated.View key={job.id} entering={FadeInDown.delay(1000 + i * 80)}>
                                        <TouchableOpacity
                                            style={styles.jobItem}
                                            onPress={() => navigation.navigate('JobDetail', { id: job.id })}
                                            activeOpacity={0.9}
                                        >
                                            <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.jobItemIcon}>
                                                <Ionicons name="briefcase" size={18} color={COLORS.textWhite} />
                                            </LinearGradient>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.jobItemTitle} numberOfLines={1}>{job.title}</Text>
                                                <Text style={styles.jobItemOrg}>{job.organization}</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
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
    heroGradient: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    greeting: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.85)' },
    userName: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.textWhite, marginTop: 2 },
    notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    notifBadge: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
    searchBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.base, height: 48, ...SHADOWS.sm },
    searchPlaceholder: { marginLeft: SPACING.sm, fontSize: FONTS.sizes.md, color: COLORS.placeholder },
    statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, marginTop: -16 },
    quickActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: SPACING.base, paddingVertical: SPACING.lg },
    quickActionItem: { alignItems: 'center' },
    quickActionIcon: { width: 56, height: 56, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xs },
    quickActionLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.text },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
    sectionSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
    seeAllText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.primary, marginRight: 4 },
    horizontalList: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm },
    horizontalCard: { width: width * 0.6, marginRight: SPACING.md },
    miniCourseCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.md },
    miniThumbnail: { height: 100, justifyContent: 'center', alignItems: 'center' },
    miniTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, padding: SPACING.md, paddingBottom: 4, lineHeight: 20 },
    miniMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, paddingHorizontal: SPACING.md },
    miniPrice: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.primary, padding: SPACING.md, paddingTop: SPACING.xs },
    miniFree: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.success, padding: SPACING.md, paddingTop: SPACING.xs },
    quizItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SPACING.base, marginBottom: SPACING.sm, padding: SPACING.base, borderRadius: RADIUS.lg, ...SHADOWS.sm },
    quizDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.md },
    quizItemTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text },
    quizItemMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
    affairCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, width: '100%', height: 150, ...SHADOWS.md },
    affairCategory: { backgroundColor: COLORS.primaryBg, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.xs, alignSelf: 'flex-start', marginBottom: SPACING.sm },
    affairCategoryText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: COLORS.primary, textTransform: 'uppercase' },
    affairTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text, lineHeight: 20, flex: 1 },
    affairDate: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: SPACING.sm },
    jobItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SPACING.base, marginBottom: SPACING.sm, padding: SPACING.base, borderRadius: RADIUS.lg, ...SHADOWS.sm },
    jobItemIcon: { width: 40, height: 40, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    jobItemTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text },
    jobItemOrg: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
});
