import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import SessionProvider, { useSession } from "./auth/context";
import LoadingComponent from "./components/loading";


export default function Layout() {
  
  return (
    <SessionProvider>
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <RootNavigator />
    </SafeAreaView>
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session, isLoading } = useSession();
  if (isLoading)
    return <LoadingComponent />;
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="signin" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}