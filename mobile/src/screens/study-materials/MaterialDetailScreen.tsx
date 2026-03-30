// Material Detail Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../theme/theme';
import { GradientHeader, AnimatedButton } from '../../components/SharedComponents';
import { studyMaterialsAPI } from '../../services/api';

export default function MaterialDetailScreen({ navigation, route }: any) {
    const { id } = route.params;
    const [material, setMaterial] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { const res = await studyMaterialsAPI.getById(id); setMaterial(res.data?.material || res.data); }
            catch (err) { console.log(err); }
            finally { setLoading(false); }
        })();
    }, [id]);

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!material) return null;

    return (
        <View style={s.container}>
            <GradientHeader title="Study Material" showBack onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.delay(200)} style={s.iconWrap}>
                    <Ionicons name="document-text" size={48} color={COLORS.primary} />
                </Animated.View>
                <Animated.Text entering={FadeInDown.delay(300)} style={s.title}>{material.title}</Animated.Text>
                <Animated.View entering={FadeInDown.delay(400)} style={s.meta}>
                    <Text style={s.metaText}>{material.subject} • {material.category} • {material.fileType?.toUpperCase()}</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(500)} style={s.infoCard}>
                    {[
                        { icon: 'download-outline', label: 'Downloads', value: material.downloads },
                        { icon: 'eye-outline', label: 'Views', value: material.views },
                        { icon: 'document-outline', label: 'Pages', value: material.totalPages || 'N/A' },
                    ].map((item, i) => (
                        <View key={i} style={s.infoItem}>
                            <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                            <Text style={s.infoValue}>{item.value}</Text>
                            <Text style={s.infoLabel}>{item.label}</Text>
                        </View>
                    ))}
                </Animated.View>

                {material.description && (
                    <Animated.View entering={FadeInDown.delay(600)}>
                        <Text style={s.secTitle}>Description</Text>
                        <Text style={s.desc}>{material.description}</Text>
                    </Animated.View>
                )}

                <View style={s.priceArea}>
                    {material.isPaid ? <Text style={s.price}>₹{material.discountPrice || material.price}</Text> : <Text style={s.free}>FREE</Text>}
                </View>

                <AnimatedButton title={material.isPaid ? 'Buy & Download' : 'Download'} onPress={() => { if (material.fileUrl) Linking.openURL(material.fileUrl); }} icon="download-outline" />
                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    content: { padding: 16 },
    iconWrap: { alignSelf: 'center', width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginVertical: 16 },
    title: { fontSize: 20, fontWeight: '700', color: COLORS.text, textAlign: 'center', lineHeight: 28, marginBottom: 8 },
    meta: { alignItems: 'center', marginBottom: 16 },
    metaText: { fontSize: 13, color: COLORS.textSecondary },
    infoCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, ...SHADOWS.md },
    infoItem: { flex: 1, alignItems: 'center' },
    infoValue: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 6 },
    infoLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    secTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
    desc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 24, marginBottom: 20 },
    priceArea: { alignItems: 'center', marginBottom: 16 },
    price: { fontSize: 28, fontWeight: '700', color: COLORS.primary },
    free: { fontSize: 22, fontWeight: '700', color: COLORS.success },
});
