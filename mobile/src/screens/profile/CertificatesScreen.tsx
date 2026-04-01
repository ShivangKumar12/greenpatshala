// Certificates Screen - View and download earned certificates
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { certificatesAPI } from '../../services/api';

export default function CertificatesScreen({ navigation }: any) {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCerts = async () => {
        try {
            const res = await certificatesAPI.getMyCertificates();
            setCertificates(res.data?.certificates || res.data?.data || []);
        } catch (err) {
            console.log('Certs error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCerts(); }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCerts();
        setRefreshing(false);
    };

    const handleDownload = async (certId: string) => {
        Alert.alert('Download', 'Certificate download will open in browser.');
    };

    return (
        <View style={s.container}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.header}>
                <View style={s.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
                    </TouchableOpacity>
                    <View>
                        <Text style={s.headerTitle}>My Certificates</Text>
                        <Text style={s.headerSub}>{certificates.length} certificates earned</Text>
                    </View>
                </View>
            </LinearGradient>

            {loading ? (
                <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    contentContainerStyle={s.list}
                >
                    {certificates.length === 0 ? (
                        <View style={s.empty}>
                            <View style={s.emptyIcon}>
                                <Ionicons name="ribbon" size={48} color="#F59E0B" />
                            </View>
                            <Text style={s.emptyTitle}>No Certificates Yet</Text>
                            <Text style={s.emptyMsg}>Complete courses or pass quizzes to earn certificates!</Text>
                            <TouchableOpacity style={s.browseBtn} onPress={() => navigation.navigate('CoursesTab')}>
                                <Text style={s.browseBtnText}>Browse Courses</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        certificates.map((cert, i) => (
                            <Animated.View key={cert.id} entering={FadeInDown.delay(i * 80)}>
                                <View style={s.certCard}>
                                    <LinearGradient
                                        colors={['#FEF3C7', '#FDE68A', '#FCD34D']}
                                        style={s.certVisual}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    >
                                        <View style={s.certBorder}>
                                            <Text style={s.certStar}>★ Certificate ★</Text>
                                            <Text style={s.certNamePreview} numberOfLines={2}>
                                                {cert.course?.title || cert.quiz?.title || cert.itemName || 'Achievement'}
                                            </Text>
                                        </View>
                                        <View style={s.certTypeBadge}>
                                            <Text style={s.certTypeText}>{cert.type || 'course'}</Text>
                                        </View>
                                    </LinearGradient>
                                    <View style={s.certInfo}>
                                        <Text style={s.certTitle} numberOfLines={1}>
                                            {cert.course?.title || cert.quiz?.title || cert.itemName || 'Certificate'}
                                        </Text>
                                        <Text style={s.certAchievement}>
                                            {cert.type === 'course' ? 'Course Completion' : 'Quiz Achievement'}
                                        </Text>
                                        <View style={s.certMeta}>
                                            <View style={s.certMetaItem}>
                                                <Ionicons name="calendar-outline" size={12} color={COLORS.textSecondary} />
                                                <Text style={s.certMetaText}>
                                                    {new Date(cert.issuedAt || cert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </Text>
                                            </View>
                                            <View style={s.certMetaItem}>
                                                <Ionicons name="finger-print" size={12} color={COLORS.textSecondary} />
                                                <Text style={s.certMetaText}>{cert.certificateNumber || cert.certificateId || 'N/A'}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={s.downloadBtn} onPress={() => handleDownload(cert.id)}>
                                            <Ionicons name="download" size={16} color={COLORS.textWhite} />
                                            <Text style={s.downloadBtnText}>Download PDF</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Animated.View>
                        ))
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    headerSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: SPACING.base },
    empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
    emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
    emptyMsg: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, paddingHorizontal: SPACING.xl },
    browseBtn: { marginTop: SPACING.lg, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary },
    browseBtnText: { color: COLORS.textWhite, fontWeight: FONTS.weights.semibold },
    certCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOWS.card, borderWidth: 1, borderColor: '#FDE68A' },
    certVisual: { height: 120, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    certBorder: { borderWidth: 2, borderColor: 'rgba(217,119,6,0.3)', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', width: '80%' },
    certStar: { fontSize: 9, color: '#92400E', fontWeight: FONTS.weights.bold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
    certNamePreview: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: '#78350F', textAlign: 'center' },
    certTypeBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.xs },
    certTypeText: { fontSize: 9, fontWeight: FONTS.weights.bold, color: '#92400E', textTransform: 'capitalize' },
    certInfo: { padding: SPACING.base },
    certTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 2 },
    certAchievement: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    certMeta: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
    certMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    certMetaText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
    downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D97706', borderRadius: RADIUS.md, paddingVertical: SPACING.sm, gap: 6 },
    downloadBtnText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.textWhite },
});
