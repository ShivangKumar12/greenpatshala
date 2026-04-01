// Current Affair Detail Screen - Full article view
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Share, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { currentAffairsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

export default function CurrentAffairDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await currentAffairsAPI.getById(id);
                setArticle(res.data?.currentAffair || res.data?.data || res.data);
            } catch (err) { console.log('Article error:', err); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    const handleShare = async () => {
        if (!article) return;
        try {
            await Share.share({ message: `${article.title}\n\nRead on GreenPatshala`, title: article.title });
        } catch {}
    };

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!article) return <View style={s.center}><Text>Article not found</Text></View>;

    const htmlContent = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:system-ui,-apple-system;padding:16px;color:#161B26;line-height:1.7;font-size:16px}img{max-width:100%;border-radius:8px}h1,h2,h3{color:#0E6B31}a{color:#3B82F6}blockquote{border-left:3px solid #0E6B31;padding-left:12px;color:#5C6370}ul,ol{padding-left:20px}</style></head><body>${article.content || '<p>No content available.</p>'}</body></html>`;

    return (
        <View style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={s.header}>
                    <View style={s.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                            <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare} style={s.shareBtn}>
                            <Ionicons name="share-outline" size={20} color={COLORS.textWhite} />
                        </TouchableOpacity>
                    </View>
                    <View style={s.catBadge}><Text style={s.catText}>{article.category}</Text></View>
                    <Text style={s.title}>{article.title}</Text>
                    <Text style={s.date}>
                        {new Date(article.date || article.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                </LinearGradient>

                {article.summary && (
                    <Animated.View entering={FadeInDown.delay(100)} style={s.summaryCard}>
                        <Ionicons name="bulb" size={18} color="#F59E0B" />
                        <Text style={s.summaryText}>{article.summary}</Text>
                    </Animated.View>
                )}

                <Animated.View entering={FadeInDown.delay(200)} style={s.contentContainer}>
                    <WebView
                        source={{ html: htmlContent }}
                        style={{ height: 600, width: width - SPACING.base * 2 }}
                        scrollEnabled={false}
                        onMessage={() => {}}
                        injectedJavaScript={`
                            window.ReactNativeWebView.postMessage(document.body.scrollHeight.toString());
                            true;
                        `}
                    />
                </Animated.View>

                {article.tags && article.tags.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(300)} style={s.tagsSection}>
                        <Text style={s.tagsLabel}>Tags</Text>
                        <View style={s.tagsRow}>
                            {(Array.isArray(article.tags) ? article.tags : []).map((tag: string, i: number) => (
                                <View key={i} style={s.tag}><Text style={s.tagText}>#{tag}</Text></View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    shareBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    catBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: SPACING.sm },
    catText: { fontSize: 11, fontWeight: FONTS.weights.semibold, color: COLORS.textWhite },
    title: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.textWhite, lineHeight: 32, marginBottom: SPACING.sm },
    date: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)' },
    summaryCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, padding: SPACING.base, marginHorizontal: SPACING.base, marginTop: SPACING.md, gap: SPACING.sm },
    summaryText: { flex: 1, fontSize: FONTS.sizes.md, color: '#92400E', lineHeight: 22, fontWeight: FONTS.weights.medium },
    contentContainer: { marginHorizontal: SPACING.base, marginTop: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.sm },
    tagsSection: { paddingHorizontal: SPACING.base, marginTop: SPACING.lg },
    tagsLabel: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    tag: { backgroundColor: COLORS.primaryBg, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
    tagText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: FONTS.weights.medium },
});
