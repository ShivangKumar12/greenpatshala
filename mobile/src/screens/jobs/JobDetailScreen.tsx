// Job Detail Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { AnimatedButton } from '../../components/SharedComponents';
import { jobsAPI } from '../../services/api';

export default function JobDetailScreen({ navigation, route }: any) {
    const { id } = route.params;
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { const res = await jobsAPI.getById(id); setJob(res.data?.job || res.data); }
            catch (err) { console.log(err); }
            finally { setLoading(false); }
        })();
    }, [id]);

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!job) return null;

    const InfoRow = ({ icon, label, value }: any) => value ? (
        <View style={s.infoRow}>
            <Ionicons name={icon} size={18} color={COLORS.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={s.infoLabel}>{label}</Text>
                <Text style={s.infoValue}>{value}</Text>
            </View>
        </View>
    ) : null;

    return (
        <View style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.hero}>
                    <Ionicons name="arrow-back" size={24} color="#fff" onPress={() => navigation.goBack()} />
                    <View style={s.heroCenter}>
                        <View style={s.iconCircle}><Ionicons name="briefcase" size={36} color={COLORS.primary} /></View>
                        <Text style={s.heroTitle}>{job.title}</Text>
                        <Text style={s.heroOrg}>{job.organization}</Text>
                    </View>
                </LinearGradient>

                <View style={s.content}>
                    <Animated.View entering={FadeInDown.delay(200)} style={s.infoCard}>
                        <InfoRow icon="location-outline" label="Location" value={job.location} />
                        <InfoRow icon="cash-outline" label="Salary" value={job.salary} />
                        <InfoRow icon="school-outline" label="Qualifications" value={job.qualifications} />
                        <InfoRow icon="calendar-outline" label="Last Date" value={job.lastDate ? new Date(job.lastDate).toLocaleDateString('en-IN') : null} />
                        <InfoRow icon="people-outline" label="Positions" value={job.positions} />
                        <InfoRow icon="time-outline" label="Experience" value={job.experience} />
                        <InfoRow icon="person-outline" label="Age Limit" value={job.ageLimit} />
                        <InfoRow icon="receipt-outline" label="Application Fee" value={job.applicationFee} />
                    </Animated.View>

                    {job.description && (
                        <Animated.View entering={FadeInDown.delay(300)} style={s.section}>
                            <Text style={s.secTitle}>Description</Text>
                            <Text style={s.desc}>{job.description}</Text>
                        </Animated.View>
                    )}

                    {job.applyUrl && (
                        <Animated.View entering={FadeInDown.delay(400)}>
                            <AnimatedButton title="Apply Now" onPress={() => Linking.openURL(job.applyUrl)} icon="open-outline" />
                        </Animated.View>
                    )}
                </View>
                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    hero: { paddingTop: 50, paddingBottom: 30, paddingHorizontal: 16, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    heroCenter: { alignItems: 'center', marginTop: 16 },
    iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...SHADOWS.lg },
    heroTitle: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: 30, marginBottom: 4 },
    heroOrg: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
    content: { padding: 16 },
    infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, ...SHADOWS.md },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    infoLabel: { fontSize: 11, color: COLORS.textSecondary, textTransform: 'uppercase' },
    infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: 2, lineHeight: 20 },
    section: { marginBottom: 20 },
    secTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
    desc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 24 },
});
