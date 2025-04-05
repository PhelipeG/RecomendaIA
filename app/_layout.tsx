import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          animation: "slide_from_bottom",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="/trailerMovie" />
        <Stack.Screen name="/listDetails" />
      </Stack>
    </>
  );
}
