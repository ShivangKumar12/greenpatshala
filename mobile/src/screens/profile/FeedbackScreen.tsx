// Feedback Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../theme/theme';
import { GradientHeader, AnimatedButton } from '../../components/SharedComponents';
import { feedbackAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TouchableOpacity } from 'react-native';

export default function FeedbackScreen({ navigation }: any) {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) { Alert.alert('Error', 'Please write your feedback'); return; }
        setLoading(true);
        try {
            await feedbackAPI.submit({ name: user?.name || 'Student', email: user?.email, message, rating });
            Alert.alert('Thank You!', 'Your feedback has been submitted.');
            navigation.goBack();
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    return (
        <View style={s.container}>
            <GradientHeader title="Send Feedback" showBack onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
                <Animated.View entering={FadeInDown.delay(200)}>
                    <Text style={s.label}>Rating</Text>
                    <View style={s.starsRow}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <TouchableOpacity key={i} onPress={() => setRating(i)}>
                                <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={36} color={i <= rating ? '#F59E0B' : COLORS.border} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(300)} style={s.group}>
                    <Text style={s.label}>Your Feedback</Text>
                    <TextInput value={message} onChangeText={setMessage} placeholder="Tell us your experience..." placeholderTextColor={COLORS.placeholder} multiline style={s.textarea} textAlignVertical="top" />
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(400)}>
                    <AnimatedButton title="Submit Feedback" onPress={handleSubmit} loading={loading} icon="send-outline" />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 16 },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
    starsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    group: { marginBottom: 20 },
    textarea: { backgroundColor: '#fff', borderRadius: 14, padding: 14, fontSize: 15, color: COLORS.text, minHeight: 150, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
});
