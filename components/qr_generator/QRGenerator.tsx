import { Button, Linking, StyleSheet, Text, View } from "react-native";
import { useAccount } from "wagmi";
import { useSignMessage } from "wagmi";
import QRCode from "react-native-qrcode-svg";
import { useState } from "react";

export default function QRGenerator() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [url, setURL] = useState("");
  const [qrGenerated, setQRGenerated] = useState(false);

  const generateQR = async () => {
    if (!isConnected || !address) return;

    const challenge = `Verify student identity: ${Date.now()}`;
    const signer = await signMessageAsync({ message: challenge });

    const combined = `https://dsid-staging.vercel.app/auth?challenge=${encodeURIComponent(
      challenge
    )}&signer=${encodeURIComponent(signer)}&address=${encodeURIComponent(
      address || ""
    )}`;
    setURL(combined);
    setQRGenerated(true);
    Linking.openURL(combined);
  };

  return (
    <View style={styles.innerContainer}>
      {qrGenerated ? (
        <View style={styles.qrCodeContainer}>
          <QRCode
            value={url}
            size={200}
            color="black"
            backgroundColor="white"
          />
        </View>
      ) : (
        <Button title="Generate QR Code" onPress={generateQR} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  qrCodeContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center",
  },
  generatedUrlText: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: "#888",
  },
});
