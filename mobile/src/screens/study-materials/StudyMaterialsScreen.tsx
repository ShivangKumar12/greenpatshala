// Study Materials Screen - Full web parity
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { studyMaterialsAPI } from '../../services/api';

const categories = ['All', 'UPSC', 'SSC', 'Banking', 'Railways', 'State PSC'];
const priceFilters = ['All', 'Free', 'Paid'];

export default function StudyMaterialsScreen({ navigation }: any) {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('All');
    const [selectedPrice, setSelectedPrice] = useState('All');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = { page: 1, limit: 20 };
            if (selectedCat !== 'All') params.category = selectedCat;
            if (selectedPrice === 'Free') params.isFree = true;
            if (selectedPrice === 'Paid') params.isPaid = true;
            if (search.trim()) params.search = search.trim();
            const res = await studyMaterialsAPI.getAll(params);
            setMaterials(res.data?.items || res.data?.materials || res.data?.data || []);
        } catch (err) { console.log('Materials error:', err); }
        finally { setLoading(false); }
    }, [selectedCat, selectedPrice, search]);

    useEffect(() => { load(); }, [selectedCat, selectedPrice]);
    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const getIcon = (type: string) => type === 'pdf' ? 'document-text' : type === 'video' ? 'videocam' : 'document';

    return (
        <View style={s.container}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.header}>
                <Text style={s.headerTitle}>Study Materials</Text>
                <Text style={s.headerSub}>{materials.length} resources available</Text>
            </LinearGradient>

            <View style={s.searchRow}>
                <Ionicons name="search" size={18} color={COLORS.textLight} />
                <TextInput value={search} onChangeText={setSearch} placeholder="Search materials..." placeholderTextColor={COLORS.placeholder} style={s.searchInput} onSubmitEditing={load} returnKeyType="search" />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 42 }} contentContainerStyle={s.chipRow}>
                {categories.map(c => (
                    <TouchableOpacity key={c} style={[s.chip, selectedCat === c && s.chipActive]} onPress={() => setSelectedCat(c)}>
                        <Text style={[s.chipText, selectedCat === c && s.chipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={s.priceRow}>
                {priceFilters.map(p => (
                    <TouchableOpacity key={p} style={[s.miniChip, selectedPrice === p && s.miniChipActive]} onPress={() => setSelectedPrice(p)}>
                        <Text style={[s.miniChipText, selectedPrice === p && s.miniChipTextActive]}>{p}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View> : (
                <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />} contentContainerStyle={s.list}>
                    {materials.map((m, i) => (
                        <Animated.View key={m.id} entering={FadeInDown.delay(i * 40)}>
                            <TouchableOpacity style={s.card} onPress={() => navigation.navigate('MaterialDetail', { id: m.id })} activeOpacity={0.9}>
                                <View style={s.cardIcon}><Ionicons name={getIcon(m.fileType) as any} size={22} color={COLORS.primary} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.cardTitle} numberOfLines={2}>{m.title}</Text>
                                    <Text style={s.cardMeta}>{m.subject} • {m.category}</Text>
                                    <View style={s.cardBottom}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="download-outline" size={12} color={COLORS.textSecondary} /><Text style={s.dl}>{m.downloads || 0}</Text></View>
                                        {m.isPaid && m.price > 0 ? <Text style={s.price}>₹{m.discountPrice || m.price}</Text> : <Text style={s.free}>FREE</Text>}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                    {materials.length === 0 && <View style={s.empty}><Ionicons name="document-outline" size={48} color={COLORS.textLight} /><Text style={s.emptyTitle}>No Materials Found</Text></View>}
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
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.textSecondary },
    chipTextActive: { color: COLORS.textWhite },
    priceRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, marginTop: SPACING.sm },
    miniChip: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
    miniChipActive: { backgroundColor: COLORS.primaryBg, borderColor: COLORS.primary },
    miniChipText: { fontSize: 11, color: COLORS.textSecondary },
    miniChipTextActive: { color: COLORS.primary, fontWeight: FONTS.weights.semibold },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: SPACING.base, paddingTop: SPACING.sm },
    card: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm },
    cardIcon: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    cardTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 4, lineHeight: 20 },
    cardMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginBottom: 6 },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dl: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginLeft: 4 },
    price: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    free: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.success },
    empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
    emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: SPACING.md },
});
