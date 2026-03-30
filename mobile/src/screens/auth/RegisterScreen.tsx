// Register Screen - Animated registration with green theme
import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { AnimatedButton } from '../../components/SharedComponents';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() || undefined });
            Alert.alert('Success', 'Please verify your email with the OTP sent to you.');
            navigation.navigate('OTP', { email: email.trim() });
        } catch (error: any) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, value, onChangeText, placeholder, icon, keyboardType, secure, delay }: any) => (
        <Animated.View entering={FadeInDown.delay(delay)} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputContainer}>
                <Ionicons name={icon} size={20} color={COLORS.textSecondary} />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType={keyboardType || 'default'}
                    autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
                    secureTextEntry={secure && !showPassword}
                    style={styles.input}
                />
                {secure && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primaryDarker, COLORS.primary]}
                style={styles.topGradient}
            >
                <Animated.View entering={BounceIn.delay(200)} style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Create Account</Text>
                        <Text style={styles.headerSubtitle}>Join thousands of learners</Text>
                    </View>
                </Animated.View>
            </LinearGradient>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <InputField label="Full Name *" value={name} onChangeText={setName} placeholder="Enter your full name" icon="person-outline" delay={300} />
                    <InputField label="Email *" value={email} onChangeText={setEmail} placeholder="Enter your email" icon="mail-outline" keyboardType="email-address" delay={400} />
                    <InputField label="Phone (Optional)" value={phone} onChangeText={setPhone} placeholder="Enter phone number" icon="call-outline" keyboardType="phone-pad" delay={500} />
                    <InputField label="Password *" value={password} onChangeText={setPassword} placeholder="Create a password" icon="lock-closed-outline" secure delay={600} />
                    <InputField label="Confirm Password *" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm your password" icon="lock-closed-outline" secure delay={700} />

                    <Animated.View entering={FadeInDown.delay(800)}>
                        <AnimatedButton title="Create Account" onPress={handleRegister} loading={loading} icon="person-add-outline" />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(900)} style={styles.loginRow}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    topGradient: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    headerTitle: { fontSize: FONTS.sizes['2xl'], fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    headerSubtitle: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    scrollContent: { padding: SPACING.xl, paddingTop: SPACING.xl },
    inputGroup: { marginBottom: SPACING.base },
    inputLabel: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: SPACING.sm },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.base, height: 52, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
    input: { flex: 1, fontSize: FONTS.sizes.base, color: COLORS.text, marginLeft: SPACING.sm },
    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl, marginBottom: SPACING['2xl'] },
    loginText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
    loginLink: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.primary },
});
