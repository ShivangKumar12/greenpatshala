// Quiz Detail Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { AnimatedButton } from '../../components/SharedComponents';
import { quizzesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function QuizDetailScreen({ navigation, route }: any) {
    const { id } = route.params;
    const { isAuthenticated } = useAuth();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadQuiz(); }, [id]);

    const loadQuiz = async () => {
        try {
            const res = await quizzesAPI.getById(id);
            setQuiz(res.data?.quiz || res.data);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    const handleStart = () => {
        if (!isAuthenticated) { navigation.navigate('Auth'); return; }
        navigation.navigate('QuizAttempt', { id: quiz.id });
    };

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!quiz) return null;

    const dc = quiz.difficulty === 'easy' ? COLORS.success : quiz.difficulty === 'hard' ? COLORS.error : COLORS.warning;

    return (
        <View style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.hero}>
                    <Ionicons name="arrow-back" size={24} color="#fff" onPress={() => navigation.goBack()} />
                    <View style={s.heroCenter}>
                        <View style={s.iconCircle}><Ionicons name="help-circle" size={48} color={COLORS.primary} /></View>
                        <Text style={s.heroTitle}>{quiz.title}</Text>
                        <View style={[s.badge, { backgroundColor: dc + '30' }]}><Text style={[s.badgeText, { color: dc }]}>{quiz.difficulty?.toUpperCase()}</Text></View>
                    </View>
                </LinearGradient>

                <View style={s.content}>
                    <Animated.View entering={FadeInDown.delay(200)} style={s.stats}>
                        {[
                            { icon: 'timer-outline', l: 'Duration', v: `${quiz.duration} min` },
                            { icon: 'help-circle-outline', l: 'Marks', v: quiz.total_marks },
                            { icon: 'trophy-outline', l: 'Passing', v: `${quiz.passing_marks}%` },
                            { icon: 'refresh-outline', l: 'Attempts', v: quiz.attemptsAllowed || '∞' },
                        ].map((st, i) => (
                            <View key={i} style={s.statItem}>
                                <View style={s.statBg}><Ionicons name={st.icon as any} size={22} color={COLORS.primary} /></View>
                                <Text style={s.statV}>{st.v}</Text>
                                <Text style={s.statL}>{st.l}</Text>
                            </View>
                        ))}
                    </Animated.View>

                    {quiz.description && (
                        <Animated.View entering={FadeInDown.delay(300)} style={s.section}>
                            <Text style={s.secTitle}>About</Text>
                            <Text style={s.desc}>{quiz.description}</Text>
                        </Animated.View>
                    )}

                    <Animated.View entering={FadeInDown.delay(400)} style={s.section}>
                        <Text style={s.secTitle}>Rules</Text>
                        {[
                            quiz.negativeMarking ? `Negative marking: -${quiz.negativeMarksPerQuestion}` : 'No negative marking',
                            quiz.shuffle_questions ? 'Questions shuffled' : 'Fixed order',
                            quiz.show_results ? 'Immediate results' : 'Results later',
                        ].map((r, i) => (
                            <View key={i} style={s.ruleRow}><Ionicons name="information-circle" size={18} color={COLORS.primary} /><Text style={s.ruleText}>{r}</Text></View>
                        ))}
                    </Animated.View>

                    <View style={s.priceArea}>
                        {quiz.isFree ? <Text style={s.free}>FREE</Text> : <Text style={s.price}>₹{quiz.discount_price || quiz.price}</Text>}
                    </View>
                    <AnimatedButton title="Start Quiz" onPress={handleStart} icon="play-circle-outline" />
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
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...SHADOWS.lg },
    heroTitle: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: 32, marginBottom: 8 },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
    badgeText: { fontSize: 12, fontWeight: '700' },
    content: { padding: 16, paddingTop: 20 },
    stats: { flexDirection: 'row', marginBottom: 20 },
    statItem: { flex: 1, alignItems: 'center' },
    statBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    statV: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    statL: { fontSize: 10, color: COLORS.textSecondary },
    section: { marginBottom: 20 },
    secTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
    desc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 24 },
    ruleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    ruleText: { fontSize: 14, color: COLORS.text, marginLeft: 8, flex: 1, lineHeight: 22 },
    priceArea: { alignItems: 'center', marginBottom: 16 },
    price: { fontSize: 30, fontWeight: '700', color: COLORS.primary },
    free: { fontSize: 24, fontWeight: '700', color: COLORS.success },
});
