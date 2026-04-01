// Course Detail Screen - Full course info, curriculum, enroll/buy
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { coursesAPI, paymentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function CourseDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { user } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [expandedModule, setExpandedModule] = useState<number | null>(null);
    const [showFullDesc, setShowFullDesc] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [courseRes, modulesRes] = await Promise.allSettled([
                    coursesAPI.getById(id),
                    coursesAPI.getModules(id),
                ]);
                if (courseRes.status === 'fulfilled') setCourse(courseRes.value.data?.course || courseRes.value.data);
                if (modulesRes.status === 'fulfilled') setModules(modulesRes.value.data?.modules || []);
                if (user) {
                    try {
                        const accessRes = await coursesAPI.getAccess(id);
                        setHasAccess(accessRes.data?.hasAccess || false);
                    } catch {}
                }
            } catch (err) { console.log('CourseDetail error:', err); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    const handleEnroll = async () => {
        if (!user) { Alert.alert('Login Required', 'Please login to enroll.'); return; }
        const isFree = course.isFree || (!course.originalPrice && !course.price) || course.price === 0;
        if (isFree) {
            try {
                setEnrolling(true);
                await coursesAPI.enroll(id);
                setHasAccess(true);
                Alert.alert('🎉 Enrolled!', 'You are now enrolled in this course.', [
                    { text: 'Start Learning', onPress: () => navigation.navigate('CourseLearning', { courseId: id }) },
                ]);
            } catch (err: any) {
                Alert.alert('Error', err.response?.data?.message || 'Failed to enroll');
            } finally { setEnrolling(false); }
        } else {
            Alert.alert('Payment', 'Payment integration coming soon. Contact support.');
        }
    };

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!course) return <View style={s.center}><Text style={s.errorText}>Course not found</Text></View>;

    const isFree = course.isFree || (!course.originalPrice && !course.price) || course.price === 0;
    const totalLessons = modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);

    return (
        <View style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary, COLORS.primaryLight]} style={s.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
                    </TouchableOpacity>
                    <View style={s.heroIcon}><Ionicons name="book" size={48} color="rgba(255,255,255,0.3)" /></View>
                    <View style={s.heroBadges}>
                        <View style={s.heroBadge}><Text style={s.heroBadgeText}>{course.category || 'General'}</Text></View>
                        <View style={s.heroBadge}><Text style={s.heroBadgeText}>{course.level || 'All Levels'}</Text></View>
                    </View>
                    <Text style={s.heroTitle}>{course.title}</Text>
                    <View style={s.heroMeta}>
                        <Ionicons name="star" size={14} color="#FCD34D" />
                        <Text style={s.heroMetaText}>{course.rating || 0}</Text>
                        <Ionicons name="people" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 12 }} />
                        <Text style={s.heroMetaText}>{course.totalStudents || 0} students</Text>
                        <Ionicons name="time" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 12 }} />
                        <Text style={s.heroMetaText}>{course.duration || 'Self-paced'}</Text>
                    </View>
                </LinearGradient>

                {/* Quick Stats */}
                <Animated.View entering={FadeInDown.delay(100)} style={s.statsRow}>
                    {[
                        { icon: 'book', value: `${totalLessons}`, label: 'Lessons' },
                        { icon: 'layers', value: `${modules.length}`, label: 'Modules' },
                        { icon: 'globe', value: course.language || 'Hindi', label: 'Language' },
                    ].map((stat, i) => (
                        <View key={i} style={s.statCard}>
                            <Ionicons name={stat.icon as any} size={18} color={COLORS.primary} />
                            <Text style={s.statVal}>{stat.value}</Text>
                            <Text style={s.statLbl}>{stat.label}</Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Description */}
                <Animated.View entering={FadeInDown.delay(200)} style={s.section}>
                    <Text style={s.sectionTitle}>About this Course</Text>
                    <Text style={s.descText} numberOfLines={showFullDesc ? undefined : 4}>
                        {course.description || 'No description available.'}
                    </Text>
                    {course.description && course.description.length > 200 && (
                        <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
                            <Text style={s.readMore}>{showFullDesc ? 'Show Less' : 'Read More'}</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>

                {/* Instructor */}
                {course.instructor && (
                    <Animated.View entering={FadeInDown.delay(250)} style={s.section}>
                        <Text style={s.sectionTitle}>Instructor</Text>
                        <View style={s.instructorRow}>
                            <View style={s.instructorAvatar}>
                                <Text style={s.instructorInitial}>{(course.instructor.name || 'I')[0]}</Text>
                            </View>
                            <View>
                                <Text style={s.instructorName}>{course.instructor.name}</Text>
                                <Text style={s.instructorBio}>{course.instructor.email}</Text>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Curriculum */}
                <Animated.View entering={FadeInDown.delay(300)} style={s.section}>
                    <Text style={s.sectionTitle}>Curriculum</Text>
                    <Text style={s.curriculumSummary}>{modules.length} modules • {totalLessons} lessons</Text>
                    {modules.map((mod, i) => (
                        <View key={mod.id} style={s.moduleItem}>
                            <TouchableOpacity style={s.moduleHeader} onPress={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}>
                                <View style={s.moduleNum}><Text style={s.moduleNumText}>{i + 1}</Text></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.moduleName}>{mod.title}</Text>
                                    <Text style={s.lessonCount}>{mod.lessons?.length || 0} lessons</Text>
                                </View>
                                <Ionicons name={expandedModule === mod.id ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textLight} />
                            </TouchableOpacity>
                            {expandedModule === mod.id && mod.lessons?.map((lesson: any) => (
                                <View key={lesson.id} style={s.lessonRow}>
                                    <Ionicons name={lesson.contentType === 'video' ? 'play-circle' : lesson.contentType === 'pdf' ? 'document-text' : 'book'} size={16} color={COLORS.textSecondary} />
                                    <Text style={s.lessonName} numberOfLines={1}>{lesson.title}</Text>
                                    {lesson.isFree && <View style={s.freeBadge}><Text style={s.freeText}>Free</Text></View>}
                                </View>
                            ))}
                        </View>
                    ))}
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={s.bottomBar}>
                <View>
                    {isFree ? (
                        <Text style={s.bottomPrice}>FREE</Text>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={s.bottomPrice}>₹{course.discountPrice || course.originalPrice || course.price}</Text>
                            {course.discountPrice && course.originalPrice && (
                                <Text style={s.bottomOrigPrice}>₹{course.originalPrice}</Text>
                            )}
                        </View>
                    )}
                </View>
                {hasAccess ? (
                    <TouchableOpacity style={s.continueBtn} onPress={() => navigation.navigate('CourseLearning', { courseId: id })}>
                        <Text style={s.continueBtnText}>Continue Learning</Text>
                        <Ionicons name="arrow-forward" size={16} color={COLORS.textWhite} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={s.enrollBtn} onPress={handleEnroll} disabled={enrolling}>
                        {enrolling ? <ActivityIndicator color={COLORS.textWhite} /> : (
                            <><Text style={s.enrollBtnText}>{isFree ? 'Enroll Free' : 'Buy Now'}</Text><Ionicons name={isFree ? 'checkmark-circle' : 'cart'} size={16} color={COLORS.textWhite} /></>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: COLORS.error, fontSize: FONTS.sizes.md },
    hero: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
    heroIcon: { position: 'absolute', right: 20, top: 60, opacity: 0.5 },
    heroBadges: { flexDirection: 'row', gap: 8, marginBottom: SPACING.sm },
    heroBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full },
    heroBadgeText: { fontSize: 11, fontWeight: FONTS.weights.semibold, color: COLORS.textWhite },
    heroTitle: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.textWhite, lineHeight: 32, marginBottom: SPACING.sm },
    heroMeta: { flexDirection: 'row', alignItems: 'center' },
    heroMetaText: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', marginLeft: 4 },
    statsRow: { flexDirection: 'row', marginHorizontal: SPACING.base, marginTop: -16, gap: SPACING.sm },
    statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOWS.card },
    statVal: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: 4 },
    statLbl: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
    section: { paddingHorizontal: SPACING.base, marginTop: SPACING.lg },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
    descText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 22 },
    readMore: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.primary, marginTop: 4 },
    instructorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOWS.sm },
    instructorAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    instructorInitial: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    instructorName: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.text },
    instructorBio: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
    curriculumSummary: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    moduleItem: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, overflow: 'hidden', ...SHADOWS.sm },
    moduleHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
    moduleNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    moduleNumText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    moduleName: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text },
    lessonCount: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
    lessonRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.borderLight, gap: SPACING.sm },
    lessonName: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.text },
    freeBadge: { backgroundColor: COLORS.primaryBg, paddingHorizontal: 6, paddingVertical: 1, borderRadius: RADIUS.xs },
    freeText: { fontSize: 9, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.lg },
    bottomPrice: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    bottomOrigPrice: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, textDecorationLine: 'line-through', marginLeft: 8 },
    enrollBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, gap: 6, ...SHADOWS.green },
    enrollBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    continueBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', borderRadius: RADIUS.lg, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, gap: 6 },
    continueBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
});
