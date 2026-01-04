import React from "react";
import { View, StyleSheet, ActivityIndicator, Animated, Dimensions } from "react-native";
import colors from "../../assets/colors";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function LoadingComponent() {
  return (
    <View style={styles.container}>
      {/* Spinner */}
      {/* <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 32 }} /> */}

      {/* Page Skeleton */}
      <View style={styles.skeletonContainer}>
        {/* Title */}
        <Animated.View style={[styles.skeleton, { width: "90%", height: 72, marginBottom: 16 }]} />
        {/* Subtitle */}
        <Animated.View style={[styles.skeleton, { width: "40%", height: 20, marginBottom: 32 }]} />

        {/* Input fields */}
        <Animated.View style={[styles.skeleton, { width: "40%", height: 70, marginBottom: 16 }]} />
        <Animated.View style={[styles.skeleton, { width: "90%", height: 100, marginBottom: 16 }]} />
        <Animated.View style={[styles.skeleton, { width: "90%", height: 50, marginBottom: 16 }]} />
        <Animated.View style={[styles.skeleton, { width: "90%", height: 60, marginBottom: 16 }]} />
        <Animated.View style={[styles.skeleton, { width: "90%", height: 70, marginBottom: 16 }]} />
        <Animated.View style={[styles.skeleton, { width: "90%", height: 100, marginBottom: 16 }]} />
        <Animated.View style={[styles.skeleton, { width: "90%", height: 50, marginBottom: 16 }]} />
        <Animated.View style={[styles.skeleton, { width: "90%", height: 60, marginBottom: 16 }]} />

        {/* Button */}
        <Animated.View style={[styles.skeleton, { width: "90%", height: 50, borderRadius: 12, marginTop: 16 }]} />
        <Animated.View style={[styles.skeleton, { width: "90%", height: 50, borderRadius: 12, marginTop: 16 }]} />
        <Animated.View style={[styles.skeleton, { width: "90%", height: 50, borderRadius: 12, marginTop: 16 }]} />
        <Animated.View style={[styles.skeleton, { width: "90%", height: 50, borderRadius: 12, marginTop: 16 }]} />
        {/* Footer */}
        <View style={styles.footer}>
          <Animated.View style={[styles.skeleton, { width: 100, height: 16 }]} />
          <Animated.View style={[styles.skeleton, { width: 60, height: 16, marginLeft: 8 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 14
  },
  skeletonContainer: {
    width: "100%",
    alignItems: "center"
  },
  skeleton: {
    backgroundColor: colors.accent,
    borderRadius: 12
  },
  footer: {
    flexDirection: "row",
    marginTop: 24
  }
});
