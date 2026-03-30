// Quizzes Listing Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme/theme';
import { GradientHeader, QuizCard, SearchBar, LoadingSkeleton, EmptyState } from '../../components/SharedComponents';
import { quizzesAPI } from '../../services/api';

export default function QuizzesScreen({ navigation }: any) {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');

    const difficulties = ['All', 'easy', 'medium', 'hard'];

    const loadQuizzes = useCallback(async () => {
        try {
            const res = await quizzesAPI.getAll();
            setQuizzes(res.data?.quizzes || res.data?.data || []);
        } catch (err) { console.log('Quizzes error:', err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadQuizzes(); }, [loadQuizzes]);

    const onRefresh = async () => { setRefreshing(true); await loadQuizzes(); setRefreshing(false); };

    const filtered = quizzes.filter(q => {
        const matchSearch = q.title?.toLowerCase().includes(search.toLowerCase());
        const matchDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
        return matchSearch && matchDiff;
    });

    return (
        <View style={styles.container}>
            <GradientHeader title="Quizzes" subtitle={`${quizzes.length} quizzes available`} />
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search quizzes..." />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
                {difficulties.map(d => (
                    <TouchableOpacity
                        key={d}
                        onPress={() => setSelectedDifficulty(d)}
                        style={[styles.filterTab, selectedDifficulty === d && styles.filterTabActive]}
                    >
                        <Text style={[styles.filterTabText, selectedDifficulty === d && styles.filterTabTextActive]}>
                            {d === 'All' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? <LoadingSkeleton count={4} /> : filtered.length === 0 ? (
                <EmptyState icon="help-circle-outline" title="No Quizzes Found" message="Try adjusting your search or filters" />
            ) : (
                <FlatList
                    data={filtered}
                    renderItem={({ item, index }) => (
                        <QuizCard quiz={item} onPress={() => navigation.navigate('QuizDetail', { id: item.id })} index={index} />
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
    filterTabs: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm },
    filterTab: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
    filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterTabText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.textSecondary },
    filterTabTextActive: { color: COLORS.textWhite },
});
