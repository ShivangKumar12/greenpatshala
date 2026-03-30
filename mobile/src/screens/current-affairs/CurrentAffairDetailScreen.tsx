// Current Affair Detail Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SPACING, SHADOWS } from '../../theme/theme';
import { GradientHeader } from '../../components/SharedComponents';
import { currentAffairsAPI } from '../../services/api';

export default function CurrentAffairDetailScreen({ navigation, route }: any) {
    const { id } = route.params;
    const [affair, setAffair] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { const res = await currentAffairsAPI.getById(id); setAffair(res.data?.data || res.data); }
            catch (err) { console.log(err); }
            finally { setLoading(false); }
        })();
    }, [id]);

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!affair) return null;

    return (
        <View style={s.container}>
            <GradientHeader title="Current Affairs" showBack onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.delay(200)}>
                    <View style={s.categoryBadge}><Text style={s.categoryText}>{affair.category}</Text></View>
                    <Text style={s.title}>{affair.title}</Text>
                    <View style={s.metaRow}>
                        <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={s.metaText}>{new Date(affair.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                        {affair.source && (<><Ionicons name="link-outline" size={14} color={COLORS.textSecondary} style={{ marginLeft: 16 }} /><Text style={s.metaText}>{affair.source}</Text></>)}
                    </View>
                </Animated.View>
                {affair.summary && <Animated.View entering={FadeInDown.delay(300)} style={s.summaryBox}><Text style={s.summaryText}>{affair.summary}</Text></Animated.View>}
                <Animated.View entering={FadeInDown.delay(400)}>
                    <Text style={s.contentText}>{affair.content}</Text>
                </Animated.View>
                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    content: { padding: 16 },
    categoryBadge: { backgroundColor: COLORS.primaryBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 12 },
    categoryText: { fontSize: 11, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
    title: { fontSize: 22, fontWeight: '700', color: COLORS.text, lineHeight: 30, marginBottom: 12 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    metaText: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4 },
    summaryBox: { backgroundColor: COLORS.primaryBgLight, padding: 14, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: COLORS.primary, marginBottom: 16 },
    summaryText: { fontSize: 14, color: COLORS.text, lineHeight: 22, fontStyle: 'italic' },
    contentText: { fontSize: 15, color: COLORS.text, lineHeight: 26 },
});
