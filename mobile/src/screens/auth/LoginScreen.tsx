// Login Screen - Premium green-themed login with animations
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, BounceIn } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { AnimatedButton } from '../../components/SharedComponents';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const result = await login(email.trim(), password);
            if (result?.requiresOTP) {
                navigation.navigate('OTP', { email: email.trim() });
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Login failed. Please try again.';
            if (msg.includes('verify') || msg.includes('OTP')) {
                navigation.navigate('OTP', { email: email.trim() });
            } else {
                Alert.alert('Login Failed', msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primaryDarker, COLORS.primary, COLORS.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.topGradient}
            >
                <Animated.View entering={BounceIn.delay(200)} style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="rocket" size={40} color={COLORS.primary} />
                    </View>
                </Animated.View>
                <Animated.Text entering={FadeInDown.delay(400)} style={styles.brandTitle}>
                    Unchi Udaan
                </Animated.Text>
                <Animated.Text entering={FadeInDown.delay(500)} style={styles.brandSubtitle}>
                    Elevate Your Learning Journey
                </Animated.Text>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.formContainer}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.Text entering={FadeInDown.delay(300)} style={styles.welcomeTitle}>
                        Welcome Back! 👋
                    </Animated.Text>
                    <Animated.Text entering={FadeInDown.delay(400)} style={styles.welcomeSubtitle}>
                        Sign in to continue your learning
                    </Animated.Text>

                    <Animated.View entering={FadeInDown.delay(500)} style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
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

                    <Animated.View entering={FadeInDown.delay(600)} style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter your password"
                                placeholderTextColor={COLORS.placeholder}
                                secureTextEntry={!showPassword}
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={COLORS.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(650)}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={styles.forgotBtn}
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(700)}>
                        <AnimatedButton
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            icon="log-in-outline"
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(800)} style={styles.signupRow}>
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    topGradient: {
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    logoContainer: {
        marginBottom: SPACING.md,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.textWhite,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.lg,
    },
    brandTitle: {
        fontSize: FONTS.sizes['3xl'],
        fontWeight: FONTS.weights.extrabold,
        color: COLORS.textWhite,
    },
    brandSubtitle: {
        fontSize: FONTS.sizes.md,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
    },
    formContainer: {
        flex: 1,
        marginTop: -10,
    },
    scrollContent: {
        padding: SPACING.xl,
        paddingTop: SPACING['2xl'],
    },
    welcomeTitle: {
        fontSize: FONTS.sizes['2xl'],
        fontWeight: FONTS.weights.bold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    welcomeSubtitle: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        marginBottom: SPACING['2xl'],
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    inputLabel: {
        fontSize: FONTS.sizes.md,
        fontWeight: FONTS.weights.semibold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.base,
        height: 52,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    input: {
        flex: 1,
        fontSize: FONTS.sizes.base,
        color: COLORS.text,
        marginLeft: SPACING.sm,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.xl,
    },
    forgotText: {
        fontSize: FONTS.sizes.md,
        fontWeight: FONTS.weights.semibold,
        color: COLORS.primary,
    },
    signupRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
    },
    signupText: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
    },
    signupLink: {
        fontSize: FONTS.sizes.md,
        fontWeight: FONTS.weights.bold,
        color: COLORS.primary,
    },
});
