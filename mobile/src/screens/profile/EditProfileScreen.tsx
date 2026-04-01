// Edit Profile Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function EditProfileScreen({ navigation }: any) {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) { Alert.alert('Error', 'Name is required.'); return; }
        try {
            setSaving(true);
            await authAPI.updateProfile({ name: name.trim(), phone: phone.trim() });
            if (refreshUser) await refreshUser();
            Alert.alert('✅ Updated', 'Profile updated successfully.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update');
        } finally { setSaving(false); }
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.header}>
                <View style={s.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Ionicons name="arrow-back" size={22} color={COLORS.textWhite} /></TouchableOpacity>
                    <Text style={s.headerTitle}>Edit Profile</Text>
                </View>
            </LinearGradient>

            <View style={s.content}>
                <Animated.View entering={FadeInDown.delay(100)} style={s.avatarSection}>
                    <View style={s.avatar}><Text style={s.avatarText}>{(name || 'S')[0].toUpperCase()}</Text></View>
                    <Text style={s.email}>{user?.email}</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200)}>
                    <Text style={s.label}>Full Name</Text>
                    <TextInput value={name} onChangeText={setName} placeholder="Enter your name" placeholderTextColor={COLORS.placeholder} style={s.input} />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(250)}>
                    <Text style={s.label}>Phone Number</Text>
                    <TextInput value={phone} onChangeText={setPhone} placeholder="Enter phone number" placeholderTextColor={COLORS.placeholder} style={s.input} keyboardType="phone-pad" />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300)}>
                    <Text style={s.label}>Email</Text>
                    <View style={[s.input, s.disabledInput]}><Text style={s.disabledText}>{user?.email}</Text></View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(350)}>
                    <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                        {saving ? <ActivityIndicator color={COLORS.textWhite} /> : <Text style={s.saveBtnText}>Save Changes</Text>}
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
    avatarSection: { alignItems: 'center', marginBottom: SPACING.xl },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primaryBg, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
    avatarText: { fontSize: FONTS.sizes['3xl'], fontWeight: FONTS.weights.bold, color: COLORS.primary },
    email: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
    label: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.md },
    input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
    disabledInput: { backgroundColor: COLORS.borderLight },
    disabledText: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
    saveBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, marginTop: SPACING.xl, ...SHADOWS.green },
    saveBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
});
