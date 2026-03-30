// Current Affairs Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { GradientHeader, SearchBar, LoadingSkeleton, EmptyState } from '../../components/SharedComponents';
import { currentAffairsAPI } from '../../services/api';

export default function CurrentAffairsScreen({ navigation }: any) {
    const [affairs, setAffairs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        try {
            const res = await currentAffairsAPI.getAll();
            setAffairs(res.data?.data || res.data?.currentAffairs || []);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);
    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
    const filtered = affairs.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));

    const renderItem = ({ item, index }: any) => (
        <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
            <TouchableOpacity
                onPress={() => navigation.navigate('CurrentAffairDetail', { id: item.id })}
                style={s.card} activeOpacity={0.9}
            >
                <View style={s.cardLeft}>
                    <View style={[s.importanceDot, {
                        backgroundColor: item.importance === 'high' ? COLORS.error :
                            item.importance === 'medium' ? COLORS.warning : COLORS.success
                    }]} />
                </View>
                <View style={s.cardContent}>
                    <View style={s.categoryBadge}><Text style={s.categoryText}>{item.category}</Text></View>
                    <Text style={s.title} numberOfLines={2}>{item.title}</Text>
                    {item.summary && <Text style={s.summary} numberOfLines={2}>{item.summary}</Text>}
                    <Text style={s.date}>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <GradientHeader title="Current Affairs" subtitle="Stay informed, stay ahead" />
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search current affairs..." />
            {loading ? <LoadingSkeleton count={5} /> : filtered.length === 0 ? (
                <EmptyState icon="newspaper-outline" title="No Articles" message="Check back later" />
            ) : (
                <FlatList data={filtered} renderItem={renderItem}
                    keyExtractor={item => item.id?.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: SPACING.sm, paddingBottom: 100 }}
                />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 14, ...SHADOWS.md },
    cardLeft: { marginRight: 12 },
    importanceDot: { width: 8, height: 8, borderRadius: 4 },
    cardContent: { flex: 1 },
    categoryBadge: { backgroundColor: COLORS.primaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 4 },
    categoryText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
    title: { fontSize: 14, fontWeight: '600', color: COLORS.text, lineHeight: 20, marginBottom: 2 },
    summary: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 4 },
    date: { fontSize: 11, color: COLORS.textLight },
});
