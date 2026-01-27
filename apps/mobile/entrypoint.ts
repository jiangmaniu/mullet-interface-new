// "main": "expo-router/entry",

// Import required polyfills first
import 'fast-text-encoding'
import 'react-native-get-random-values'
import '@ethersproject/shims'

import {Buffer} from 'buffer';

// Then import the expo router
import 'expo-router/entry'
global.Buffer = Buffer;
