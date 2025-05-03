import "react-native-reanimated";
import "@walletconnect/react-native-compat";
import "react-native-webcrypto";

import { WagmiProvider } from "wagmi";
import { polygonAmoy } from "@wagmi/core/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createAppKit,
  defaultWagmiConfig,
  AppKit,
} from "@reown/appkit-wagmi-react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import AppNavigator from "./navigation/AppNavigator";
import Constants from "expo-constants";
import { createTamagui, TamaguiProvider, View } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";

const projectId = Constants?.expoConfig?.extra?.REOWN_PROJECT_ID;

const queryClient = new QueryClient();

const config = createTamagui(defaultConfig);

const metadata = {
  name: "AppKit RN",
  description: "AppKit RN Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "YOUR_APP_SCHEME://",
    universal: "YOUR_APP_UNIVERSAL_LINK.com",
  },
};

const chains = [polygonAmoy] as const;

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createAppKit({
  projectId,
  wagmiConfig,
  defaultChain: polygonAmoy,
  enableAnalytics: true,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config}>
          <AppNavigator />
          <AppKit />
        </TamaguiProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
