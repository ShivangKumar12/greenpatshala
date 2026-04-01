// Jobs Screen - Full web parity with search, filters, job cards
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { jobsAPI } from '../../services/api';

export default function JobsScreen({ navigation }: any) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');

    const departments = ['All', 'UPSC', 'SSC', 'Banking', 'Railways', 'Defence', 'State'];

    const loadJobs = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = { status: 'active' };
            if (search.trim()) params.search = search.trim();
            if (selectedDept !== 'All') params.department = selectedDept;
            const res = await jobsAPI.getAll(params);
            setJobs(res.data?.jobs || res.data?.data || []);
        } catch (err) { console.log('Jobs error:', err); }
        finally { setLoading(false); }
    }, [search, selectedDept]);

    useEffect(() => { loadJobs(); }, [selectedDept]);
    const onRefresh = async () => { setRefreshing(true); await loadJobs(); setRefreshing(false); };

    const getDaysLeft = (date: string) => {
        const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    return (
        <View style={s.container}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.header}>
                <Text style={s.headerTitle}>Government Jobs</Text>
                <Text style={s.headerSub}>{jobs.length} active opportunities</Text>
            </LinearGradient>

            <View style={s.searchRow}>
                <Ionicons name="search" size={18} color={COLORS.textLight} />
                <TextInput value={search} onChangeText={setSearch} placeholder="Search jobs..." placeholderTextColor={COLORS.placeholder} style={s.searchInput} onSubmitEditing={loadJobs} returnKeyType="search" />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 42 }} contentContainerStyle={s.chipRow}>
                {departments.map(d => (
                    <TouchableOpacity key={d} style={[s.chip, selectedDept === d && s.chipActive]} onPress={() => setSelectedDept(d)}>
                        <Text style={[s.chipText, selectedDept === d && s.chipTextActive]}>{d}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View> : (
                <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />} contentContainerStyle={s.list}>
                    {jobs.map((job, i) => {
                        const daysLeft = job.lastDate ? getDaysLeft(job.lastDate) : null;
                        return (
                            <Animated.View key={job.id} entering={FadeInDown.delay(i * 50)}>
                                <TouchableOpacity style={s.jobCard} onPress={() => navigation.navigate('JobDetail', { id: job.id })} activeOpacity={0.9}>
                                    <View style={s.jobHeader}>
                                        <LinearGradient colors={COLORS.gradientAccent} style={s.jobIcon}>
                                            <Ionicons name="briefcase" size={20} color={COLORS.textWhite} />
                                        </LinearGradient>
                                        {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
                                            <View style={s.urgentBadge}><Text style={s.urgentText}>🔥 {daysLeft}d left</Text></View>
                                        )}
                                    </View>
                                    <Text style={s.jobTitle} numberOfLines={2}>{job.title}</Text>
                                    <Text style={s.jobOrg}>{job.organization}</Text>
                                    <View style={s.jobMeta}>
                                        {job.location && <View style={s.jobTag}><Ionicons name="location-outline" size={12} color={COLORS.textSecondary} /><Text style={s.jobTagText}>{job.location}</Text></View>}
                                        {job.salary && <View style={s.jobTag}><Ionicons name="cash-outline" size={12} color={COLORS.textSecondary} /><Text style={s.jobTagText}>{job.salary}</Text></View>}
                                    </View>
                                    {job.lastDate && (
                                        <View style={s.deadlineRow}>
                                            <Ionicons name="calendar-outline" size={13} color={daysLeft && daysLeft <= 7 ? COLORS.error : COLORS.textSecondary} />
                                            <Text style={[s.deadlineText, daysLeft && daysLeft <= 7 && { color: COLORS.error }]}>
                                                Last Date: {new Date(job.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                    {jobs.length === 0 && <View style={s.empty}><Ionicons name="briefcase-outline" size={48} color={COLORS.textLight} /><Text style={s.emptyTitle}>No Jobs Found</Text></View>}
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: SPACING.base, paddingTop: SPACING.sm },
    jobCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOWS.card },
    jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    jobIcon: { width: 42, height: 42, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
    urgentBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
    urgentText: { fontSize: 10, fontWeight: FONTS.weights.bold, color: COLORS.error },
    jobTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 4, lineHeight: 22 },
    jobOrg: { fontSize: FONTS.sizes.sm, color: COLORS.primary, marginBottom: SPACING.sm, fontWeight: FONTS.weights.medium },
    jobMeta: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
    jobTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.borderLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, gap: 4 },
    jobTagText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
    deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    deadlineText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
    empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
    emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: SPACING.md },
});
