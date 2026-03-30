// Forgot Password Screen
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { AnimatedButton } from '../../components/SharedComponents';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordScreen({ navigation }: any) {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        setLoading(true);
        try {
            await forgotPassword(email.trim());
            setSent(true);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={styles.topGradient}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.content}>
                <Animated.View entering={ZoomIn.delay(200)} style={styles.iconCircle}>
                    <Ionicons name={sent ? 'checkmark-circle' : 'key'} size={48} color={COLORS.primary} />
                </Animated.View>

                {sent ? (
                    <>
                        <Animated.Text entering={FadeInDown.delay(300)} style={styles.title}>Check Your Email</Animated.Text>
                        <Animated.Text entering={FadeInDown.delay(400)} style={styles.subtitle}>
                            We've sent a password reset link to your email address. Please check your inbox.
                        </Animated.Text>
                        <Animated.View entering={FadeInDown.delay(500)}>
                            <AnimatedButton title="Back to Login" onPress={() => navigation.navigate('Login')} icon="log-in-outline" />
                        </Animated.View>
                    </>
                ) : (
                    <>
                        <Animated.Text entering={FadeInDown.delay(300)} style={styles.title}>Forgot Password?</Animated.Text>
                        <Animated.Text entering={FadeInDown.delay(400)} style={styles.subtitle}>
                            Enter your email address and we'll send you a link to reset your password.
                        </Animated.Text>
                        <Animated.View entering={FadeInDown.delay(500)} style={styles.inputGroup}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    placeholderTextColor={COLORS.placeholder}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    style={styles.input}
                                />
                            </View>
                        </Animated.View>
                        <Animated.View entering={FadeInDown.delay(600)} style={{ width: '100%' }}>
                            <AnimatedButton title="Send Reset Link" onPress={handleSubmit} loading={loading} icon="send-outline" />
                        </Animated.View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    topGradient: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING['3xl'] },
    iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl },
    title: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
    subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: SPACING['2xl'] },
    inputGroup: { width: '100%', marginBottom: SPACING.xl },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.base, height: 52, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
    input: { flex: 1, fontSize: FONTS.sizes.base, color: COLORS.text, marginLeft: SPACING.sm },
});
