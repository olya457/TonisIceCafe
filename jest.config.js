module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!((@)?react-native|@react-native(-community)?|@react-native-async-storage|@react-navigation|react-native-screens|react-native-safe-area-context)/)',
  ],
  moduleNameMapper: {
    '\\.(mp4|wav)$': '<rootDir>/node_modules/react-native/jest/mockComponent.js',
  },
};
