import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 375;   // iPhone 11 tasarım referansı
const guidelineBaseHeight = 812;

/* Responsive ölçek faktörleri */
export const horizontalScale = (size: number) =>
  (width / guidelineBaseWidth) * size;

export const verticalScale = (size: number) =>
  (height / guidelineBaseHeight) * size;

export const moderateScale = (size: number, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

/* Hızlı sabitler */
export const Metrics = {
  screenWidth: width,
  screenHeight: height,
  spacing: {
    xs: horizontalScale(4),
    sm: horizontalScale(8),
    md: horizontalScale(16),
    lg: horizontalScale(24),
    xl: horizontalScale(32),
  },
  font: {
    xs: moderateScale(12),
    sm: moderateScale(14),
    md: moderateScale(16),
    lg: moderateScale(20),
    xl: moderateScale(24),
  },
  radius: {
    sm: moderateScale(4),
    md: moderateScale(8),
    lg: moderateScale(12),
  },
};