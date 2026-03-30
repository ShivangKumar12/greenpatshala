// Edit Profile Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { GradientHeader, AnimatedButton } from '../../components/SharedComponents';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function EditProfileScreen({ navigation }: any) {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await authAPI.updateProfile({ name, phone, bio });
            updateUser({ name, phone, bio });
            Alert.alert('Success', 'Profile updated!');
            navigation.goBack();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Update failed');
        } finally { setLoading(false); }
    };

    const Field = ({ label, value, onChangeText, icon, multiline, delay }: any) => (
        <Animated.View entering={FadeInDown.delay(delay)} style={s.group}>
            <Text style={s.label}>{label}</Text>
            <View style={[s.inputWrap, multiline && { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                <Ionicons name={icon} size={20} color={COLORS.textSecondary} />
                <TextInput value={value} onChangeText={onChangeText} style={[s.input, multiline && { textAlignVertical: 'top' }]} multiline={multiline} />
            </View>
        </Animated.View>
    );

    return (
        <View style={s.container}>
            <GradientHeader title="Edit Profile" showBack onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Field label="Full Name" value={name} onChangeText={setName} icon="person-outline" delay={200} />
                <Field label="Phone" value={phone} onChangeText={setPhone} icon="call-outline" delay={300} />
                <Field label="Bio" value={bio} onChangeText={setBio} icon="create-outline" multiline delay={400} />
                <Animated.View entering={FadeInDown.delay(500)}>
                    <AnimatedButton title="Save Changes" onPress={handleSave} loading={loading} icon="checkmark-circle-outline" />
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
