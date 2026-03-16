import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const LAYOUT = {
  screenWidth: width,
  screenHeight: height,
  cardWidth: width * 0.88,
  cardHeight: 200,
  idCardWidth: width * 0.88,
  idCardHeight: 220,
  borderRadius: 12,
  borderRadiusLarge: 20,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    title: 36,
  },
};
