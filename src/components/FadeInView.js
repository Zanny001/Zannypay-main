import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Wraps any content with a gentle fade + slide-up entrance. Used across the
// new Elite Modules (Savings, Flexi Credit, Beneficiaries, QR, Notifications)
// so every screen feels consistent and polished on mount.
export default function FadeInView({ children, delay = 0, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, friction: 9, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
