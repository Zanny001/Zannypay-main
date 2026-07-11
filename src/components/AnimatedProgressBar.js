import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';

// A smooth, flicker-free progress bar. Percentage animates with a spring so
// every deposit/withdraw or repayment feels alive rather than jumping.
export default function AnimatedProgressBar({ percentage = 0, color = colors.primary, height = 8, trackColor = '#EFEFEF' }) {
  const anim = useRef(new Animated.Value(0)).current;
  const clamped = Math.max(0, Math.min(100, percentage));

  useEffect(() => {
    Animated.spring(anim, {
      toValue: clamped,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [anim, clamped]); // <-- FIXED: Added clamped dependency

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.fill, { width, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});

