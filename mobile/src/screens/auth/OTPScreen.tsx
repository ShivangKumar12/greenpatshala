// OTP Verification Screen
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, BounceIn, ZoomIn } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { AnimatedButton } from '../../components/SharedComponents';
import { useAuth } from '../../context/AuthContext';

export default function OTPScreen({ navigation, route }: any) {
    const { verifyOTP, resendOTP } = useAuth();
    const email = route.params?.email || '';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const inputs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            Alert.alert('Error', 'Please enter the complete OTP');
            return;
        }
        setLoading(true);
        try {
            await verifyOTP(email, otpString);
        } catch (error: any) {
            Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await resendOTP(email);
            setCountdown(60);
            Alert.alert('Success', 'OTP resent to your email');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
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
                    <Ionicons name="shield-checkmark" size={48} color={COLORS.primary} />
                </Animated.View>

                <Animated.Text entering={FadeInDown.delay(300)} style={styles.title}>Verify Your Email</Animated.Text>
                <Animated.Text entering={FadeInDown.delay(400)} style={styles.subtitle}>
                    We've sent a 6-digit code to{'\n'}
                    <Text style={styles.emailText}>{email}</Text>
                </Animated.Text>

                <Animated.View entering={FadeInDown.delay(500)} style={styles.otpRow}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputs.current[index] = ref; }}
                            value={digit}
                            onChangeText={(val) => handleOtpChange(val, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                        />
                    ))}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(600)}>
                    <AnimatedButton title="Verify OTP" onPress={handleVerify} loading={loading} icon="checkmark-circle-outline" />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(700)} style={styles.resendRow}>
                    {countdown > 0 ? (
                        <Text style={styles.resendText}>Resend OTP in <Text style={styles.countdownText}>{countdown}s</Text></Text>
                    ) : (
                        <TouchableOpacity onPress={handleResend}>
                            <Text style={styles.resendLink}>Resend OTP</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
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
    emailText: { fontWeight: FONTS.weights.bold, color: COLORS.primary },
    otpRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING['2xl'], gap: 10 },
    otpInput: { width: 48, height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border, textAlign: 'center', fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text, ...SHADOWS.sm },
    otpInputFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryBgLight },
    resendRow: { marginTop: SPACING.xl, alignItems: 'center' },
    resendText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
    countdownText: { fontWeight: FONTS.weights.bold, color: COLORS.primary },
    resendLink: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.primary },
});
