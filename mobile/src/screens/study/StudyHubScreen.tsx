// Study Hub Screen - Combined Study Materials + Current Affairs
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { studyMaterialsAPI, currentAffairsAPI } from '../../services/api';

const matCats = ['All', 'UPSC', 'SSC', 'Banking', 'Railways', 'State PSC'];
const affCats = ['All', 'National', 'International Relations', 'Economy', 'Science & Technology', 'Sports'];

export default function StudyHubScreen({ navigation }: any) {
    const [tab, setTab] = useState<'materials' | 'affairs'>('materials');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [materials, setMaterials] = useState<any[]>([]);
    const [affairs, setAffairs] = useState<any[]>([]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = { page: 1, limit: 20 };
            if (category !== 'All') params.category = category;
            if (search.trim()) params.search = search.trim();

            if (tab === 'materials') {
                const res = await studyMaterialsAPI.getAll(params);
                setMaterials(res.data?.items || res.data?.materials || []);
            } else {
                const res = await currentAffairsAPI.getAll(params);
                setAffairs(res.data?.items || res.data?.data || []);
            }
        } catch (err) { console.log('StudyHub error:', err); }
        finally { setLoading(false); }
    }, [tab, category, search]);

    useEffect(() => { setCategory('All'); setSearch(''); }, [tab]);
    useEffect(() => { load(); }, [category, tab]);

    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
    const cats = tab === 'materials' ? matCats : affCats;

    const getFileIcon = (t: string) => {
        if (t === 'pdf') return 'document-text';
        if (t === 'video') return 'videocam';
        return 'document';
    };

    return (
        <View style={s.container}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.header}>
                <Text style={s.headerTitle}>Study Hub</Text>
                <Text style={s.headerSub}>Study materials & current affairs</Text>
            </LinearGradient>

            <View style={s.tabBar}>
                {(['materials', 'affairs'] as const).map(t => (
                    <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
                        <Ionicons name={t === 'materials' ? 'document-text' : 'newspaper'} size={15} color={tab === t ? COLORS.primary : COLORS.textSecondary} />
                        <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t === 'materials' ? 'Materials' : 'Affairs'}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={s.searchRow}>
                <Ionicons name="search" size={18} color={COLORS.textLight} />
                <TextInput value={search} onChangeText={setSearch} placeholder="Search..." placeholderTextColor={COLORS.placeholder} style={s.searchInput} onSubmitEditing={load} returnKeyType="search" />
                {search.length > 0 && <TouchableOpacity onPress={() => { setSearch(''); load(); }}><Ionicons name="close-circle" size={18} color={COLORS.textLight} /></TouchableOpacity>}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 42 }} contentContainerStyle={s.chipRow}>
                {cats.map(c => (
                    <TouchableOpacity key={c} style={[s.chip, category === c && s.chipActive]} onPress={() => setCategory(c)}>
                        <Text style={[s.chipText, category === c && s.chipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />} contentContainerStyle={s.list}>
                    {tab === 'materials' ? materials.map((m, i) => (
                        <Animated.View key={m.id} entering={FadeInDown.delay(i * 40)}>
                            <TouchableOpacity style={s.matCard} onPress={() => navigation.navigate('MaterialDetail', { id: m.id })} activeOpacity={0.9}>
                                <View style={s.matIcon}><Ionicons name={getFileIcon(m.fileType) as any} size={22} color={COLORS.primary} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.matTitle} numberOfLines={2}>{m.title}</Text>
                                    <Text style={s.matMeta}>{m.subject} • {m.category}</Text>
                                    <View style={s.matBottom}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="download-outline" size={12} color={COLORS.textSecondary} /><Text style={s.matDl}>{m.downloads || 0}</Text></View>
                                        {m.isPaid && m.price > 0 ? <Text style={s.matPrice}>₹{m.discountPrice || m.price}</Text> : <Text style={s.matFree}>FREE</Text>}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    )) : affairs.map((a, i) => (
                        <Animated.View key={a.id} entering={FadeInDown.delay(i * 40)}>
                            <TouchableOpacity style={s.affCard} onPress={() => navigation.navigate('CurrentAffairDetail', { id: a.id })} activeOpacity={0.9}>
                                <View style={s.affHead}><View style={s.affCat}><Text style={s.affCatT}>{a.category}</Text></View><Text style={s.affDate}>{new Date(a.date || a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text></View>
                                <Text style={s.affTitle} numberOfLines={2}>{a.title}</Text>
                                <Text style={s.affSum} numberOfLines={2}>{a.summary || a.content?.substring(0, 120)}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                    {((tab === 'materials' && !materials.length) || (tab === 'affairs' && !affairs.length)) && (
                        <View style={s.empty}><Ionicons name="search" size={48} color={COLORS.textLight} /><Text style={s.emptyT}>Nothing Found</Text></View>
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
    tabBar: { flexDirection: 'row', marginHorizontal: SPACING.base, marginTop: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 4, ...SHADOWS.sm },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: RADIUS.md },
    tabActive: { backgroundColor: COLORS.primaryBg },
    tabText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.textSecondary, marginLeft: 6 },
    tabTextActive: { color: COLORS.primary, fontWeight: FONTS.weights.semibold },
    searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, height: 44, marginHorizontal: SPACING.base, marginTop: SPACING.md, ...SHADOWS.sm },
    searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, marginLeft: SPACING.sm },
    chipRow: { paddingHorizontal: SPACING.base, gap: SPACING.sm, marginTop: SPACING.sm },
    chip: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.textSecondary },
    chipTextActive: { color: COLORS.textWhite },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: SPACING.base, paddingTop: SPACING.sm },
    matCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm },
    matIcon: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    matTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 4, lineHeight: 20 },
    matMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginBottom: 6 },
    matBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    matDl: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginLeft: 4 },
    matPrice: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.primary },
    matFree: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.success },
    affCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOWS.card },
    affHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    affCat: { backgroundColor: COLORS.primaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.xs },
    affCatT: { fontSize: 10, fontWeight: FONTS.weights.bold, color: COLORS.primary, textTransform: 'uppercase' },
    affDate: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
    affTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 4, lineHeight: 22 },
    affSum: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 18 },
    empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
    emptyT: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: SPACING.md },
});
