// Profile Screen - User Dashboard matching web UserDashboard
// Tabs: My Courses, My Quizzes, Settings
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, Alert, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ProfileScreen({ navigation }: any) {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'courses' | 'quizzes' | 'settings'>('courses');
    const [courses, setCourses] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loadingC, setLoadingC] = useState(true);
    const [loadingQ, setLoadingQ] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [cRes, qRes] = await Promise.allSettled([
                api.get('/courses/my/list'),
                api.get('/quizzes/my-quizzes'),
            ]);
            if (cRes.status === 'fulfilled') setCourses(cRes.value.data?.courses || []);
            if (qRes.status === 'fulfilled') setQuizzes(qRes.value.data?.quizzes || []);
        } catch (e) { console.log('Profile fetch error:', e); }
        finally { setLoadingC(false); setLoadingQ(false); }
    };

    useEffect(() => { fetchData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

    const completedCourses = courses.filter(c => c.completedAt).length;

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel' },
            { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); } },
        ]);
    };

    const tabs = [
        { key: 'courses', label: 'Courses', icon: 'book' },
        { key: 'quizzes', label: 'Quizzes', icon: 'help-circle' },
        { key: 'settings', label: 'Settings', icon: 'settings' },
    ] as const;

    return (
        <View style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>
                {/* Header */}
                <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary, COLORS.primaryLight]} style={s.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Animated.View entering={FadeInDown.delay(100)} style={s.profileRow}>
                        <View style={s.avatar}>
                            <Text style={s.avatarText}>{(user?.name || 'S')[0].toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.userName}>{user?.name || 'Student'}</Text>
                            <Text style={s.userEmail}>{user?.email}</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={s.notifBtn}>
                            <Ionicons name="notifications-outline" size={20} color={COLORS.textWhite} />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Stats */}
                    <Animated.View entering={FadeInDown.delay(200)} style={s.statsRow}>
                        {[
                            { value: courses.length, label: 'Enrolled', icon: 'book', color: '#3B82F6' },
                            { value: completedCourses, label: 'Completed', icon: 'checkmark-circle', color: '#16A34A' },
                            { value: quizzes.length, label: 'Quizzes', icon: 'help-circle', color: '#8B5CF6' },
                        ].map((stat, i) => (
                            <View key={i} style={s.statCard}>
                                <View style={[s.statIcon, { backgroundColor: stat.color + '20' }]}>
                                    <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                                </View>
                                <Text style={s.statValue}>{stat.value}</Text>
                                <Text style={s.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                        <TouchableOpacity style={s.statCard} onPress={() => navigation.navigate('Certificates')}>
                            <View style={[s.statIcon, { backgroundColor: '#F59E0B20' }]}>
                                <Ionicons name="ribbon" size={18} color="#F59E0B" />
                            </View>
                            <Text style={s.statValue}>→</Text>
                            <Text style={s.statLabel}>Certs</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </LinearGradient>

                {/* Tab Bar */}
                <View style={s.tabBar}>
                    {tabs.map(t => (
                        <TouchableOpacity key={t.key} style={[s.tab, activeTab === t.key && s.tabActive]} onPress={() => setActiveTab(t.key)}>
                            <Ionicons name={t.icon as any} size={16} color={activeTab === t.key ? COLORS.primary : COLORS.textSecondary} />
                            <Text style={[s.tabText, activeTab === t.key && s.tabTextActive]}>{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
                <View style={s.content}>
                    {activeTab === 'courses' && (
                        loadingC ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} /> :
                        courses.length === 0 ? (
                            <View style={s.empty}>
                                <Ionicons name="book-outline" size={48} color={COLORS.textLight} />
                                <Text style={s.emptyTitle}>No Enrolled Courses</Text>
                                <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate('CoursesTab')}>
                                    <Text style={s.primaryBtnText}>Browse Courses</Text>
                                </TouchableOpacity>
                            </View>
                        ) : courses.map((item, i) => {
                            const c = item.course || item;
                            const isComplete = !!item.completedAt;
                            return (
                                <Animated.View key={item.enrollmentId || c.id} entering={FadeInDown.delay(i * 60)}>
                                    <TouchableOpacity style={s.courseCard} onPress={() => navigation.navigate('CourseLearning', { courseId: c.id })} activeOpacity={0.9}>
                                        <LinearGradient colors={COLORS.gradientAccent} style={s.courseThumb}>
                                            <Ionicons name="book" size={24} color={COLORS.textWhite} />
                                        </LinearGradient>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <View style={s.catBadge}><Text style={s.catText}>{c.category || 'General'}</Text></View>
                                                {isComplete && <View style={s.doneBadge}><Ionicons name="checkmark" size={10} color={COLORS.textWhite} /><Text style={s.doneText}>Done</Text></View>}
                                            </View>
                                            <Text style={s.courseTitle} numberOfLines={2}>{c.title}</Text>
                                            <View style={s.progressRow}>
                                                <View style={s.progressBg}><View style={[s.progressFill, { width: `${item.progress || 0}%` }]} /></View>
                                                <Text style={s.progressPct}>{item.progress || 0}%</Text>
                                            </View>
                                            <Text style={s.lessonCount}>{item.completedLessons || 0}/{c.totalLessons || 0} lessons</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })
                    )}

                    {activeTab === 'quizzes' && (
                        loadingQ ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} /> :
                        quizzes.length === 0 ? (
                            <View style={s.empty}>
                                <Ionicons name="help-circle-outline" size={48} color={COLORS.textLight} />
                                <Text style={s.emptyTitle}>No Quizzes Attempted</Text>
                                <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate('TestsTab')}>
                                    <Text style={s.primaryBtnText}>Browse Quizzes</Text>
                                </TouchableOpacity>
                            </View>
                        ) : quizzes.map((quiz, i) => (
                            <Animated.View key={quiz.id} entering={FadeInDown.delay(i * 60)}>
                                <TouchableOpacity style={s.quizCard} onPress={() => navigation.navigate('QuizDetail', { id: quiz.quiz_id || quiz.id })} activeOpacity={0.9}>
                                    <View style={s.quizHeader}>
                                        <View style={[s.diffBadge, { backgroundColor: (quiz.difficulty === 'easy' ? COLORS.success : quiz.difficulty === 'hard' ? COLORS.error : COLORS.warning) + '15' }]}>
                                            <Text style={[s.diffText, { color: quiz.difficulty === 'easy' ? COLORS.success : quiz.difficulty === 'hard' ? COLORS.error : COLORS.warning }]}>{(quiz.difficulty || 'medium').toUpperCase()}</Text>
                                        </View>
                                        {quiz.is_passed && <Ionicons name="ribbon" size={18} color={COLORS.success} />}
                                    </View>
                                    <Text style={s.quizTitle} numberOfLines={2}>{quiz.title}</Text>
                                    <View style={s.quizMeta}>
                                        <Text style={s.quizMetaText}>Attempts: {quiz.total_attempts || 0}</Text>
                                        {quiz.best_score != null && (
                                            <Text style={[s.quizScore, { color: quiz.best_score >= 80 ? COLORS.success : quiz.best_score >= 60 ? COLORS.warning : COLORS.error }]}>
                                                Best: {quiz.best_score}%
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))
                    )}

                    {activeTab === 'settings' && (
                        <View style={s.settingsContainer}>
                            {[
                                { icon: 'person', label: 'Edit Profile', screen: 'EditProfile', color: '#3B82F6' },
                                { icon: 'lock-closed', label: 'Change Password', screen: 'ChangePassword', color: '#8B5CF6' },
                                { icon: 'ribbon', label: 'My Certificates', screen: 'Certificates', color: '#F59E0B' },
                                { icon: 'chatbubble-ellipses', label: 'Feedback', screen: 'Feedback', color: '#EC4899' },
                                { icon: 'notifications', label: 'Notifications', screen: 'Notifications', color: '#14B8A6' },
                            ].map((item, i) => (
                                <Animated.View key={item.label} entering={FadeInDown.delay(i * 60)}>
                                    <TouchableOpacity style={s.settingItem} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.9}>
                                        <View style={[s.settingIcon, { backgroundColor: item.color + '15' }]}>
                                            <Ionicons name={item.icon as any} size={20} color={item.color} />
                                        </View>
                                        <Text style={s.settingLabel}>{item.label}</Text>
                                        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                            <Animated.View entering={FadeInDown.delay(350)}>
                                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                                    <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                                    <Text style={s.logoutText}>Logout</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    avatarText: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    userName: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    userEmail: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    statsRow: { flexDirection: 'row', gap: SPACING.sm },
    statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center' },
    statIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    statValue: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
    tabBar: { flexDirection: 'row', marginHorizontal: SPACING.base, marginTop: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 4, ...SHADOWS.sm },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: RADIUS.md, gap: 4 },
    tabActive: { backgroundColor: COLORS.primaryBg },
    tabText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.textSecondary },
    tabTextActive: { color: COLORS.primary, fontWeight: FONTS.weights.semibold },
    content: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md },
    empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
    emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: SPACING.md, marginBottom: SPACING.md },
    primaryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
    primaryBtnText: { color: COLORS.textWhite, fontWeight: FONTS.weights.semibold },
    courseCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm },
    courseThumb: { width: 60, height: 60, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    catBadge: { backgroundColor: COLORS.primaryBg, paddingHorizontal: 6, paddingVertical: 1, borderRadius: RADIUS.xs, alignSelf: 'flex-start' },
    catText: { fontSize: 9, fontWeight: FONTS.weights.bold, color: COLORS.primary, textTransform: 'uppercase' },
    doneBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.success, paddingHorizontal: 6, paddingVertical: 1, borderRadius: RADIUS.xs, gap: 2 },
    doneText: { fontSize: 9, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    courseTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginTop: 4, marginBottom: 6, lineHeight: 20 },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    progressBg: { flex: 1, height: 4, backgroundColor: COLORS.borderLight, borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
    progressPct: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: COLORS.primary, width: 30 },
    lessonCount: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 4 },
    quizCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
    quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    diffBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.xs },
    diffText: { fontSize: 9, fontWeight: FONTS.weights.bold },
    quizTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 6 },
    quizMeta: { flexDirection: 'row', justifyContent: 'space-between' },
    quizMetaText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
    quizScore: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
    settingsContainer: { gap: SPACING.sm },
    settingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm },
    settingIcon: { width: 40, height: 40, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    settingLabel: { flex: 1, fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.medium, color: COLORS.text },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.errorLight, borderRadius: RADIUS.lg, padding: SPACING.base, gap: 8, marginTop: SPACING.md },
    logoutText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.error },
});
