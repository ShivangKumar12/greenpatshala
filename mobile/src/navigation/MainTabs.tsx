// Main Tabs Navigator with green-themed bottom tabs
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../theme/theme';
import HomeScreen from '../screens/home/HomeScreen';
import CoursesScreen from '../screens/courses/CoursesScreen';
import QuizzesScreen from '../screens/quizzes/QuizzesScreen';
import JobsScreen from '../screens/jobs/JobsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';
                    switch (route.name) {
                        case 'HomeTab': iconName = focused ? 'home' : 'home-outline'; break;
                        case 'CoursesTab': iconName = focused ? 'book' : 'book-outline'; break;
                        case 'QuizzesTab': iconName = focused ? 'help-circle' : 'help-circle-outline'; break;
                        case 'JobsTab': iconName = focused ? 'briefcase' : 'briefcase-outline'; break;
                        case 'ProfileTab': iconName = focused ? 'person' : 'person-outline'; break;
                    }
                    return (
                        <View style={focused ? styles.activeTab : undefined}>
                            <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />
                        </View>
                    );
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textLight,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: -2,
                },
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0,
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 8,
                    ...SHADOWS.lg,
                },
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name="CoursesTab" component={CoursesScreen} options={{ tabBarLabel: 'Courses' }} />
            <Tab.Screen name="QuizzesTab" component={QuizzesScreen} options={{ tabBarLabel: 'Quizzes' }} />
            <Tab.Screen name="JobsTab" component={JobsScreen} options={{ tabBarLabel: 'Jobs' }} />
            <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    activeTab: {
        backgroundColor: COLORS.primaryBg,
        borderRadius: 12,
        padding: 6,
    },
});
