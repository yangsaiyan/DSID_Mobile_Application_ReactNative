import { Alert, View } from "react-native";
import { useAccount, useSignMessage, useWalletClient } from "wagmi";
import QRCode from "react-native-qrcode-svg";
import { useState } from "react";
import { ethers } from "ethers";
import { Button, YStack } from "tamagui";

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
        message: { raw: ethers.getBytes(messageHash) },
      });

      const recoveredAddress = ethers.verifyMessage(
        ethers.getBytes(messageHash),
        signature
      );

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error("Signature verification failed locally");
      }

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
    <YStack
      width={"260"}
      height={"260"}
      alignItems="center"
      justifyContent="center"
      marginTop="$4"
    >
      {qrGenerated ? (
        <YStack padding={10} borderRadius={10} backgroundColor={"#e3e3e3"}>
          <QRCode
            value={qrInfo}
            size={250}
            color="black"
            backgroundColor="white"
          />
        </YStack>
      ) : (
        <Button
          backgroundColor={"#e3e3e3"}
          fontWeight={800}
          onPress={generateQR}
          width={"250"}
        >
          Generate QR-Code
        </Button>
      )}
    </YStack>
  );
}
