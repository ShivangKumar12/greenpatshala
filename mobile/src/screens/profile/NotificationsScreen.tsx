// Notifications Screen - Notification preferences
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';

export default function NotificationsScreen({ navigation }: any) {
    return (
        <View style={s.container}>
            <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.header}>
                <View style={s.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Ionicons name="arrow-back" size={22} color={COLORS.textWhite} /></TouchableOpacity>
                    <Text style={s.headerTitle}>Notifications</Text>
                </View>
            </LinearGradient>
            <Animated.View entering={FadeInDown.delay(100)} style={s.empty}>
                <View style={s.emptyIcon}><Ionicons name="notifications-off-outline" size={48} color={COLORS.textLight} /></View>
                <Text style={s.emptyTitle}>No Notifications</Text>
                <Text style={s.emptyMsg}>You'll receive updates about courses, quizzes, and jobs here.</Text>
            </Animated.View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: SPACING.base, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.textWhite },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.borderLight, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
    emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
    emptyMsg: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
});
