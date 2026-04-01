// Current Affairs Screen - Full web parity with categories
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { currentAffairsAPI } from '../../services/api';

const categories = ['All', 'National', 'International Relations', 'Economy', 'Science & Technology', 'Sports', 'Environment'];

export default function CurrentAffairsScreen({ navigation }: any) {
    const [affairs, setAffairs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('All');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = { page: 1, limit: 20 };
            if (selectedCat !== 'All') params.category = selectedCat;
            if (search.trim()) params.search = search.trim();
            const res = await currentAffairsAPI.getAll(params);
            setAffairs(res.data?.items || res.data?.data || res.data?.currentAffairs || []);
        } catch (err) { console.log('Affairs error:', err); }
        finally { setLoading(false); }
    }, [selectedCat, search]);

    useEffect(() => { load(); }, [selectedCat]);
    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    return (
        <View style={s.container}>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={s.header}>
                <Text style={s.headerTitle}>Current Affairs</Text>
                <Text style={s.headerSub}>Stay updated for your exams</Text>
            </LinearGradient>

            <View style={s.searchRow}>
                <Ionicons name="search" size={18} color={COLORS.textLight} />
                <TextInput value={search} onChangeText={setSearch} placeholder="Search articles..." placeholderTextColor={COLORS.placeholder} style={s.searchInput} onSubmitEditing={load} returnKeyType="search" />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 42 }} contentContainerStyle={s.chipRow}>
                {categories.map(c => (
                    <TouchableOpacity key={c} style={[s.chip, selectedCat === c && s.chipActive]} onPress={() => setSelectedCat(c)}>
                        <Text style={[s.chipText, selectedCat === c && s.chipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View> : (
                <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />} contentContainerStyle={s.list}>
                    {affairs.map((a, i) => (
                        <Animated.View key={a.id} entering={FadeInDown.delay(i * 40)}>
                            <TouchableOpacity style={s.card} onPress={() => navigation.navigate('CurrentAffairDetail', { id: a.id })} activeOpacity={0.9}>
                                <View style={s.cardHead}><View style={s.catBadge}><Text style={s.catText}>{a.category}</Text></View><Text style={s.dateText}>{new Date(a.date || a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text></View>
                                <Text style={s.cardTitle} numberOfLines={2}>{a.title}</Text>
                                <Text style={s.cardSummary} numberOfLines={2}>{a.summary || a.content?.substring(0, 120)}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                    {affairs.length === 0 && <View style={s.empty}><Ionicons name="newspaper-outline" size={48} color={COLORS.textLight} /><Text style={s.emptyTitle}>No Articles Found</Text></View>}
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
    searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, height: 44, marginHorizontal: SPACING.base, marginTop: SPACING.md, ...SHADOWS.sm },
    searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, marginLeft: SPACING.sm },
    chipRow: { paddingHorizontal: SPACING.base, gap: SPACING.sm, marginTop: SPACING.sm },
    chip: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
    chipActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
    chipText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.textSecondary },
    chipTextActive: { color: COLORS.textWhite },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: SPACING.base, paddingTop: SPACING.sm },
    card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOWS.card },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    catBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.xs },
    catText: { fontSize: 10, fontWeight: FONTS.weights.bold, color: '#7C3AED', textTransform: 'uppercase' },
    dateText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
    cardTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 4, lineHeight: 22 },
    cardSummary: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 18 },
    empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
    emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: SPACING.md },
});
