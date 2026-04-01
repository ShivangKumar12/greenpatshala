// Change Password Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { authAPI } from '../../services/api';

export default function ChangePasswordScreen({ navigation }: any) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const handleChange = async () => {
        if (!currentPassword) { Alert.alert('Error', 'Current password is required.'); return; }
        if (newPassword.length < 6) { Alert.alert('Error', 'New password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { Alert.alert('Error', 'Passwords do not match.'); return; }
        try {
            setSaving(true);
            await authAPI.changePassword({ currentPassword, newPassword });
            Alert.alert('✅ Updated', 'Password changed successfully.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to change password');
        } finally { setSaving(false); }
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.header}>
                <View style={s.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Ionicons name="arrow-back" size={22} color={COLORS.textWhite} /></TouchableOpacity>
                    <Text style={s.headerTitle}>Change Password</Text>
                </View>
            </LinearGradient>

            <View style={s.content}>
                <Animated.View entering={FadeInDown.delay(100)} style={s.lockIcon}>
                    <Ionicons name="lock-closed" size={32} color={COLORS.primary} />
                </Animated.View>

                {[
                    { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                    { label: 'New Password', value: newPassword, setter: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew) },
                    { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, show: showNew, toggle: () => {} },
                ].map((field, i) => (
                    <Animated.View key={field.label} entering={FadeInDown.delay(150 + i * 50)}>
                        <Text style={s.label}>{field.label}</Text>
                        <View style={s.inputRow}>
                            <TextInput value={field.value} onChangeText={field.setter} placeholder={field.label} placeholderTextColor={COLORS.placeholder} style={s.input} secureTextEntry={!field.show} />
                            {i < 2 && <TouchableOpacity onPress={field.toggle} style={s.eyeBtn}><Ionicons name={field.show ? 'eye-off' : 'eye'} size={20} color={COLORS.textLight} /></TouchableOpacity>}
                        </View>
                    </Animated.View>
                ))}

                <Animated.View entering={FadeInDown.delay(350)}>
                    <TouchableOpacity style={s.saveBtn} onPress={handleChange} disabled={saving}>
                        {saving ? <ActivityIndicator color={COLORS.textWhite} /> : <Text style={s.saveBtnText}>Change Password</Text>}
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
    lockIcon: { alignItems: 'center', marginVertical: SPACING.lg, width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignSelf: 'center' },
    label: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.md },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
    input: { flex: 1, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text },
    eyeBtn: { paddingHorizontal: SPACING.md },
    saveBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, marginTop: SPACING.xl, ...SHADOWS.green },
    saveBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
});
