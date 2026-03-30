// Courses Listing Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import { GradientHeader, CourseCard, SearchBar, LoadingSkeleton, EmptyState } from '../../components/SharedComponents';
import { coursesAPI } from '../../services/api';

export default function CoursesScreen({ navigation }: any) {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const loadCourses = useCallback(async () => {
        try {
            const [coursesRes, catRes] = await Promise.allSettled([
                coursesAPI.getAll(),
                coursesAPI.getCategories(),
            ]);
            if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data?.courses || coursesRes.value.data?.data || []);
            if (catRes.status === 'fulfilled') {
                const cats = catRes.value.data?.categories || catRes.value.data?.data || [];
                setCategories(['All', ...cats.map((c: any) => c.name || c)]);
            }
        } catch (err) { console.log('Courses error:', err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadCourses(); }, [loadCourses]);

    const onRefresh = async () => { setRefreshing(true); await loadCourses(); setRefreshing(false); };

    const filteredCourses = courses.filter(c => {
        const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
        const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
        return matchSearch && matchCat;
    });

    return (
        <View style={styles.container}>
            <GradientHeader title="Courses" subtitle={`${courses.length} courses available`} />
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search courses..." />

            {/* Category Filter Tabs */}
            {categories.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
                    {categories.map((cat, i) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[styles.categoryTab, selectedCategory === cat && styles.categoryTabActive]}
                        >
                            <Text style={[styles.categoryTabText, selectedCategory === cat && styles.categoryTabTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {loading ? <LoadingSkeleton count={4} /> : filteredCourses.length === 0 ? (
                <EmptyState icon="book-outline" title="No Courses Found" message="Try adjusting your search or filters" />
            ) : (
                <FlatList
                    data={filteredCourses}
                    renderItem={({ item, index }) => (
                        <CourseCard course={item} onPress={() => navigation.navigate('CourseDetail', { id: item.id })} index={index} />
                    )}
                    keyExtractor={(item) => item.id?.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: SPACING.sm, paddingBottom: 100 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    categoryTabs: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm },
    categoryTab: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
    categoryTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    categoryTabText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.textSecondary },
    categoryTabTextActive: { color: COLORS.textWhite },
});
