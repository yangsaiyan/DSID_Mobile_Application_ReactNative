import "dotenv/config";

export default {
  expo: {
    expo: {
      name: "dsid-mobile",
      slug: "dsid-mobile",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "dsid",
      deeplinks: ["dsid://"],
      platforms: ["ios", "android"],
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
      ios: {
        supportsTablet: true,
      },
      android: {
        package: "com.yangsaiyan.dsidmobile",
        intentFilters: [
          {
            action: "VIEW",
            data: [
              {
                scheme: "myapp",
                host: "profile",
              },
            ],
            category: ["BROWSABLE", "DEFAULT"],
          },
        ],
        adaptiveIcon: {
          foregroundImage: "./assets/images/adaptive-icon.png",
          backgroundColor: "#ffffff",
        },
      },
      web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png",
      },
      plugins: [
        "expo-barcode-scanner",
        "expo-router",
        [
          "expo-splash-screen",
          {
            image: "./assets/images/splash-icon.png",
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#ffffff",
          },
        ],
        [
          "expo-camera",
          {
            cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
            microphonePermission:
              "Allow $(PRODUCT_NAME) to access your microphone",
            recordAudioAndroid: true,
          },
        ],
      ],
      experiments: {
        typedRoutes: true,
      },
      extra: {
        REOWN_PROJECT_ID: process.env.REOWN_PROJECT_ID,
        VERIFICATION_CONTRACT_ADDRESS:
          process.env.VERIFICATION_CONTRACT_ADDRESS,
        NFT_CONTRACT_ADDRESS: process.env.NFT_CONTRACT_ADDRESS,
        SERVER_URL: process.env.SERVER_URL,
        NFT_PINATA_GATEWAY: process.env.NFT_PINATA_GATEWAY,
      },
    },
  },
};
