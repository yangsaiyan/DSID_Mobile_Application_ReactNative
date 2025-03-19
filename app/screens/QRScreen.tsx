import QRGenerator from "@/components/qr_generator/QRGenerator";
import QRScanner from "@/components/qr_scan/QRScanner";
import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QRScreen() {
  const [isScanner, setIsScanner] = useState(false);

  const toggleSwitch = () => {
    setIsScanner((prev) => !prev);
  };

  return (
    <SafeAreaView
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isScanner ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isScanner}
      />
      {isScanner ? <QRScanner /> : <QRGenerator />}
    </SafeAreaView>
  );
}
