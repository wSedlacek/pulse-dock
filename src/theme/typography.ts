import { Platform, type TextStyle } from 'react-native';

/** Prefer SF Pro on iOS; clean system stack elsewhere. */
const sans = Platform.select({
  ios: undefined,
  default: 'System',
});

export const typography = {
  largeTitle: {
    fontFamily: sans,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
  } satisfies TextStyle,
  title1: {
    fontFamily: sans,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.36,
  } satisfies TextStyle,
  title2: {
    fontFamily: sans,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.35,
  } satisfies TextStyle,
  title3: {
    fontFamily: sans,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.38,
  } satisfies TextStyle,
  headline: {
    fontFamily: sans,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  } satisfies TextStyle,
  body: {
    fontFamily: sans,
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  } satisfies TextStyle,
  callout: {
    fontFamily: sans,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.32,
  } satisfies TextStyle,
  subhead: {
    fontFamily: sans,
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.24,
  } satisfies TextStyle,
  footnote: {
    fontFamily: sans,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.08,
  } satisfies TextStyle,
  caption1: {
    fontFamily: sans,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
  } satisfies TextStyle,
  caption2: {
    fontFamily: sans,
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.07,
  } satisfies TextStyle,
} as const;
