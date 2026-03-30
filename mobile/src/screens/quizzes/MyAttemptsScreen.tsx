// My Attempts Screen - Quiz history
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../theme/theme';
import { GradientHeader, LoadingSkeleton, EmptyState } from '../../components/SharedComponents';
import { quizzesAPI } from '../../services/api';

export default function MyAttemptsScreen({ navigation }: any) {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try { const res = await quizzesAPI.getMyAttempts(); setAttempts(res.data?.attempts || res.data?.data || []); }
        catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);
    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const renderItem = ({ item, index }: any) => (
        <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
            <TouchableOpacity style={s.card} onPress={() => navigation.navigate('QuizResult', { attemptId: item.id })} activeOpacity={0.9}>
                <View style={[s.statusDot, { backgroundColor: item.is_passed ? COLORS.success : COLORS.error }]} />
                <View style={{ flex: 1 }}>
                    <Text style={s.title} numberOfLines={1}>{item.quiz_title || `Quiz #${item.quiz_id}`}</Text>
                    <Text style={s.meta}>Score: {item.score}/{item.total_questions} • {item.percentage}%</Text>
                </View>
                <Text style={[s.badge, { color: item.is_passed ? COLORS.success : COLORS.error }]}>{item.is_passed ? 'PASSED' : 'FAILED'}</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <GradientHeader title="Quiz History" showBack onBack={() => navigation.goBack()} />
            {loading ? <LoadingSkeleton count={5} /> : attempts.length === 0 ? (
                <EmptyState icon="trophy-outline" title="No Attempts" message="Start taking quizzes to see your history" />
            ) : (
                <FlatList data={attempts} renderItem={renderItem} keyExtractor={item => item.id?.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 10, ...SHADOWS.md },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
    title: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    meta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    badge: { fontSize: 12, fontWeight: '700' },
});
