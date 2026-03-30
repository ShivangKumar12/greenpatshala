// Notifications Screen
import React from 'react';
import { View } from 'react-native';
import { COLORS } from '../../theme/theme';
import { GradientHeader, EmptyState } from '../../components/SharedComponents';

export default function NotificationsScreen({ navigation }: any) {
    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <GradientHeader title="Notifications" showBack onBack={() => navigation.goBack()} />
            <EmptyState
                icon="notifications-outline"
                title="No Notifications"
                message="You'll see important updates and alerts here"
            />
        </View>
    );
}
