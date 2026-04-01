// Courses Screen - Full web parity with search, filters, categories
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, TextInput, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { coursesAPI } from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_W = (width - SPACING.base * 2 - SPACING.md) / 2;

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const prices = ['All', 'Free', 'Paid'];
const sortOptions = ['Popular', 'Newest', 'Price Low', 'Price High', 'Rating'];

export default function CoursesScreen({ navigation }: any) {
    const [courses, setCourses] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('All');
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [selectedPrice, setSelectedPrice] = useState('All');
    const [selectedSort, setSelectedSort] = useState('Popular');
    const [showFilters, setShowFilters] = useState(false);
    const [viewGrid, setViewGrid] = useState(true);

    const loadCourses = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (search.trim()) params.search = search.trim();
            if (selectedCat !== 'All') params.category = selectedCat;
            if (selectedLevel !== 'All') params.level = selectedLevel.toLowerCase();
            if (selectedPrice === 'Free') params.isFree = true;
            if (selectedPrice === 'Paid') params.isPaid = true;
            params.sort = selectedSort === 'Newest' ? 'createdAt' : selectedSort === 'Rating' ? 'rating' : selectedSort === 'Price Low' ? 'price_asc' : selectedSort === 'Price High' ? 'price_desc' : 'popular';

            const res = await coursesAPI.getAll(params);
            setCourses(res.data?.courses || res.data?.data || []);
        } catch (err) { console.log('Courses error:', err); }
        finally { setLoading(false); }
    }, [search, selectedCat, selectedLevel, selectedPrice, selectedSort]);

    const loadCategories = useCallback(async () => {
        try {
            const res = await coursesAPI.getCategories();
            const cats = res.data?.categories || res.data?.data || [];
            setCategories(['All', ...cats.map((c: any) => typeof c === 'string' ? c : c.name)]);
        } catch (err) { setCategories(['All']); }
    }, []);

    useEffect(() => { loadCategories(); }, []);
    useEffect(() => { loadCourses(); }, [selectedCat, selectedLevel, selectedPrice, selectedSort]);

    const onRefresh = async () => { setRefreshing(true); await loadCourses(); setRefreshing(false); };

    const CourseCard = ({ course, index }: { course: any; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 60)} style={viewGrid ? { width: CARD_W } : undefined}>
            <TouchableOpacity
                style={viewGrid ? s.gridCard : s.listCard}
                onPress={() => navigation.navigate('CourseDetail', { id: course.id })}
                activeOpacity={0.9}
            >
                <LinearGradient colors={COLORS.gradientAccent} style={viewGrid ? s.gridThumb : s.listThumb}>
                    <Ionicons name="book" size={viewGrid ? 28 : 22} color={COLORS.textWhite} />
                </LinearGradient>
                <View style={viewGrid ? s.gridInfo : s.listInfo}>
                    <View style={s.catBadge}><Text style={s.catText}>{course.category || 'General'}</Text></View>
                    <Text style={viewGrid ? s.gridTitle : s.listTitle} numberOfLines={2}>{course.title}</Text>
                    <View style={s.metaRow}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={s.metaText}>{course.rating || 0}</Text>
                        <Ionicons name="people-outline" size={12} color={COLORS.textSecondary} style={{ marginLeft: 8 }} />
                        <Text style={s.metaText}>{course.totalStudents || 0}</Text>
                    </View>
                    {course.isFree || (!course.originalPrice && !course.price) ? (
                        <Text style={s.freeLabel}>FREE</Text>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={s.price}>₹{course.discountPrice || course.originalPrice || course.price}</Text>
                            {course.discountPrice && course.originalPrice && (
                                <Text style={s.origPrice}>₹{course.originalPrice}</Text>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={s.container}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.header}>
                <Animated.View entering={FadeInDown.delay(100)}>
                    <Text style={s.headerTitle}>Courses</Text>
                    <Text style={s.headerSub}>{courses.length} courses available</Text>
                </Animated.View>
            </LinearGradient>

            {/* Search */}
            <View style={s.searchRow}>
                <View style={s.searchBar}>
                    <Ionicons name="search" size={18} color={COLORS.textLight} />
                    <TextInput value={search} onChangeText={setSearch} placeholder="Search courses..." placeholderTextColor={COLORS.placeholder} style={s.searchInput} onSubmitEditing={loadCourses} returnKeyType="search" />
                    {search.length > 0 && <TouchableOpacity onPress={() => { setSearch(''); loadCourses(); }}><Ionicons name="close-circle" size={18} color={COLORS.textLight} /></TouchableOpacity>}
                </View>
                <TouchableOpacity style={[s.filterBtn, showFilters && s.filterBtnActive]} onPress={() => setShowFilters(!showFilters)}>
                    <Ionicons name="options" size={20} color={showFilters ? COLORS.textWhite : COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={s.viewBtn} onPress={() => setViewGrid(!viewGrid)}>
                    <Ionicons name={viewGrid ? 'list' : 'grid'} size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 42 }} contentContainerStyle={s.chipRow}>
                {categories.map(cat => (
                    <TouchableOpacity key={cat} style={[s.chip, selectedCat === cat && s.chipActive]} onPress={() => setSelectedCat(cat)}>
                        <Text style={[s.chipText, selectedCat === cat && s.chipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Filters Row */}
            {showFilters && (
                <Animated.View entering={FadeInDown} style={s.filtersRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                        {levels.map(l => (
                            <TouchableOpacity key={l} style={[s.miniChip, selectedLevel === l && s.miniChipActive]} onPress={() => setSelectedLevel(l)}>
                                <Text style={[s.miniChipText, selectedLevel === l && s.miniChipTextActive]}>{l}</Text>
                            </TouchableOpacity>
                        ))}
                        <View style={s.filterDivider} />
                        {prices.map(p => (
                            <TouchableOpacity key={p} style={[s.miniChip, selectedPrice === p && s.miniChipActive]} onPress={() => setSelectedPrice(p)}>
                                <Text style={[s.miniChipText, selectedPrice === p && s.miniChipTextActive]}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                        <View style={s.filterDivider} />
                        {sortOptions.map(so => (
                            <TouchableOpacity key={so} style={[s.miniChip, selectedSort === so && s.miniChipActive]} onPress={() => setSelectedSort(so)}>
                                <Text style={[s.miniChipText, selectedSort === so && s.miniChipTextActive]}>{so}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>
            )}

            {loading ? (
                <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />} contentContainerStyle={s.list}>
                    {viewGrid ? (
                        <View style={s.grid}>
                            {courses.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
                        </View>
                    ) : (
                        courses.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)
                    )}
                    {courses.length === 0 && (
                        <View style={s.empty}><Ionicons name="book-outline" size={48} color={COLORS.textLight} /><Text style={s.emptyTitle}>No Courses Found</Text></View>
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTitle: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    headerSub: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    searchRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, marginTop: SPACING.md, gap: SPACING.sm },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, height: 44, ...SHADOWS.sm },
    searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, marginLeft: SPACING.sm },
    filterBtn: { width: 44, height: 44, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm },
    filterBtnActive: { backgroundColor: COLORS.primary },
    viewBtn: { width: 44, height: 44, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm },
    chipRow: { paddingHorizontal: SPACING.base, gap: SPACING.sm, marginTop: SPACING.sm },
    chip: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.textSecondary },
    chipTextActive: { color: COLORS.textWhite },
    filtersRow: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm },
    miniChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
    miniChipActive: { backgroundColor: COLORS.primaryBg, borderColor: COLORS.primary },
    miniChipText: { fontSize: 11, color: COLORS.textSecondary },
    miniChipTextActive: { color: COLORS.primary, fontWeight: FONTS.weights.semibold },
    filterDivider: { width: 1, height: 20, backgroundColor: COLORS.border, alignSelf: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
    gridCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.card, marginBottom: SPACING.md },
    gridThumb: { height: 80, justifyContent: 'center', alignItems: 'center' },
    gridInfo: { padding: SPACING.sm },
    gridTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: 4, marginBottom: 4, lineHeight: 18 },
    listCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.sm, marginBottom: SPACING.sm },
    listThumb: { width: 80, justifyContent: 'center', alignItems: 'center' },
    listInfo: { flex: 1, padding: SPACING.md },
    listTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: 4, marginBottom: 4, lineHeight: 20 },
    catBadge: { backgroundColor: COLORS.primaryBg, paddingHorizontal: 6, paddingVertical: 1, borderRadius: RADIUS.xs, alignSelf: 'flex-start' },
    catText: { fontSize: 9, fontWeight: FONTS.weights.bold, color: COLORS.primary, textTransform: 'uppercase' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    metaText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginLeft: 3 },
    price: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    origPrice: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, textDecorationLine: 'line-through', marginLeft: 6 },
    freeLabel: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.success },
    empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
    emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: SPACING.md },
});
