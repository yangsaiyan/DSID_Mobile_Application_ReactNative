import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import {
  usePublicClient,
  useWriteContract,
} from "wagmi";
import { student_verify_abi } from "@/utils/constants";
import Constants from 'expo-constants';

const relay = new GelatoRelay();

export default function QRScanner() {
  const { writeContract } = useWriteContract();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [onChainResult, setOnchainResult] = useState(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedData(data);
    verify(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const verify = async (data) => {
    try {
      // 1. Parse and validate QR data
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        throw new Error("Invalid QR code data format");
      }

      const { timestamp, signature, address } = parsedData;
      if (!timestamp || !signature || !address) {
        throw new Error("Missing required data in QR code");
      }

      // 2. Check if QR code is expired (e.g., 5 minutes)
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime - timestamp > 300) {
        throw new Error("QR code has expired");
      }

      const timestampBigInt = BigInt(timestamp);
      writeContract(
        {
          abi: student_verify_abi,
          address: Constants?.expoConfig?.extra?.VERIFICATION_CONTRACT_ADDRESS,
          functionName: "verifyStudent",
          args: [address, timestampBigInt, signature],
        },
        {
          onSuccess: (txHash) => {
            console.log("Transaction hash:", txHash);

            const unwatch = publicClient.watchContractEvent({
              address: Constants?.expoConfig?.extra?.VERIFICATION_CONTRACT_ADDRESS,
              abi: student_verify_abi,
              eventName: "StudentVerified",
              onLogs: (logs) => {
                console.log("Verification successful:", logs);
                const verifiedAddress = logs[0].args.student;
                Alert.alert("Success", `Student ${verifiedAddress} verified!`);
                unwatch();
              },
              onError: (error) => {
                console.error("Event listening error:", error);
                Alert.alert("Error", "Failed to verify student");
              },
              fromBlock: "latest",
            });
          },
          onError: (error) => {
            console.error("Transaction error:", error);
            Alert.alert("Error", error.shortMessage || error.message);
          },
        }
      );
    } catch (error) {
      console.error("Verification Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ width: 300, height: 300 }}>
      <Pressable onPress={verify}>
        <Text>Click</Text>
      </Pressable>
      {scanned ? (
        <View>
          <Text>{scannedData}</Text>
          <Text>{onChainResult}</Text>
        </View>
      ) : (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
    borderRadius: 10,
  },
  scanText: {
    color: "white",
    fontSize: 16,
  },
  rescanText: {
    color: "yellow",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});
