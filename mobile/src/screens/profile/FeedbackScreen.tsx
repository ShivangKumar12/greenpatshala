// Feedback Screen - Star rating with message submission
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { feedbackAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function FeedbackScreen({ navigation }: any) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [name, setName] = useState(user?.name || '');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) { Alert.alert('Rating Required', 'Please select a rating.'); return; }
        if (!name.trim()) { Alert.alert('Name Required', 'Please enter your name.'); return; }
        if (!message.trim()) { Alert.alert('Message Required', 'Please enter your feedback.'); return; }
        try {
            setSubmitting(true);
            await feedbackAPI.submit({ name: name.trim(), message: message.trim(), rating, email: user?.email });
            Alert.alert('🎉 Thank You!', 'Your feedback has been submitted.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to submit feedback');
        } finally { setSubmitting(false); }
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.header}>
                <View style={s.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Feedback</Text>
                </View>
            </LinearGradient>

            <View style={s.content}>
                <Animated.View entering={FadeInDown.delay(100)} style={s.ratingCard}>
                    <Text style={s.ratingLabel}>How was your experience?</Text>
                    <View style={s.starsRow}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <TouchableOpacity key={i} onPress={() => setRating(i)} style={s.starBtn}>
                                <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={36} color={i <= rating ? '#F59E0B' : COLORS.textLight} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={s.ratingText}>{rating === 0 ? 'Tap to rate' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200)}>
                    <Text style={s.label}>Name</Text>
                    <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={COLORS.placeholder} style={s.input} />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300)}>
                    <Text style={s.label}>Your Feedback</Text>
                    <TextInput value={message} onChangeText={setMessage} placeholder="Share your thoughts..." placeholderTextColor={COLORS.placeholder} style={[s.input, s.textArea]} multiline numberOfLines={5} textAlignVertical="top" />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)}>
                    <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
                        {submitting ? <ActivityIndicator color={COLORS.textWhite} /> : (
                            <><Ionicons name="send" size={18} color={COLORS.textWhite} /><Text style={s.submitText}>Submit Feedback</Text></>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    content: { padding: SPACING.base },
    ratingCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg, ...SHADOWS.card },
    ratingLabel: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: SPACING.md },
    starsRow: { flexDirection: 'row', gap: SPACING.sm },
    starBtn: { padding: 4 },
    ratingText: { fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: FONTS.weights.semibold, marginTop: SPACING.sm },
    label: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.sm },
    input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
    textArea: { height: 120, paddingTop: SPACING.md },
    submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, marginTop: SPACING.lg, gap: 8, ...SHADOWS.green },
    submitText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
});
