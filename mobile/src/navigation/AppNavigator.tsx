// Root App Navigator - Auth vs Main based on auth state
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

// Feature screens (accessible after login)
import CoursesScreen from '../screens/courses/CoursesScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import QuizDetailScreen from '../screens/quizzes/QuizDetailScreen';
import QuizAttemptScreen from '../screens/quizzes/QuizAttemptScreen';
import QuizResultScreen from '../screens/quizzes/QuizResultScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import CurrentAffairsScreen from '../screens/current-affairs/CurrentAffairsScreen';
import CurrentAffairDetailScreen from '../screens/current-affairs/CurrentAffairDetailScreen';
import StudyMaterialsScreen from '../screens/study-materials/StudyMaterialsScreen';
import MaterialDetailScreen from '../screens/study-materials/MaterialDetailScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import FeedbackScreen from '../screens/profile/FeedbackScreen';
import MyAttemptsScreen from '../screens/quizzes/MyAttemptsScreen';

import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../theme/theme';

const Stack = createNativeStackNavigator();

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
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthStack} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
                        <Stack.Screen name="QuizDetail" component={QuizDetailScreen} />
                        <Stack.Screen name="QuizAttempt" component={QuizAttemptScreen} options={{ gestureEnabled: false }} />
                        <Stack.Screen name="QuizResult" component={QuizResultScreen} options={{ gestureEnabled: false }} />
                        <Stack.Screen name="JobDetail" component={JobDetailScreen} />
                        <Stack.Screen name="CurrentAffairs" component={CurrentAffairsScreen} />
                        <Stack.Screen name="CurrentAffairDetail" component={CurrentAffairDetailScreen} />
                        <Stack.Screen name="StudyMaterials" component={StudyMaterialsScreen} />
                        <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} />
                        <Stack.Screen name="Feedback" component={FeedbackScreen} />
                        <Stack.Screen name="MyAttempts" component={MyAttemptsScreen} />
                        <Stack.Screen name="MyCourses" component={CoursesScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
