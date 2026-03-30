// Change Password Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../theme/theme';
import { GradientHeader, AnimatedButton } from '../../components/SharedComponents';
import { authAPI } from '../../services/api';

export default function ChangePasswordScreen({ navigation }: any) {
    const [current, setCurrent] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = async () => {
        if (!current || !newPass || !confirm) { Alert.alert('Error', 'Fill all fields'); return; }
        if (newPass !== confirm) { Alert.alert('Error', 'Passwords do not match'); return; }
        if (newPass.length < 6) { Alert.alert('Error', 'Min 6 characters'); return; }
        setLoading(true);
        try {
            await authAPI.changePassword({ currentPassword: current, newPassword: newPass });
            Alert.alert('Success', 'Password changed!');
            navigation.goBack();
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    const Field = ({ label, value, onChangeText, delay }: any) => (
        <Animated.View entering={FadeInDown.delay(delay)} style={s.group}>
            <Text style={s.label}>{label}</Text>
            <View style={s.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
                <TextInput value={value} onChangeText={onChangeText} secureTextEntry style={s.input} />
            </View>
        </Animated.View>
    );

    return (
        <View style={s.container}>
            <GradientHeader title="Change Password" showBack onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
                <Field label="Current Password" value={current} onChangeText={setCurrent} delay={200} />
                <Field label="New Password" value={newPass} onChangeText={setNewPass} delay={300} />
                <Field label="Confirm New Password" value={confirm} onChangeText={setConfirm} delay={400} />
                <Animated.View entering={FadeInDown.delay(500)}>
                    <AnimatedButton title="Change Password" onPress={handleChange} loading={loading} icon="key-outline" />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 16 },
    group: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 52, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
    input: { flex: 1, fontSize: 15, color: COLORS.text, marginLeft: 10 },
});
