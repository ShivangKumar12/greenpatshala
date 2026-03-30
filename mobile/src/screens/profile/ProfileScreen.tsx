// Profile Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel' },
            { text: 'Logout', onPress: logout, style: 'destructive' },
        ]);
    };

    const MenuItem = ({ icon, label, onPress, color, delay }: any) => (
        <Animated.View entering={FadeInDown.delay(delay)}>
            <TouchableOpacity onPress={onPress} style={s.menuItem} activeOpacity={0.8}>
                <View style={[s.menuIcon, { backgroundColor: (color || COLORS.primary) + '15' }]}>
                    <Ionicons name={icon} size={22} color={color || COLORS.primary} />
                </View>
                <Text style={s.menuLabel}>{label}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={s.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={[COLORS.primaryDarker, COLORS.primary]} style={s.hero}>
                    <View style={s.avatarCircle}>
                        <Text style={s.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                    </View>
                    <Text style={s.userName}>{user?.name || 'Student'}</Text>
                    <Text style={s.userEmail}>{user?.email || ''}</Text>
                    {user?.phone && <Text style={s.userPhone}>{user.phone}</Text>}
                </LinearGradient>

                <View style={s.content}>
                    <Text style={s.sectionLabel}>Account</Text>
                    <View style={s.menuCard}>
                        <MenuItem icon="person-outline" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} delay={200} />
                        <MenuItem icon="lock-closed-outline" label="Change Password" onPress={() => navigation.navigate('ChangePassword')} delay={250} />
                        <MenuItem icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} delay={300} />
                    </View>

                    <Text style={s.sectionLabel}>Learning</Text>
                    <View style={s.menuCard}>
                        <MenuItem icon="book-outline" label="My Courses" onPress={() => navigation.navigate('MyCourses')} color="#3B82F6" delay={350} />
                        <MenuItem icon="help-circle-outline" label="Quiz History" onPress={() => navigation.navigate('MyAttempts')} color="#F59E0B" delay={400} />
                        <MenuItem icon="document-text-outline" label="Study Materials" onPress={() => navigation.navigate('StudyMaterials')} color="#8B5CF6" delay={450} />
                    </View>

                    <Text style={s.sectionLabel}>Support</Text>
                    <View style={s.menuCard}>
                        <MenuItem icon="chatbubble-outline" label="Send Feedback" onPress={() => navigation.navigate('Feedback')} color="#EC4899" delay={500} />
                        <MenuItem icon="information-circle-outline" label="About" onPress={() => { }} color="#06B6D4" delay={550} />
                    </View>

                    <Animated.View entering={FadeInDown.delay(600)}>
                        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn} activeOpacity={0.8}>
                            <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
                            <Text style={s.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Text style={s.version}>Unchi Udaan v1.0.0</Text>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    hero: { paddingTop: 50, paddingBottom: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
    userName: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 2 },
    userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    userPhone: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    content: { padding: 16 },
    sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', marginTop: 20, marginBottom: 8, marginLeft: 4 },
    menuCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', ...SHADOWS.md },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    menuIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.text },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', padding: 16, borderRadius: 14, marginTop: 24 },
    logoutText: { fontSize: 16, fontWeight: '600', color: COLORS.error, marginLeft: 8 },
    version: { textAlign: 'center', fontSize: 12, color: COLORS.textLight, marginTop: 20 },
});
