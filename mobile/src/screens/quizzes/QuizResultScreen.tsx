// Quiz Result Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { AnimatedButton } from '../../components/SharedComponents';
import { quizzesAPI } from '../../services/api';

export default function QuizResultScreen({ navigation, route }: any) {
    const { attemptId } = route.params;
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResult();
    }, [attemptId]);

    const loadResult = async () => {
        try {
            const res = await quizzesAPI.getAttemptById(attemptId);
            setResult(res.data?.attempt || res.data);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    const passed = result?.is_passed;

    return (
        <View style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={passed ? [COLORS.primaryDarker, COLORS.primary] : ['#DC2626', '#EF4444']} style={s.hero}>
                    <Animated.View entering={BounceIn.delay(300)} style={s.resultIcon}>
                        <Ionicons name={passed ? 'trophy' : 'close-circle'} size={56} color={passed ? COLORS.primary : '#EF4444'} />
                    </Animated.View>
                    <Animated.Text entering={FadeInDown.delay(400)} style={s.heroTitle}>
                        {passed ? 'Congratulations! 🎉' : 'Better Luck Next Time'}
                    </Animated.Text>
                    <Animated.Text entering={FadeInDown.delay(500)} style={s.heroSub}>
                        {passed ? 'You passed the quiz!' : 'Keep practicing to improve'}
                    </Animated.Text>
                </LinearGradient>

                <View style={s.content}>
                    <Animated.View entering={FadeInDown.delay(600)} style={s.scoreCard}>
                        <Text style={s.scoreLabel}>Your Score</Text>
                        <Text style={[s.scoreValue, { color: passed ? COLORS.primary : COLORS.error }]}>{result?.percentage || 0}%</Text>
                        <Text style={s.scoreSub}>{result?.score || 0} / {result?.total_questions || 0} marks</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(700)} style={s.statsRow}>
                        <View style={[s.statBox, { backgroundColor: '#DCFCE7' }]}>
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                            <Text style={s.statNum}>{result?.correct_answers || 0}</Text>
                            <Text style={s.statLabel}>Correct</Text>
                        </View>
                        <View style={[s.statBox, { backgroundColor: '#FEE2E2' }]}>
                            <Ionicons name="close-circle" size={24} color={COLORS.error} />
                            <Text style={s.statNum}>{result?.wrong_answers || 0}</Text>
                            <Text style={s.statLabel}>Wrong</Text>
                        </View>
                        <View style={[s.statBox, { backgroundColor: '#FEF3C7' }]}>
                            <Ionicons name="remove-circle" size={24} color={COLORS.warning} />
                            <Text style={s.statNum}>{result?.skipped_answers || 0}</Text>
                            <Text style={s.statLabel}>Skipped</Text>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(800)} style={s.timeCard}>
                        <Ionicons name="timer-outline" size={20} color={COLORS.primary} />
                        <Text style={s.timeText}>Time Taken: {Math.floor((result?.time_taken || 0) / 60)}m {(result?.time_taken || 0) % 60}s</Text>
                    </Animated.View>

                    <AnimatedButton title="Back to Quizzes" onPress={() => navigation.navigate('QuizzesTab')} icon="list-outline" />
                </View>
                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    hero: { paddingTop: 50, paddingBottom: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    resultIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 16, ...SHADOWS.lg },
    heroTitle: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
    heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
    content: { padding: 16 },
    scoreCard: { alignItems: 'center', backgroundColor: '#fff', padding: 24, borderRadius: 16, marginBottom: 16, ...SHADOWS.md },
    scoreLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
    scoreValue: { fontSize: 48, fontWeight: '800' },
    scoreSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statBox: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 12 },
    statNum: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 4 },
    statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    timeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 20, ...SHADOWS.sm },
    timeText: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginLeft: 8 },
});
