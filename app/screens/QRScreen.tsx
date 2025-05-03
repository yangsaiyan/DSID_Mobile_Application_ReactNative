import QRGenerator from "@/components/qr_generator/QRGenerator";
import QRScanner from "@/components/qr_scan/QRScanner";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ToggleGroup, YStack } from "tamagui";

export default function QRScreen() {
  const [isScanner, setIsScanner] = useState(false);

  const toggleSwitch = () => {
    setIsScanner((prev) => {
      return !prev;
    });
  };

  return (
    <YStack
      width={"100%"}
      height={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
      backgroundColor={"#1a1a1a"}
      gap={20}
    >
      <Button
        onPress={toggleSwitch}
        alignSelf="center"
        icon={
          <Ionicons name={isScanner ? "qr-code" : "scan-outline"} size={20} />
        }
        size="$4"
        fontWeight={800}
        backgroundColor={"#e3e3e3"}
      >
        {isScanner ? "QR-Code" : "Scanner"}
      </Button>
      {isScanner ? <QRScanner /> : <QRGenerator />}
    </YStack>
  );
}
