// App Navigator - Root navigator with auth flow and all screens
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/theme';

// Navigation
import MainTabs from './MainTabs';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Course Screens
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import CourseLearningScreen from '../screens/courses/CourseLearningScreen';

// Quiz Screens
import QuizDetailScreen from '../screens/quizzes/QuizDetailScreen';
import QuizAttemptScreen from '../screens/quizzes/QuizAttemptScreen';
import QuizResultScreen from '../screens/quizzes/QuizResultScreen';
import MyAttemptsScreen from '../screens/quizzes/MyAttemptsScreen';

// Test Series Screens
import TestChaptersScreen from '../screens/tests/TestChaptersScreen';
import TestListScreen from '../screens/tests/TestListScreen';

// Jobs
import JobDetailScreen from '../screens/jobs/JobDetailScreen';

// Current Affairs
import CurrentAffairDetailScreen from '../screens/current-affairs/CurrentAffairDetailScreen';

// Study Materials
import MaterialDetailScreen from '../screens/study-materials/MaterialDetailScreen';

// Profile
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import CertificatesScreen from '../screens/profile/CertificatesScreen';
import FeedbackScreen from '../screens/profile/FeedbackScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';

const Stack = createNativeStackNavigator();

// Auth Stack - login, register, OTP, forgot password
function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
    );
}

// Main Stack - all authenticated screens
function MainStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: COLORS.background },
            }}
        >
            {/* Main Tabs */}
            <Stack.Screen name="Main" component={MainTabs} />

            {/* Course Screens */}
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
            <Stack.Screen name="CourseLearning" component={CourseLearningScreen} />

            {/* Quiz Screens */}
            <Stack.Screen name="QuizDetail" component={QuizDetailScreen} />
            <Stack.Screen
                name="QuizAttempt"
                component={QuizAttemptScreen}
                options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="QuizResult" component={QuizResultScreen} />
            <Stack.Screen name="MyAttempts" component={MyAttemptsScreen} />

            {/* Test Series Drill-down */}
            <Stack.Screen name="TestChapters" component={TestChaptersScreen} />
            <Stack.Screen name="TestList" component={TestListScreen} />

            {/* Job Detail */}
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />

            {/* Current Affair Detail */}
            <Stack.Screen name="CurrentAffairDetail" component={CurrentAffairDetailScreen} />

            {/* Study Material Detail */}
            <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} />

            {/* Profile Screens */}
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="Certificates" component={CertificatesScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
}
