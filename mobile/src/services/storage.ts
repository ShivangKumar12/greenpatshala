// Async Storage wrapper for persisting data
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    TOKEN: '@unchiudaan_token',
    USER: '@unchiudaan_user',
    ONBOARDED: '@unchiudaan_onboarded',
    THEME: '@unchiudaan_theme',
};

export const storage = {
    // Token
    setToken: async (token: string) => {
        await AsyncStorage.setItem(KEYS.TOKEN, token);
    },
    getToken: async (): Promise<string | null> => {
        return AsyncStorage.getItem(KEYS.TOKEN);
    },
    removeToken: async () => {
        await AsyncStorage.removeItem(KEYS.TOKEN);
    },

    // User data
    setUser: async (user: any) => {
        await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    },
    getUser: async (): Promise<any | null> => {
        const data = await AsyncStorage.getItem(KEYS.USER);
        return data ? JSON.parse(data) : null;
    },
    removeUser: async () => {
        await AsyncStorage.removeItem(KEYS.USER);
    },

    // Onboarding
    setOnboarded: async () => {
        await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
    },
    getOnboarded: async (): Promise<boolean> => {
        const val = await AsyncStorage.getItem(KEYS.ONBOARDED);
        return val === 'true';
    },

    // Clear all
    clearAll: async () => {
        await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
    },
};
