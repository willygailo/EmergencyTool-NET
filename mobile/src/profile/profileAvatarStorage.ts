import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_AVATAR_KEY = '@profile_avatar';

export const loadProfileAvatar = async () => {
  return AsyncStorage.getItem(PROFILE_AVATAR_KEY);
};

export const saveProfileAvatar = async (avatarUri: string) => {
  await AsyncStorage.setItem(PROFILE_AVATAR_KEY, avatarUri);
};

export const removeProfileAvatar = async () => {
  await AsyncStorage.removeItem(PROFILE_AVATAR_KEY);
};
