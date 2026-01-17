import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ProcessProvider } from "@/contexts/ProcessContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new-process" options={{ title: "New Process", presentation: "modal" }} />
      <Stack.Screen name="process/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="process/[id]/chat" options={{ title: "Describe Your Situation" }} />
      <Stack.Screen name="process/[id]/documents" options={{ title: "Upload Documents" }} />
      <Stack.Screen name="process/[id]/form" options={{ title: "Complete Form" }} />
      <Stack.Screen name="process/[id]/review" options={{ title: "Review & Validate" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ProcessProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </ProcessProvider>
    </QueryClientProvider>
  );
}
