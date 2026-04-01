// Main Bottom Tab Navigator - 5 tabs matching web structure
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../theme/theme';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import TestSeriesScreen from '../screens/tests/TestSeriesScreen';
import CoursesScreen from '../screens/courses/CoursesScreen';
import StudyHubScreen from '../screens/study/StudyHubScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const tabConfig = [
    { name: 'HomeTab', component: HomeScreen, label: 'Home', icon: 'home' },
    { name: 'TestsTab', component: TestSeriesScreen, label: 'Tests', icon: 'clipboard' },
    { name: 'CoursesTab', component: CoursesScreen, label: 'Courses', icon: 'book' },
    { name: 'StudyTab', component: StudyHubScreen, label: 'Study', icon: 'library' },
    { name: 'ProfileTab', component: ProfileScreen, label: 'Profile', icon: 'person' },
];

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textLight,
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
                tabBarItemStyle: styles.tabItem,
            }}
        >
            {tabConfig.map(({ name, component, label, icon }) => (
                <Tab.Screen
                    key={name}
                    name={name}
                    component={component}
                    options={{
                        tabBarLabel: label,
                        tabBarIcon: ({ focused, color, size }) => (
                            <View style={styles.iconContainer}>
                                {focused && <View style={styles.activeIndicator} />}
                                <Ionicons
                                    name={(focused ? icon : `${icon}-outline`) as any}
                                    size={22}
                                    color={color}
                                />
                            </View>
                        ),
                    }}
                />
            ))}
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        height: Platform.OS === 'ios' ? 88 : 65,
        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        paddingTop: 8,
        ...SHADOWS.md,
    },
    tabLabel: {
        fontSize: FONTS.sizes.xs,
        fontWeight: FONTS.weights.medium,
        marginTop: 2,
    },
    tabItem: {
        paddingTop: 4,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    activeIndicator: {
        position: 'absolute',
        top: -10,
        width: 32,
        height: 3,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
});
