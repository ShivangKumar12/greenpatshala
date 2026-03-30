// Course Detail Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { AnimatedButton } from '../../components/SharedComponents';
import { coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CourseDetailScreen({ navigation, route }: any) {
    const { id } = route.params;
    const { isAuthenticated } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        loadCourse();
    }, [id]);

    const loadCourse = async () => {
        try {
            const [courseRes, modulesRes] = await Promise.allSettled([
                coursesAPI.getById(id),
                coursesAPI.getModules(id),
            ]);
            if (courseRes.status === 'fulfilled') setCourse(courseRes.value.data?.course || courseRes.value.data);
            if (modulesRes.status === 'fulfilled') setModules(modulesRes.value.data?.modules || modulesRes.value.data?.data || []);
        } catch (err) { console.log('Course detail error:', err); }
        finally { setLoading(false); }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigation.navigate('Auth');
            return;
        }
        setEnrolling(true);
        try {
            await coursesAPI.enroll(id);
            Alert.alert('Success!', 'You have been enrolled in this course.');
            loadCourse();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );

    if (!course) return null;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={styles.hero}>
                    <Animated.View entering={FadeInDown}>
                        <View style={styles.heroBack}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} onPress={() => navigation.goBack()} />
                        </View>
                        <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.3)" style={styles.heroIcon} />
                        <View style={styles.heroCategory}>
                            <Text style={styles.heroCategoryText}>{course.category}</Text>
                        </View>
                        <Text style={styles.heroTitle}>{course.title}</Text>
                        <View style={styles.heroStats}>
                            <View style={styles.heroStat}>
                                <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.heroStatText}>{course.duration}</Text>
                            </View>
                            <View style={styles.heroStat}>
                                <Ionicons name="people-outline" size={16} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.heroStatText}>{course.totalStudents || 0} students</Text>
                            </View>
                            <View style={styles.heroStat}>
                                <Ionicons name="bar-chart-outline" size={16} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.heroStatText}>{course.level}</Text>
                            </View>
                        </View>
                    </Animated.View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Price & Enroll */}
                    <Animated.View entering={FadeInDown.delay(200)} style={styles.priceCard}>
                        <View>
                            {course.isFree ? (
                                <Text style={styles.priceFree}>FREE</Text>
                            ) : (
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceAmount}>₹{course.discountPrice || course.originalPrice}</Text>
                                    {course.discountPrice && <Text style={styles.priceOriginal}>₹{course.originalPrice}</Text>}
                                </View>
                            )}
                        </View>
                        <AnimatedButton
                            title={course.isFree ? 'Enroll Now' : 'Buy Course'}
                            onPress={handleEnroll}
                            loading={enrolling}
                            icon="cart-outline"
                            style={{ paddingHorizontal: 24 }}
                        />
                    </Animated.View>

                    {/* Description */}
                    <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
                        <Text style={styles.sectionTitle}>About this Course</Text>
                        <Text style={styles.description}>{course.description}</Text>
                    </Animated.View>

                    {/* Features */}
                    {course.features && Array.isArray(course.features) && (
                        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
                            <Text style={styles.sectionTitle}>What You'll Learn</Text>
                            {course.features.map((feature: string, i: number) => (
                                <View key={i} style={styles.featureRow}>
                                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </Animated.View>
                    )}

                    {/* Modules */}
                    {modules.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
                            <Text style={styles.sectionTitle}>Course Modules ({modules.length})</Text>
                            {modules.map((mod, i) => (
                                <View key={mod.id} style={styles.moduleCard}>
                                    <View style={styles.moduleNumber}>
                                        <Text style={styles.moduleNumberText}>{i + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.moduleTitle}>{mod.title}</Text>
                                        {mod.description && <Text style={styles.moduleDesc} numberOfLines={2}>{mod.description}</Text>}
                                    </View>
                                </View>
                            ))}
                        </Animated.View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    hero: { paddingTop: 50, paddingBottom: 30, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    heroBack: { marginBottom: SPACING.base },
    heroIcon: { alignSelf: 'center', marginBottom: SPACING.base },
    heroCategory: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: SPACING.sm },
    heroCategoryText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.textWhite, textTransform: 'uppercase' },
    heroTitle: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.textWhite, lineHeight: 32, marginBottom: SPACING.md },
    heroStats: { flexDirection: 'row', flexWrap: 'wrap' },
    heroStat: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.lg },
    heroStatText: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginLeft: 4 },
    content: { padding: SPACING.base, paddingTop: SPACING.lg },
    priceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.base, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, ...SHADOWS.md },
    priceRow: { flexDirection: 'row', alignItems: 'baseline' },
    priceAmount: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.primary },
    priceOriginal: { fontSize: FONTS.sizes.md, color: COLORS.textLight, textDecorationLine: 'line-through', marginLeft: SPACING.sm },
    priceFree: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.success },
    section: { marginBottom: SPACING.xl },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.md },
    description: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 24 },
    featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
    featureText: { fontSize: FONTS.sizes.md, color: COLORS.text, marginLeft: SPACING.sm, flex: 1, lineHeight: 22 },
    moduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.base, borderRadius: RADIUS.md, marginBottom: SPACING.sm, ...SHADOWS.sm },
    moduleNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    moduleNumberText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    moduleTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text },
    moduleDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
});
