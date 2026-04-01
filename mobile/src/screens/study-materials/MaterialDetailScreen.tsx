// Material Detail Screen - PDF preview, purchase, download
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { studyMaterialsAPI, paymentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function MaterialDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { user } = useAuth();
    const [material, setMaterial] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPurchased, setIsPurchased] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await studyMaterialsAPI.getById(id);
                const m = res.data?.material || res.data;
                setMaterial(m);
                setIsPurchased(m?.isPurchased || m?.isFree || !m?.isPaid || m?.price === 0);
            } catch (err) { console.log('Material error:', err); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    const handleDownload = async () => {
        try {
            await studyMaterialsAPI.incrementDownload(id);
            Alert.alert('Download', 'Download started. Check your downloads.');
        } catch {}
    };

    const handlePurchase = () => {
        if (!user) { Alert.alert('Login Required', 'Please login to purchase.'); return; }
        Alert.alert('Purchase', 'Payment integration coming soon.');
    };

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!material) return <View style={s.center}><Text>Material not found</Text></View>;

    const isFree = !material.isPaid || material.price === 0 || material.isFree;

    return (
        <View style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
                    </TouchableOpacity>
                    <View style={s.fileIconBg}>
                        <Ionicons name={material.fileType === 'pdf' ? 'document-text' : 'document'} size={32} color="rgba(255,255,255,0.4)" />
                    </View>
                    <View style={s.catBadge}><Text style={s.catText}>{material.category}</Text></View>
                    <Text style={s.title}>{material.title}</Text>
                    <View style={s.meta}>
                        <Text style={s.metaText}>{material.subject}</Text>
                        <Text style={s.metaDot}>•</Text>
                        <Text style={s.metaText}>{material.downloads || 0} downloads</Text>
                    </View>
                </LinearGradient>

                <Animated.View entering={FadeInDown.delay(100)} style={s.infoCard}>
                    {[
                        { icon: 'document', label: 'Type', value: (material.fileType || 'PDF').toUpperCase() },
                        { icon: 'pricetag', label: 'Price', value: isFree ? 'Free' : `₹${material.discountPrice || material.price}` },
                        { icon: 'layers', label: 'Category', value: material.category },
                        { icon: 'school', label: 'Subject', value: material.subject },
                    ].map((item, i) => (
                        <View key={i} style={[s.infoRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight }]}>
                            <Ionicons name={item.icon as any} size={16} color={COLORS.primary} />
                            <Text style={s.infoLabel}>{item.label}</Text>
                            <Text style={s.infoValue}>{item.value}</Text>
                        </View>
                    ))}
                </Animated.View>

                {material.description && (
                    <Animated.View entering={FadeInDown.delay(200)} style={s.section}>
                        <Text style={s.sectionTitle}>Description</Text>
                        <Text style={s.descText}>{material.description}</Text>
                    </Animated.View>
                )}

                {/* PDF Preview */}
                {isPurchased && material.fileUrl && material.fileType === 'pdf' && (
                    <Animated.View entering={FadeInDown.delay(300)} style={s.previewContainer}>
                        <Text style={s.sectionTitle}>Preview</Text>
                        <View style={s.pdfContainer}>
                            <WebView
                                source={{ uri: `https://docs.google.com/viewer?url=${encodeURIComponent(material.fileUrl)}&embedded=true` }}
                                style={{ height: 400 }}
                            />
                        </View>
                    </Animated.View>
                )}

                {!isPurchased && (
                    <Animated.View entering={FadeInDown.delay(300)} style={s.lockedCard}>
                        <Ionicons name="lock-closed" size={32} color={COLORS.warning} />
                        <Text style={s.lockedTitle}>Premium Content</Text>
                        <Text style={s.lockedMsg}>Purchase this material to access full content</Text>
                    </Animated.View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={s.bottomBar}>
                {isPurchased ? (
                    <TouchableOpacity style={s.downloadBtn} onPress={handleDownload}>
                        <Ionicons name="download" size={18} color={COLORS.textWhite} />
                        <Text style={s.downloadBtnText}>Download</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={s.buyBtn} onPress={handlePurchase}>
                        <Text style={s.buyBtnText}>Buy Now - ₹{material.discountPrice || material.price}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
    fileIconBg: { position: 'absolute', right: 20, top: 60, opacity: 0.5 },
    catBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: SPACING.sm },
    catText: { fontSize: 11, fontWeight: FONTS.weights.semibold, color: COLORS.textWhite },
    title: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.textWhite, lineHeight: 32, marginBottom: SPACING.sm },
    meta: { flexDirection: 'row', alignItems: 'center' },
    metaText: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)' },
    metaDot: { color: 'rgba(255,255,255,0.5)', marginHorizontal: 8 },
    infoCard: { marginHorizontal: SPACING.base, marginTop: -12, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.card },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.md },
    infoLabel: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
    infoValue: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text },
    section: { paddingHorizontal: SPACING.base, marginTop: SPACING.lg },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
    descText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 22 },
    previewContainer: { paddingHorizontal: SPACING.base, marginTop: SPACING.lg },
    pdfContainer: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.sm },
    lockedCard: { alignItems: 'center', marginHorizontal: SPACING.base, marginTop: SPACING.lg, backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, padding: SPACING.xl },
    lockedTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: '#92400E', marginTop: SPACING.sm },
    lockedMsg: { fontSize: FONTS.sizes.md, color: '#B45309', marginTop: SPACING.xs, textAlign: 'center' },
    bottomBar: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
    downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, gap: 8, ...SHADOWS.green },
    downloadBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    buyBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F59E0B', borderRadius: RADIUS.lg, paddingVertical: SPACING.md },
    buyBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
});
