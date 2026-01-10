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
  const { isAuthenticated, isLoading } = useSession();
  if (isLoading)
    return <LoadingComponent />;
  
  return (
    <Stack>
      <Stack.Protected guard={!!isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="signin" options={{ headerShown: false, headerSearchBarOptions: {
          placeholder: "Search",
          hideWhenScrolling: true,
          obscureBackground: true,
          autoCapitalize: "none",
        } }} />
        <Stack.Screen name="register" options={{ headerShown: true, title: "Register" }} />
        <Stack.Screen name="forgot_password" options={{ headerShown: true, title: "Forgot Password" }} />
        <Stack.Screen name="addReport" options={{ title: "Add Report", presentation: "modal" }} />
      </Stack.Protected>
    </Stack>
  );
}