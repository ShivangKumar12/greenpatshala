// Shared UI Components - Reusable across all screens
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    FadeInDown,
    FadeInUp,
    SlideInRight,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme/theme';

// ============================================
// GRADIENT HEADER
// ============================================
interface GradientHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightElement?: React.ReactNode;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({
    title,
    subtitle,
    showBack,
    onBack,
    rightElement,
}) => (
    <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
    >
        <View style={styles.headerRow}>
            {showBack && (
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
                </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>{title}</Text>
                {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement}
        </View>
    </LinearGradient>
);

// ============================================
// ANIMATED BUTTON
// ============================================
interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'outline' | 'ghost';
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    title,
    onPress,
    loading,
    disabled,
    variant = 'primary',
    icon,
    style,
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.8}
                style={[
                    styles.btn,
                    isPrimary && styles.btnPrimary,
                    isOutline && styles.btnOutline,
                    variant === 'ghost' && styles.btnGhost,
                    disabled && styles.btnDisabled,
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={isPrimary ? COLORS.textWhite : COLORS.primary} />
                ) : (
                    <View style={styles.btnContent}>
                        {icon && (
                            <Ionicons
                                name={icon}
                                size={20}
                                color={isPrimary ? COLORS.textWhite : COLORS.primary}
                                style={{ marginRight: 8 }}
                            />
                        )}
                        <Text
                            style={[
                                styles.btnText,
                                isPrimary && styles.btnTextPrimary,
                                isOutline && styles.btnTextOutline,
                                variant === 'ghost' && styles.btnTextGhost,
                            ]}
                        >
                            {title}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================
// STAT CARD
// ============================================
interface StatCardProps {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
    index?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color = COLORS.primary,
    index = 0,
}) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
    </Animated.View>
);

// ============================================
// SEARCH BAR
// ============================================
interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeText,
    placeholder = 'Search...',
}) => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchInput}
        />
        {value.length > 0 && (
            <TouchableOpacity onPress={() => onChangeText('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
        )}
    </Animated.View>
);

// ============================================
// LOADING SKELETON
// ============================================
export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <View style={styles.skeletonContainer}>
        {Array.from({ length: count }).map((_, i) => (
            <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 80)}
                style={styles.skeletonCard}
            >
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonContent}>
                    <View style={[styles.skeletonLine, { width: '80%' }]} />
                    <View style={[styles.skeletonLine, { width: '60%' }]} />
                    <View style={[styles.skeletonLine, { width: '40%' }]} />
                </View>
            </Animated.View>
        ))}
    </View>
);

// ============================================
// EMPTY STATE
// ============================================
interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    message,
    actionText,
    onAction,
}) => (
    <Animated.View entering={FadeInUp.springify()} style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
            <Ionicons name={icon} size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
        {actionText && onAction && (
            <AnimatedButton title={actionText} onPress={onAction} style={{ marginTop: 16 }} />
        )}
    </Animated.View>
);

// ============================================
// COURSE CARD
// ============================================
interface CourseCardProps {
    course: any;
    onPress: () => void;
    index?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress, index = 0 }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={animStyle}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={() => { scale.value = withSpring(0.97); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                activeOpacity={0.9}
                style={styles.courseCard}
            >
                <View style={styles.courseThumbnail}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.accent]}
                        style={styles.courseThumbnailGradient}
                    >
                        <Ionicons name="book" size={32} color={COLORS.textWhite} />
                    </LinearGradient>
                </View>
                <View style={styles.courseInfo}>
                    <View style={styles.courseCategoryBadge}>
                        <Text style={styles.courseCategoryText}>{course.category}</Text>
                    </View>
                    <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                    <View style={styles.courseMetaRow}>
                        <View style={styles.courseMeta}>
                            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                            <Text style={styles.courseMetaText}>{course.duration}</Text>
                        </View>
                        <View style={styles.courseMeta}>
                            <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
                            <Text style={styles.courseMetaText}>{course.totalStudents || 0}</Text>
                        </View>
                    </View>
                    <View style={styles.coursePriceRow}>
                        {course.isFree ? (
                            <Text style={styles.courseFree}>FREE</Text>
                        ) : (
                            <>
                                <Text style={styles.coursePrice}>₹{course.discountPrice || course.originalPrice}</Text>
                                {course.discountPrice && (
                                    <Text style={styles.courseOriginalPrice}>₹{course.originalPrice}</Text>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================
// QUIZ CARD
// ============================================
interface QuizCardProps {
    quiz: any;
    onPress: () => void;
    index?: number;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onPress, index = 0 }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const difficultyColor =
        quiz.difficulty === 'easy' ? COLORS.success :
            quiz.difficulty === 'hard' ? COLORS.error : COLORS.warning;

    return (
        <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={animStyle}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={() => { scale.value = withSpring(0.97); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                activeOpacity={0.9}
                style={styles.quizCard}
            >
                <View style={styles.quizHeader}>
                    <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '18' }]}>
                        <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                            {quiz.difficulty?.toUpperCase()}
                        </Text>
                    </View>
                    {quiz.isFree ? (
                        <Text style={styles.courseFree}>FREE</Text>
                    ) : (
                        <Text style={styles.coursePrice}>₹{quiz.discount_price || quiz.price}</Text>
                    )}
                </View>
                <Text style={styles.quizTitle} numberOfLines={2}>{quiz.title}</Text>
                <View style={styles.quizMeta}>
                    <View style={styles.courseMeta}>
                        <Ionicons name="help-circle-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.courseMetaText}>{quiz.total_marks} marks</Text>
                    </View>
                    <View style={styles.courseMeta}>
                        <Ionicons name="timer-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.courseMetaText}>{quiz.duration} min</Text>
                    </View>
                    <View style={styles.courseMeta}>
                        <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.courseMetaText}>{quiz.total_students || 0}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================
// JOB CARD
// ============================================
interface JobCardProps {
    job: any;
    onPress: () => void;
    index?: number;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress, index = 0 }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={animStyle}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={() => { scale.value = withSpring(0.97); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                activeOpacity={0.9}
                style={styles.jobCard}
            >
                <View style={styles.jobIconContainer}>
                    <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.jobIcon}>
                        <Ionicons name="briefcase" size={20} color={COLORS.textWhite} />
                    </LinearGradient>
                </View>
                <View style={styles.jobContent}>
                    <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                    <Text style={styles.jobOrg}>{job.organization}</Text>
                    <View style={styles.jobMetaRow}>
                        {job.location && (
                            <View style={styles.jobMetaItem}>
                                <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
                                <Text style={styles.jobMetaText}>{job.location}</Text>
                            </View>
                        )}
                        {job.salary && (
                            <View style={styles.jobMetaItem}>
                                <Ionicons name="cash-outline" size={12} color={COLORS.textSecondary} />
                                <Text style={styles.jobMetaText}>{job.salary}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================
// MATERIAL CARD
// ============================================
interface MaterialCardProps {
    material: any;
    onPress: () => void;
    index?: number;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onPress, index = 0 }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const getFileIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        switch (type?.toLowerCase()) {
            case 'pdf': return 'document-text';
            case 'video': return 'videocam';
            case 'image': return 'image';
            default: return 'document';
        }
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={animStyle}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={() => { scale.value = withSpring(0.97); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                activeOpacity={0.9}
                style={styles.materialCard}
            >
                <View style={[styles.materialIcon, { backgroundColor: COLORS.primaryBg }]}>
                    <Ionicons name={getFileIcon(material.fileType)} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.materialContent}>
                    <Text style={styles.materialTitle} numberOfLines={2}>{material.title}</Text>
                    <Text style={styles.materialSubject}>{material.subject} • {material.category}</Text>
                    <View style={styles.materialMeta}>
                        <Ionicons name="download-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.materialMetaText}>{material.downloads} downloads</Text>
                    </View>
                </View>
                {material.isPaid ? (
                    <Text style={styles.coursePrice}>₹{material.discountPrice || material.price}</Text>
                ) : (
                    <Text style={styles.courseFree}>FREE</Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
    // Gradient Header
    gradientHeader: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: SPACING.base,
        borderBottomLeftRadius: RADIUS.xl,
        borderBottomRightRadius: RADIUS.xl,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    headerTitle: {
        fontSize: FONTS.sizes['2xl'],
        fontWeight: FONTS.weights.bold,
        color: COLORS.textWhite,
    },
    headerSubtitle: {
        fontSize: FONTS.sizes.md,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },

    // Button styles
    btn: {
        height: 52,
        borderRadius: RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    btnPrimary: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.green,
    },
    btnOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    btnGhost: {
        backgroundColor: 'transparent',
    },
    btnDisabled: {
        opacity: 0.5,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnText: {
        fontSize: FONTS.sizes.base,
        fontWeight: FONTS.weights.semibold,
    },
    btnTextPrimary: {
        color: COLORS.textWhite,
    },
    btnTextOutline: {
        color: COLORS.primary,
    },
    btnTextGhost: {
        color: COLORS.primary,
    },

    // Stat Card
    statCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.base,
        alignItems: 'center',
        marginHorizontal: SPACING.xs,
        ...SHADOWS.md,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    statValue: {
        fontSize: FONTS.sizes.xl,
        fontWeight: FONTS.weights.bold,
        color: COLORS.text,
    },
    statTitle: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textSecondary,
        marginTop: 2,
        textAlign: 'center',
    },

    // Search Bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.base,
        height: 48,
        marginHorizontal: SPACING.base,
        marginVertical: SPACING.sm,
        ...SHADOWS.sm,
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: FONTS.sizes.md,
        color: COLORS.text,
    },

    // Skeleton
    skeletonContainer: {
        padding: SPACING.base,
    },
    skeletonCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    skeletonImage: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.borderLight,
    },
    skeletonContent: {
        flex: 1,
        marginLeft: SPACING.md,
        justifyContent: 'center',
    },
    skeletonLine: {
        height: 12,
        backgroundColor: COLORS.borderLight,
        borderRadius: RADIUS.xs,
        marginBottom: SPACING.sm,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING['2xl'],
    },
    emptyIcon: {
        width: 96,
        height: 96,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        fontSize: FONTS.sizes.lg,
        fontWeight: FONTS.weights.bold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    emptyMessage: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },

    // Course Card
    courseCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        marginHorizontal: SPACING.base,
        marginBottom: SPACING.md,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    courseThumbnail: {
        height: 140,
        overflow: 'hidden',
    },
    courseThumbnailGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseInfo: {
        padding: SPACING.base,
    },
    courseCategoryBadge: {
        backgroundColor: COLORS.primaryBg,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: RADIUS.xs,
        alignSelf: 'flex-start',
        marginBottom: SPACING.sm,
    },
    courseCategoryText: {
        fontSize: FONTS.sizes.xs,
        fontWeight: FONTS.weights.semibold,
        color: COLORS.primary,
        textTransform: 'uppercase',
    },
    courseTitle: {
        fontSize: FONTS.sizes.base,
        fontWeight: FONTS.weights.bold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
        lineHeight: 22,
    },
    courseMetaRow: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
    },
    courseMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.base,
    },
    courseMetaText: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    coursePriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coursePrice: {
        fontSize: FONTS.sizes.lg,
        fontWeight: FONTS.weights.bold,
        color: COLORS.primary,
    },
    courseOriginalPrice: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textLight,
        textDecorationLine: 'line-through',
        marginLeft: SPACING.sm,
    },
    courseFree: {
        fontSize: FONTS.sizes.md,
        fontWeight: FONTS.weights.bold,
        color: COLORS.success,
    },

    // Quiz Card
    quizCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.base,
        marginHorizontal: SPACING.base,
        marginBottom: SPACING.md,
        ...SHADOWS.md,
    },
    quizHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    difficultyBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: RADIUS.xs,
    },
    difficultyText: {
        fontSize: FONTS.sizes.xs,
        fontWeight: FONTS.weights.bold,
    },
    quizTitle: {
        fontSize: FONTS.sizes.base,
        fontWeight: FONTS.weights.bold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
        lineHeight: 22,
    },
    quizMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    // Job Card
    jobCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.base,
        marginHorizontal: SPACING.base,
        marginBottom: SPACING.md,
        ...SHADOWS.md,
    },
    jobIconContainer: {
        marginRight: SPACING.md,
    },
    jobIcon: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    jobContent: {
        flex: 1,
    },
    jobTitle: {
        fontSize: FONTS.sizes.md,
        fontWeight: FONTS.weights.bold,
        color: COLORS.text,
        marginBottom: 2,
    },
    jobOrg: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    jobMetaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    jobMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    jobMetaText: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textSecondary,
        marginLeft: 3,
    },

    // Material Card
    materialCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.base,
        marginHorizontal: SPACING.base,
        marginBottom: SPACING.md,
        ...SHADOWS.md,
    },
    materialIcon: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    materialContent: {
        flex: 1,
    },
    materialTitle: {
        fontSize: FONTS.sizes.md,
        fontWeight: FONTS.weights.bold,
        color: COLORS.text,
        marginBottom: 2,
    },
    materialSubject: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    materialMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    materialMetaText: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
});
