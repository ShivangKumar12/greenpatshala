// Home Screen - Production-ready LMS mobile homepage
// Dynamic content controlled via admin panel, no hardcoded data
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, Dimensions, FlatList, Image, Linking,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown, FadeInRight, SlideInRight, FadeIn,
    useSharedValue, useAnimatedStyle, withRepeat, withTiming,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import {
    coursesAPI, quizzesAPI, currentAffairsAPI, jobsAPI,
    studyMaterialsAPI, testimonialsAPI, mobileSettingsAPI,
} from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;
const BASE_URL = 'https://greenpatshala.in';

// ============================================
// HELPER: Resolve image URL
// ============================================
const resolveImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    return `${BASE_URL}/${url}`;
};

// ============================================
// HELPER: Parse JSON safely
// ============================================
const parseJSON = (val: any, fallback: any = null) => {
    if (!val) return fallback;
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return fallback; }
};

// ============================================
// SHIMMER PLACEHOLDER
// ============================================
const ShimmerBlock = ({ width: w, height: h, style }: any) => {
    const opacity = useSharedValue(0.3);
    React.useEffect(() => {
        opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    }, []);
    const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return (
        <Animated.View
            style={[{
                width: w, height: h, backgroundColor: COLORS.borderLight,
                borderRadius: RADIUS.md,
            }, animStyle, style]}
        />
    );
};

const BannerShimmer = () => (
    <View style={{ paddingHorizontal: SPACING.base, marginTop: SPACING.sm }}>
        <ShimmerBlock width={width - 32} height={160} style={{ borderRadius: RADIUS.xl }} />
    </View>
);

const CardShimmer = () => (
    <View style={{ width: CARD_WIDTH, marginRight: SPACING.md }}>
        <ShimmerBlock width={CARD_WIDTH} height={120} style={{ borderRadius: RADIUS.lg, marginBottom: 8 }} />
        <ShimmerBlock width={CARD_WIDTH * 0.7} height={14} style={{ marginBottom: 6 }} />
        <ShimmerBlock width={CARD_WIDTH * 0.5} height={12} />
    </View>
);

const ListShimmer = () => (
    <View style={{ paddingHorizontal: SPACING.base }}>
        {[1, 2, 3].map(i => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                <ShimmerBlock width={44} height={44} style={{ borderRadius: RADIUS.md, marginRight: SPACING.md }} />
                <View style={{ flex: 1 }}>
                    <ShimmerBlock width="80%" height={14} style={{ marginBottom: 6 }} />
                    <ShimmerBlock width="50%" height={11} />
                </View>
            </View>
        ))}
    </View>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function HomeScreen({ navigation }: any) {
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data states
    const [courses, setCourses] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [currentAffairs, setCurrentAffairs] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
    const [testimonials, setTestimonials] = useState<any[]>([]);

    // Mobile settings
    const [mobileSettings, setMobileSettings] = useState<any>(null);
    const [banners, setBanners] = useState<any[]>([]);
    const [promoBanner1, setPromoBanner1] = useState<any>(null);
    const [promoBanner2, setPromoBanner2] = useState<any>(null);
    const [promoBanners, setPromoBanners] = useState<any[]>([]);
    const [promoDisplayMode, setPromoDisplayMode] = useState<'carousel' | 'list'>('carousel');

    // Banner carousel
    const bannerRef = useRef<FlatList>(null);
    const [bannerIndex, setBannerIndex] = useState(0);

    // Auto-scroll banners
    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setBannerIndex(prev => {
                const next = (prev + 1) % banners.length;
                try { bannerRef.current?.scrollToIndex({ index: next, animated: true }); } catch {}
                return next;
            });
        }, 4000);
        return () => clearInterval(timer);
    }, [banners.length]);

    // ============================================
    // DATA LOADING
    // ============================================
    const loadData = useCallback(async () => {
        try {
            const [
                coursesRes, quizzesRes, affairsRes, jobsRes,
                materialsRes, testimonialsRes, settingsRes,
            ] = await Promise.allSettled([
                coursesAPI.getAll({ limit: 6 }),
                quizzesAPI.getAll({ limit: 6 }),
                currentAffairsAPI.getAll({ limit: 6 }),
                jobsAPI.getAll({ limit: 5, status: 'active' }),
                studyMaterialsAPI.getAll({ limit: 6 }),
                testimonialsAPI.getPublic(),
                mobileSettingsAPI.getPublic(),
            ]);

            if (coursesRes.status === 'fulfilled')
                setCourses(coursesRes.value.data?.courses || coursesRes.value.data?.data || []);
            if (quizzesRes.status === 'fulfilled') {
                const q = quizzesRes.value.data?.quizzes || quizzesRes.value.data?.data || [];
                setQuizzes(q.filter((quiz: any) => quiz.is_published === 1 || quiz.is_published === true));
            }
            if (affairsRes.status === 'fulfilled')
                setCurrentAffairs(affairsRes.value.data?.data || affairsRes.value.data?.items || affairsRes.value.data?.currentAffairs || []);
            if (jobsRes.status === 'fulfilled')
                setJobs(jobsRes.value.data?.jobs || jobsRes.value.data?.data || []);
            if (materialsRes.status === 'fulfilled')
                setStudyMaterials(materialsRes.value.data?.materials || materialsRes.value.data?.data || materialsRes.value.data?.studyMaterials || []);
            if (testimonialsRes.status === 'fulfilled')
                setTestimonials(testimonialsRes.value.data?.testimonials || testimonialsRes.value.data?.data || []);

            // Mobile settings
            if (settingsRes.status === 'fulfilled') {
                const settings = settingsRes.value.data?.settings;
                if (settings) {
                    setMobileSettings(settings);
                    // Parse banners
                    let b = parseJSON(settings.banners, []);
                    if (Array.isArray(b)) {
                        b = b.filter((banner: any) => banner.isActive && banner.imageUrl);
                        b.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                        setBanners(b);
                    }
                    // Parse promo banners (legacy)
                    const pb1 = parseJSON(settings.promoBanner1);
                    if (pb1?.isActive && pb1?.imageUrl) setPromoBanner1(pb1);
                    else setPromoBanner1(null);
                    const pb2 = parseJSON(settings.promoBanner2);
                    if (pb2?.isActive && pb2?.imageUrl) setPromoBanner2(pb2);
                    else setPromoBanner2(null);

                    // Parse new dynamic promo banners
                    let pbs = parseJSON(settings.promoBanners, []);
                    if (Array.isArray(pbs)) {
                        pbs = pbs.filter((p: any) => p.isActive && p.imageUrl);
                        pbs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                        setPromoBanners(pbs);
                    }
                    setPromoDisplayMode(settings.promoDisplayMode || 'carousel');
                }
            }
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

    // ============================================
    // VISIBILITY FLAGS
    // ============================================
    const showCourses = mobileSettings?.showCourses !== false;
    const showQuizzes = mobileSettings?.showQuizzes !== false;
    const showJobs = mobileSettings?.showJobs !== false;
    const showCurrentAffairs = mobileSettings?.showCurrentAffairs !== false;
    const showStudyMaterials = mobileSettings?.showStudyMaterials !== false;

    // ============================================
    // HELPERS
    // ============================================
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleBannerPress = (banner: any) => {
        if (banner.linkUrl) {
            if (banner.linkUrl.startsWith('screen://')) {
                const screen = banner.linkUrl.replace('screen://', '');
                navigation.navigate(screen);
            } else {
                Linking.openURL(banner.linkUrl).catch(() => {});
            }
        }
    };

    const quickActions = [
        { icon: 'document-text', label: 'Study\nNotes', color: '#EC4899', screen: 'StudyTab' },
        { icon: 'clipboard', label: 'Test\nSeries', color: '#8B5CF6', screen: 'TestsTab' },
        { icon: 'help-circle', label: 'Practice\nQuizzes', color: '#F59E0B', screen: 'CoursesTab' },
        { icon: 'newspaper', label: 'Current\nAffairs', color: '#3B82F6', screen: 'StudyTab' },
        { icon: 'briefcase', label: 'Govt\nJobs', color: '#16A34A', screen: 'ProfileTab' },
    ];

    // ============================================
    // SUBCOMPONENTS
    // ============================================
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

    // ============================================
    // BANNER CAROUSEL (Image-based from admin)
    // ============================================
    const renderBanner = ({ item }: any) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleBannerPress(item)}
            style={styles.bannerCard}
        >
            <Image
                source={{ uri: resolveImageUrl(item.imageUrl)! }}
                style={styles.bannerImage}
                resizeMode="cover"
            />
            {item.title ? (
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.bannerOverlay}
                >
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                </LinearGradient>
            ) : null}
        </TouchableOpacity>
    );

    // Fallback banners when admin hasn't configured any
    const fallbackBanners = [
        { id: 'f1', title: 'Explore Courses', imageUrl: null, linkUrl: 'screen://CoursesTab', colors: [COLORS.primary, '#16A34A'] as const, icon: 'book' },
        { id: 'f2', title: 'Practice Quizzes', imageUrl: null, linkUrl: 'screen://TestsTab', colors: ['#F59E0B', '#D97706'] as const, icon: 'help-circle' },
        { id: 'f3', title: 'Current Affairs', imageUrl: null, linkUrl: 'screen://StudyTab', colors: ['#8B5CF6', '#7C3AED'] as const, icon: 'newspaper' },
    ];

    const renderFallbackBanner = ({ item }: any) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleBannerPress(item)}
            style={styles.bannerCard}
        >
            <LinearGradient colors={item.colors} style={styles.fallbackBannerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.fallbackBannerContent}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.fallbackBannerTitle}>{item.title}</Text>
                        <View style={styles.fallbackBannerCta}>
                            <Text style={styles.fallbackBannerCtaText}>Explore Now</Text>
                            <Ionicons name="arrow-forward" size={14} color={COLORS.textWhite} />
                        </View>
                    </View>
                    <View style={styles.fallbackBannerIconBg}>
                        <Ionicons name={item.icon as any} size={36} color="rgba(255,255,255,0.3)" />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    const activeBanners = banners.length > 0 ? banners : fallbackBanners;
    const isImageBanners = banners.length > 0;

    // ============================================
    // PROMO BANNER STRIP
    // ============================================
    const PromoBannerStrip = ({ data }: { data: any }) => {
        if (!data?.imageUrl) return null;
        const imgUrl = resolveImageUrl(data.imageUrl);
        if (!imgUrl) return null;

        return (
            <Animated.View entering={FadeInDown.delay(200)} style={styles.promoContainer}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        if (data.linkUrl) {
                            if (data.linkUrl.startsWith('screen://')) {
                                navigation.navigate(data.linkUrl.replace('screen://', ''));
                            } else {
                                Linking.openURL(data.linkUrl).catch(() => {});
                            }
                        }
                    }}
                >
                    <Image
                        source={{ uri: imgUrl }}
                        style={styles.promoImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // ============================================
    // COURSE CARD with real thumbnail
    // ============================================
    const renderCourseCard = (course: any, i: number) => {
        const thumbnailUrl = resolveImageUrl(course.thumbnail);
        return (
            <Animated.View key={course.id} entering={SlideInRight.delay(i * 80)} style={{ width: CARD_WIDTH, marginRight: SPACING.md }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('CourseDetail', { id: course.id })}
                    style={styles.courseCard}
                    activeOpacity={0.9}
                >
                    {thumbnailUrl ? (
                        <Image
                            source={{ uri: thumbnailUrl }}
                            style={styles.courseThumbnail}
                            resizeMode="cover"
                        />
                    ) : (
                        <LinearGradient colors={COLORS.gradientAccent} style={[styles.courseThumbnail, styles.courseThumbnailFallback]}>
                            <Ionicons name="book" size={28} color={COLORS.textWhite} />
                        </LinearGradient>
                    )}
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
        );
    };

    // ============================================
    // STUDY MATERIAL CARD
    // ============================================
    const renderStudyMaterialCard = (material: any, i: number) => {
        const getFileIcon = (type: string): string => {
            switch (type?.toLowerCase()) {
                case 'pdf': return 'document-text';
                case 'video': return 'videocam';
                case 'image': return 'image';
                default: return 'document';
            }
        };
        const thumbnailUrl = resolveImageUrl(material.thumbnail);

        return (
            <Animated.View key={material.id} entering={SlideInRight.delay(i * 80)} style={{ width: width * 0.42, marginRight: SPACING.md }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('StudyTab')}
                    style={styles.studyCard}
                    activeOpacity={0.9}
                >
                    <View style={styles.studyIconContainer}>
                        {thumbnailUrl ? (
                            <Image source={{ uri: thumbnailUrl }} style={styles.studyThumbnail} resizeMode="cover" />
                        ) : (
                            <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.studyIconGradient}>
                                <Ionicons name={getFileIcon(material.fileType) as any} size={24} color="#fff" />
                            </LinearGradient>
                        )}
                    </View>
                    <Text style={styles.studyTitle} numberOfLines={2}>{material.title}</Text>
                    <Text style={styles.studySubject}>{material.subject}</Text>
                    <View style={styles.studyMeta}>
                        <View style={styles.studyMetaBadge}>
                            <Text style={styles.studyMetaBadgeText}>{material.fileType?.toUpperCase() || 'PDF'}</Text>
                        </View>
                        {material.isPaid ? (
                            <Text style={styles.studyPrice}>₹{material.discountPrice || material.price}</Text>
                        ) : (
                            <Text style={styles.studyFree}>FREE</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // ============================================
    // TESTIMONIAL CARD
    // ============================================
    const renderTestimonialCard = (testimonial: any, i: number) => (
        <Animated.View key={testimonial.id} entering={SlideInRight.delay(i * 100)} style={{ width: width * 0.78, marginRight: SPACING.md }}>
            <View style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                    <View style={styles.testimonialAvatar}>
                        <Text style={styles.testimonialAvatarText}>
                            {testimonial.avatar || testimonial.name?.substring(0, 2)?.toUpperCase() || '?'}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.testimonialName}>{testimonial.name}</Text>
                        <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                    </View>
                </View>
                <View style={styles.testimonialStars}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Ionicons
                            key={star}
                            name={star <= (testimonial.rating || 5) ? 'star' : 'star-outline'}
                            size={14}
                            color="#F59E0B"
                            style={{ marginRight: 2 }}
                        />
                    ))}
                </View>
                <Text style={styles.testimonialContent} numberOfLines={4}>
                    "{testimonial.content}"
                </Text>
            </View>
        </Animated.View>
    );

    // ============================================
    // RENDER
    // ============================================
    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
            >
                {/* ===== HERO HEADER ===== */}
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

                {/* ===== BANNER CAROUSEL ===== */}
                <Animated.View entering={FadeInDown.delay(250)} style={styles.bannerSection}>
                    {loading ? (
                        <BannerShimmer />
                    ) : (
                        <>
                            <FlatList
                                ref={bannerRef}
                                data={activeBanners}
                                renderItem={isImageBanners ? renderBanner : renderFallbackBanner}
                                keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
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
                                getItemLayout={(_, index) => ({
                                    length: width - 32,
                                    offset: (width - 32) * index,
                                    index,
                                })}
                            />
                            <View style={styles.dotContainer}>
                                {activeBanners.map((_, i) => (
                                    <View key={i} style={[styles.dot, bannerIndex === i && styles.dotActive]} />
                                ))}
                            </View>
                        </>
                    )}
                </Animated.View>

                {/* ===== QUICK ACTIONS ===== */}
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

                {/* ===== STATS BAR ===== */}
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

                {/* ===== POPULAR COURSES ===== */}
                {showCourses && (
                    loading ? (
                        <>
                            <SectionHeader title="Popular Courses" subtitle="Start learning today" delay={400} />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                {[1, 2, 3].map(i => <CardShimmer key={i} />)}
                            </ScrollView>
                        </>
                    ) : courses.length > 0 ? (
                        <>
                            <SectionHeader
                                title="Popular Courses"
                                subtitle="Start learning today"
                                onSeeAll={() => navigation.navigate('CoursesTab')}
                                delay={400}
                            />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                {courses.slice(0, 6).map((course, i) => renderCourseCard(course, i))}
                            </ScrollView>
                        </>
                    ) : null
                )}

                {/* ===== PROMO BANNERS (new dynamic system) ===== */}
                {promoBanners.length > 0 ? (
                    promoDisplayMode === 'carousel' ? (
                        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ marginVertical: SPACING.sm }}>
                            {promoBanners.map((p, i) => <PromoBannerStrip key={i} data={p} />)}
                        </ScrollView>
                    ) : (
                        <View style={{ marginVertical: SPACING.sm }}>
                            {promoBanners.map((p, i) => <PromoBannerStrip key={i} data={p} />)}
                        </View>
                    )
                ) : (
                    promoBanner1 && <PromoBannerStrip data={promoBanner1} />
                )}

                {/* ===== STUDY MATERIALS ===== */}
                {showStudyMaterials && (
                    loading ? (
                        <>
                            <SectionHeader title="Study Materials" subtitle="Download & learn" delay={450} />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                {[1, 2, 3].map(i => (
                                    <View key={i} style={{ width: width * 0.42, marginRight: SPACING.md }}>
                                        <ShimmerBlock width={width * 0.42} height={70} style={{ marginBottom: 6 }} />
                                        <ShimmerBlock width="75%" height={12} style={{ marginBottom: 4 }} />
                                        <ShimmerBlock width="50%" height={10} />
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    ) : studyMaterials.length > 0 ? (
                        <>
                            <SectionHeader
                                title="Study Materials"
                                subtitle="Download & learn"
                                onSeeAll={() => navigation.navigate('StudyTab')}
                                delay={450}
                            />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                {studyMaterials.slice(0, 6).map((material, i) => renderStudyMaterialCard(material, i))}
                            </ScrollView>
                        </>
                    ) : null
                )}

                {/* ===== PRACTICE QUIZZES ===== */}
                {showQuizzes && (
                    loading ? <ListShimmer /> : quizzes.length > 0 ? (
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
                    ) : null
                )}

                {/* ===== PROMO BANNER 2 (legacy fallback) ===== */}
                {promoBanners.length === 0 && promoBanner2 && <PromoBannerStrip data={promoBanner2} />}

                {/* ===== CURRENT AFFAIRS ===== */}
                {showCurrentAffairs && (
                    loading ? null : currentAffairs.length > 0 ? (
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
                    ) : null
                )}

                {/* ===== REVIEWS / TESTIMONIALS ===== */}
                {testimonials.length > 0 && (
                    <>
                        <SectionHeader
                            title="Student Reviews"
                            subtitle="What our students say"
                            delay={700}
                        />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                            {testimonials.slice(0, 6).map((t, i) => renderTestimonialCard(t, i))}
                        </ScrollView>
                    </>
                )}

                {/* ===== GOVERNMENT JOBS ===== */}
                {showJobs && (
                    loading ? null : jobs.length > 0 ? (
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
                    ) : null
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Hero
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
    bannerCard: { width: width - 32, borderRadius: RADIUS.xl, overflow: 'hidden', marginVertical: SPACING.sm },
    bannerImage: { width: '100%', height: 160, borderRadius: RADIUS.xl },
    bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, borderBottomLeftRadius: RADIUS.xl, borderBottomRightRadius: RADIUS.xl },
    bannerTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    dotContainer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: SPACING.sm },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border, marginHorizontal: 3 },
    dotActive: { width: 20, backgroundColor: COLORS.primary, borderRadius: 3 },

    // Fallback Banners
    fallbackBannerGradient: { borderRadius: RADIUS.xl, padding: SPACING.lg, minHeight: 130 },
    fallbackBannerContent: { flexDirection: 'row', alignItems: 'center' },
    fallbackBannerTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.textWhite, marginBottom: SPACING.sm },
    fallbackBannerCta: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
    fallbackBannerCtaText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.textWhite, marginRight: 4 },
    fallbackBannerIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: SPACING.md },

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
    courseThumbnail: { height: 120, width: '100%' },
    courseThumbnailFallback: { justifyContent: 'center', alignItems: 'center' },
    courseInfo: { padding: SPACING.md },
    categoryBadge: { backgroundColor: COLORS.primaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.xs, alignSelf: 'flex-start', marginBottom: 6 },
    categoryText: { fontSize: 10, fontWeight: FONTS.weights.bold, color: COLORS.primary, textTransform: 'uppercase' },
    courseTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 6, lineHeight: 20 },
    courseMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    courseMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginLeft: 3 },
    priceLabel: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    originalPrice: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, textDecorationLine: 'line-through', marginLeft: 6 },
    freeLabel: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.success },

    // Promo Banner Strip
    promoContainer: { marginHorizontal: SPACING.base, marginVertical: SPACING.md, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.card },
    promoImage: { width: '100%', height: (width - 32) / 3, borderRadius: RADIUS.lg },

    // Study Material Card
    studyCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOWS.card },
    studyIconContainer: { height: 70, borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.sm },
    studyThumbnail: { width: '100%', height: '100%' },
    studyIconGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    studyTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, lineHeight: 18, marginBottom: 4 },
    studySubject: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    studyMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    studyMetaBadge: { backgroundColor: COLORS.primaryBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.xs },
    studyMetaBadgeText: { fontSize: 9, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    studyPrice: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    studyFree: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.success },

    // Testimonial Card
    testimonialCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.card, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
    testimonialHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    testimonialAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    testimonialAvatarText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    testimonialName: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
    testimonialRole: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
    testimonialStars: { flexDirection: 'row', marginBottom: SPACING.sm },
    testimonialContent: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20, fontStyle: 'italic' },

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
});
