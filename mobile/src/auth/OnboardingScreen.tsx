import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const appBadge = require('../../assets/adaptive-icon.png');

const slides = [
  {
    key: '1',
    eyebrow: 'FAST ALERTS',
    badge: 'Priority routing',
    title: 'Quick Emergency Reporting',
    desc: 'Report emergencies with one tap. Video, photos, and location are captured automatically.',
    color: '#ef4444',
    icon: '🚨',
    highlights: ['One-tap dispatch', 'Auto-captured evidence'],
  },
  {
    key: '2',
    eyebrow: 'LIVE MAP',
    badge: 'Real-time updates',
    title: 'Live Location Tracking',
    desc: 'Share your live location with family and responders so help can find you faster.',
    color: '#3b82f6',
    icon: '📍',
    highlights: ['Responder visibility', 'Family tracking'],
  },
  {
    key: '3',
    eyebrow: 'FAMILY CIRCLE',
    badge: 'Check-in ready',
    title: 'Family Safety Check-In',
    desc: 'Create a safety circle so loved ones can confirm status and coordinate during emergencies.',
    color: '#22c55e',
    icon: '👨‍👩‍👧',
    highlights: ['Status check-ins', 'Shared emergency view'],
  },
  {
    key: '4',
    eyebrow: 'BARANGAY SIGNAL',
    badge: 'Community alerts',
    title: 'Barangay Alerts',
    desc: 'Receive critical advisories, evacuation routes, and instructions when every second matters.',
    color: '#f59e0b',
    icon: '📢',
    highlights: ['Evacuation guidance', 'Verified local updates'],
  },
];

const withOpacity = (hex: string, opacity: number) => {
  const normalizedHex = hex.replace('#', '');
  if (normalizedHex.length !== 6) {
    return hex;
  }

  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

export const OnboardingScreen = ({ navigation }: any) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = slides[currentIndex];

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(nextIndex);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
      return;
    }

    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={styles.slide}>
            <View style={[styles.backgroundOrbLarge, { backgroundColor: withOpacity(slide.color, 0.24) }]} />
            <View style={[styles.backgroundOrbSmall, { backgroundColor: withOpacity(slide.color, 0.18) }]} />
            <View style={[styles.backgroundPanel, { borderColor: withOpacity(slide.color, 0.24) }]} />

            <View style={styles.content}>
              <View style={styles.topRow}>
                <View style={styles.brandPill}>
                  <Image source={appBadge} style={styles.brandIcon} />
                  <View>
                    <Text style={styles.brandTitle}>EmergencyTool</Text>
                    <Text style={styles.brandSubtitle}>Community-ready response</Text>
                  </View>
                </View>

                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.skipButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.heroWrap}>
                <View style={[styles.heroGlow, { backgroundColor: withOpacity(slide.color, 0.18) }]} />
                <View style={styles.heroCard}>
                  <View style={styles.heroCardTop}>
                    <Text style={[styles.eyebrow, { color: slide.color }]}>{slide.eyebrow}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          borderColor: withOpacity(slide.color, 0.36),
                          backgroundColor: withOpacity(slide.color, 0.12),
                        },
                      ]}
                    >
                      <View style={[styles.statusDot, { backgroundColor: slide.color }]} />
                      <Text style={[styles.statusText, { color: slide.color }]}>{slide.badge}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.featureRing,
                      {
                        borderColor: withOpacity(slide.color, 0.3),
                        backgroundColor: withOpacity(slide.color, 0.12),
                      },
                    ]}
                  >
                    <Text style={styles.featureIcon}>{slide.icon}</Text>
                  </View>

                  <Text style={styles.title}>{slide.title}</Text>
                  <Text style={styles.desc}>{slide.desc}</Text>

                  <View style={styles.highlightRow}>
                    {slide.highlights.map((item) => (
                      <View
                        key={item}
                        style={[
                          styles.highlightPill,
                          {
                            borderColor: withOpacity(slide.color, 0.2),
                            backgroundColor: withOpacity(slide.color, 0.08),
                          },
                        ]}
                      >
                        <Text style={styles.highlightText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const scale = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [1, 1.8, 1],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={slides[i].key}
                style={[
                  styles.dot,
                  {
                    backgroundColor: currentSlide.color,
                    opacity,
                    transform: [{ scale }],
                  },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: currentSlide.color }]}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08111d',
  },
  slide: {
    width,
    flex: 1,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backgroundOrbLarge: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -72,
    right: -88,
    opacity: 0.9,
  },
  backgroundOrbSmall: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    bottom: 120,
    left: -108,
  },
  backgroundPanel: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 42,
    bottom: 126,
    borderRadius: 36,
    borderWidth: 1,
    backgroundColor: 'rgba(8, 17, 29, 0.38)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  brandTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  brandSubtitle: {
    color: 'rgba(226, 232, 240, 0.72)',
    fontSize: 11,
    marginTop: 2,
  },
  skipButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  skipText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  heroWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: 78,
    opacity: 0.9,
  },
  heroCard: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 30,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    shadowColor: '#020617',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  heroCardTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  featureRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    marginTop: 26,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  featureIcon: {
    fontSize: 54,
  },
  title: {
    color: '#f8fafc',
    fontSize: 31,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
  },
  desc: {
    marginTop: 16,
    color: 'rgba(226, 232, 240, 0.88)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 25,
    maxWidth: 340,
  },
  highlightRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24,
  },
  highlightPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  highlightText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
    gap: 18,
    backgroundColor: '#08111d',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#020617',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  nextText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
