import { Alert, Button, StyleSheet, Text, View } from "react-native";
import {
  useAccount,
  useSignMessage,
  useWalletClient,
} from "wagmi";
import QRCode from "react-native-qrcode-svg";
import { useState } from "react";
import { ethers } from "ethers";

export default function QRGenerator() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { signMessageAsync } = useSignMessage();
  const [qrGenerated, setQRGenerated] = useState(false);
  const [qrInfo, setQRInfo] = useState("");

  const generateQR = async () => {
    if (!isConnected || !address || !walletClient) {
      Alert.alert("Connection Error", "Please connect your wallet first.");
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const timestampBigInt = BigInt(timestamp);

    try {
      const message = ethers.solidityPacked(
        ["address", "uint256"],
        [address, timestamp]
      );
      
      const messageHash = ethers.keccak256(message);
      
      const signature = await signMessageAsync({
        message: { raw: ethers.getBytes(messageHash) }
      });
  
      const recoveredAddress = ethers.verifyMessage(
        ethers.getBytes(messageHash),
        signature
      );

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error("Signature verification failed locally");
      }

      // Alert.alert(recoveredAddress.toLowerCase(), address.toLowerCase());

      // writeContract({
      //   abi: student_verify_abi,
      //   address: "0x",
      //   functionName: "verifyStudent",
      //   args: [address, timestamp, signature],
      // });

      const qrData = JSON.stringify({
        timestamp: timestampBigInt.toString(),
        signature: signature,
        address: address,
      });

      setQRInfo(qrData);
      setQRGenerated(true);
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Verification QR</Text>
      <Text>{qrInfo}</Text>
      {qrGenerated ? (
        <View style={styles.qrSection}>
          <QRCode
            value={qrInfo}
            size={250}
            color="black"
            backgroundColor="white"
          />
          <Text style={styles.qrHint}>Scan this QR code for verification</Text>
        </View>
      ) : (
        <Button title="Generate Verification QR" onPress={generateQR} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  qrSection: {
    alignItems: "center",
    marginVertical: 30,
  },
  qrHint: {
    marginTop: 15,
    color: "#666",
  },
});
