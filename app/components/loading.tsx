import React, { useEffect, useRef } from 'react'
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Animated,
  Dimensions,
  ViewStyle,
  StyleProp
} from 'react-native'
import colors from '../../assets/colors'

const { width } = Dimensions.get('window')

type SkeletonProps = {
  style?: StyleProp<ViewStyle>
  translateX: Animated.Value
}

const Skeleton = ({ style, translateX }: SkeletonProps) => (
  <View style={[styles.skeleton, style]}>
    <Animated.View
      style={[
        styles.shimmer,
        {
          transform: [{ translateX }]
        }
      ]}
    />
  </View>
)

export default function LoadingComponent () {
  const translateX = useRef(new Animated.Value(-width)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: width,
        duration: 1200,
        useNativeDriver: true
      })
    )

    animation.start()

    return () => animation.stop()
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.skeletonContainer}>
        <Skeleton
          translateX={translateX}
          style={{ height: 72, marginBottom: 16 }}
        />
        <Skeleton
          translateX={translateX}
          style={{ height: 50, marginBottom: 16 }}
        />
        <Skeleton
          translateX={translateX}
          style={{ height: 50, marginBottom: 16 }}
        />
        <Skeleton
          translateX={translateX}
          style={{ height: 50, marginBottom: 16 }}
        />
        <Skeleton
          translateX={translateX}
          style={{ height: 50, marginBottom: 16 }}
        />
        <Skeleton
          translateX={translateX}
          style={{ height: 72, marginBottom: 16 }}
        />
        <Skeleton
          translateX={translateX}
          style={{ height: 50, marginBottom: 16 }}
        />
        <Skeleton
          translateX={translateX}
          style={{ height: 70, marginBottom: 16 }}
        />
        <Skeleton
          translateX={translateX}
          style={{ height: 40, marginBottom: 16 }}
        />
        <Skeleton
          translateX={translateX}
          style={{ height: 70, marginBottom: 16 }}
        />
        <Skeleton
          translateX={translateX}
          style={{ height: 40, marginBottom: 16 }}
        />
      </View>

      <View style={styles.overlay}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20
  },
  skeleton: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 12,
    overflow: 'hidden'
  },
  shimmer: {
    width: width * 0.6,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.primary,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  }
})
