// Job Detail Screen - Full job info with apply button
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { jobsAPI } from '../../services/api';

export default function JobDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await jobsAPI.getById(id);
                setJob(res.data?.job || res.data);
            } catch (err) { console.log('JobDetail error:', err); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!job) return <View style={s.center}><Text>Job not found</Text></View>;

    const InfoRow = ({ icon, label, value }: { icon: string; label: string; value?: string }) => {
        if (!value) return null;
        return (
            <View style={s.infoRow}>
                <View style={s.infoIcon}><Ionicons name={icon as any} size={16} color={COLORS.primary} /></View>
                <View style={{ flex: 1 }}><Text style={s.infoLabel}>{label}</Text><Text style={s.infoValue}>{value}</Text></View>
            </View>
        );
    };

    return (
        <View style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>{job.title}</Text>
                    <Text style={s.headerOrg}>{job.organization}</Text>
                    <View style={s.headerBadges}>
                        {job.location && <View style={s.badge}><Ionicons name="location" size={12} color={COLORS.textWhite} /><Text style={s.badgeText}>{job.location}</Text></View>}
                        {job.department && <View style={s.badge}><Ionicons name="business" size={12} color={COLORS.textWhite} /><Text style={s.badgeText}>{job.department}</Text></View>}
                    </View>
                </LinearGradient>

                <View style={s.content}>
                    <Animated.View entering={FadeInDown.delay(100)} style={s.infoCard}>
                        <InfoRow icon="calendar" label="Last Date" value={job.lastDate ? new Date(job.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined} />
                        <InfoRow icon="calendar-outline" label="Exam Date" value={job.examDate ? new Date(job.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined} />
                        <InfoRow icon="school" label="Qualification" value={job.qualification} />
                        <InfoRow icon="briefcase" label="Experience" value={job.experience} />
                        <InfoRow icon="cash" label="Salary" value={job.salary} />
                        <InfoRow icon="people" label="Vacancies" value={job.vacancies?.toString()} />
                        <InfoRow icon="person" label="Age Limit" value={job.ageLimit} />
                        <InfoRow icon="card" label="Application Fee" value={job.applicationFee} />
                    </Animated.View>

                    {job.description && (
                        <Animated.View entering={FadeInDown.delay(200)} style={s.section}>
                            <Text style={s.sectionTitle}>Description</Text>
                            <Text style={s.sectionText}>{job.description}</Text>
                        </Animated.View>
                    )}

                    {job.responsibilities && (
                        <Animated.View entering={FadeInDown.delay(250)} style={s.section}>
                            <Text style={s.sectionTitle}>Responsibilities</Text>
                            <Text style={s.sectionText}>{job.responsibilities}</Text>
                        </Animated.View>
                    )}

                    {job.requirements && (
                        <Animated.View entering={FadeInDown.delay(300)} style={s.section}>
                            <Text style={s.sectionTitle}>Requirements</Text>
                            <Text style={s.sectionText}>{job.requirements}</Text>
                        </Animated.View>
                    )}

                    {job.benefits && (
                        <Animated.View entering={FadeInDown.delay(350)} style={s.section}>
                            <Text style={s.sectionTitle}>Benefits</Text>
                            <Text style={s.sectionText}>{job.benefits}</Text>
                        </Animated.View>
                    )}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            {job.applyLink && (
                <View style={s.bottomBar}>
                    <TouchableOpacity style={s.applyBtn} onPress={() => Linking.openURL(job.applyLink)}>
                        <Ionicons name="arrow-redo" size={18} color={COLORS.textWhite} />
                        <Text style={s.applyBtnText}>Apply Now</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
    headerTitle: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.textWhite, lineHeight: 32, marginBottom: 4 },
    headerOrg: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.85)', marginBottom: SPACING.sm },
    headerBadges: { flexDirection: 'row', gap: 8 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
    badgeText: { fontSize: 11, color: COLORS.textWhite, fontWeight: FONTS.weights.medium },
    content: { padding: SPACING.base },
    infoCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.card },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    infoIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    infoLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginBottom: 2 },
    infoValue: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium, color: COLORS.text },
    section: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginTop: SPACING.md, ...SHADOWS.sm },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
    sectionText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 22 },
    bottomBar: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
    applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, gap: 8, ...SHADOWS.green },
    applyBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
});
