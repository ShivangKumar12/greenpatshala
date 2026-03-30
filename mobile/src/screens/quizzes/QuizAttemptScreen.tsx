// Quiz Attempt Screen - Timer, question navigation, submit
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { AnimatedButton } from '../../components/SharedComponents';
import { quizzesAPI } from '../../services/api';

export default function QuizAttemptScreen({ navigation, route }: any) {
    const { id } = route.params;
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        loadQuiz();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const loadQuiz = async () => {
        try {
            const res = await quizzesAPI.getForAttempt(id);
            const data = res.data?.quiz || res.data;
            setQuiz(data);
            setQuestions(data?.questions || []);
            setTimeLeft((data?.duration || 30) * 60);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Cannot load quiz');
            navigation.goBack();
        } finally { setLoading(false); }
    };

    useEffect(() => {
        if (timeLeft > 0 && !loading) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => { if (prev <= 1) { handleSubmit(); return 0; } return prev - 1; });
            }, 1000);
            return () => clearInterval(timerRef.current);
        }
    }, [loading]);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const selectAnswer = (qIdx: number, optIdx: number) => {
        setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    };

    const handleSubmit = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setSubmitting(true);
        try {
            const formattedAnswers = questions.map((q, i) => ({
                questionId: q.id,
                selectedAnswer: answers[i] !== undefined ? answers[i] : null,
            }));
            const res = await quizzesAPI.submit(id, {
                answers: formattedAnswers,
                timeTaken: (quiz?.duration || 30) * 60 - timeLeft,
            });
            navigation.replace('QuizResult', { attemptId: res.data?.attemptId || res.data?.id });
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Submit failed');
            setSubmitting(false);
        }
    };

    const confirmSubmit = () => {
        const unanswered = questions.length - Object.keys(answers).length;
        Alert.alert('Submit Quiz?', unanswered > 0 ? `You have ${unanswered} unanswered questions.` : 'Are you sure?',
            [{ text: 'Cancel' }, { text: 'Submit', onPress: handleSubmit, style: 'destructive' }]);
    };

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    const q = questions[current];
    const options = Array.isArray(q?.options) ? q.options : [];

    return (
        <View style={s.container}>
            {/* Timer Bar */}
            <View style={s.timerBar}>
                <TouchableOpacity onPress={() => Alert.alert('Quit?', 'Progress will be lost.', [{ text: 'Cancel' }, { text: 'Quit', onPress: () => navigation.goBack(), style: 'destructive' }])}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={s.timerCenter}>
                    <Ionicons name="timer-outline" size={18} color={timeLeft < 60 ? COLORS.error : COLORS.primary} />
                    <Text style={[s.timerText, timeLeft < 60 && { color: COLORS.error }]}>{formatTime(timeLeft)}</Text>
                </View>
                <Text style={s.qCount}>{current + 1}/{questions.length}</Text>
            </View>

            {/* Progress */}
            <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${((current + 1) / questions.length) * 100}%` }]} />
            </View>

            <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInRight} key={current}>
                    <Text style={s.questionNum}>Question {current + 1}</Text>
                    <Text style={s.questionText}>{q?.question}</Text>

                    {options.map((opt: any, i: number) => {
                        const selected = answers[current] === i;
                        return (
                            <TouchableOpacity key={i} onPress={() => selectAnswer(current, i)} style={[s.option, selected && s.optionSelected]} activeOpacity={0.8}>
                                <View style={[s.optionCircle, selected && s.optionCircleSelected]}>
                                    {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
                                </View>
                                <Text style={[s.optionText, selected && s.optionTextSelected]}>{typeof opt === 'string' ? opt : opt.text || opt.label || JSON.stringify(opt)}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </Animated.View>
            </ScrollView>

            {/* Navigation */}
            <View style={s.navBar}>
                <TouchableOpacity onPress={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} style={[s.navBtn, current === 0 && s.navBtnDisabled]}>
                    <Ionicons name="chevron-back" size={20} color={current === 0 ? COLORS.disabled : COLORS.primary} />
                    <Text style={[s.navBtnText, current === 0 && { color: COLORS.disabled }]}>Prev</Text>
                </TouchableOpacity>

                {current === questions.length - 1 ? (
                    <AnimatedButton title="Submit" onPress={confirmSubmit} loading={submitting} icon="checkmark-done" style={{ flex: 1, marginLeft: 12 }} />
                ) : (
                    <TouchableOpacity onPress={() => setCurrent(Math.min(questions.length - 1, current + 1))} style={s.nextBtn}>
                        <Text style={s.nextBtnText}>Next</Text>
                        <Ionicons name="chevron-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    timerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', ...SHADOWS.sm },
    timerCenter: { flexDirection: 'row', alignItems: 'center' },
    timerText: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginLeft: 4 },
    qCount: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
    progressBar: { height: 4, backgroundColor: COLORS.borderLight, marginHorizontal: 16 },
    progressFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
    scrollContent: { flex: 1, padding: 16 },
    questionNum: { fontSize: 12, fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase', marginBottom: 8 },
    questionText: { fontSize: 18, fontWeight: '600', color: COLORS.text, lineHeight: 28, marginBottom: 24 },
    option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: COLORS.border, ...SHADOWS.sm },
    optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryBgLight },
    optionCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    optionCircleSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    optionText: { fontSize: 15, color: COLORS.text, flex: 1, lineHeight: 22 },
    optionTextSelected: { fontWeight: '600', color: COLORS.primaryDark },
    navBar: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 32, backgroundColor: '#fff', ...SHADOWS.md },
    navBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
    navBtnDisabled: { opacity: 0.5 },
    navBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginLeft: 4 },
    nextBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, height: 52, borderRadius: 16, marginLeft: 12, ...SHADOWS.green },
    nextBtnText: { fontSize: 16, fontWeight: '600', color: '#fff', marginRight: 4 },
});
