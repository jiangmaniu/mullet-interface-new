import Constants from 'expo-constants'

import { ExpoConfigExtra } from '~/types/expo'

export const EXPO_ENV_CONFIG: ExpoConfigExtra = Constants.expoConfig?.extra as ExpoConfigExtra
