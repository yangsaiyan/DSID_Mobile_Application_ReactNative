import React, { useState, useEffect, useRef } from "react";
import { CameraView, Camera } from "expo-camera";
import { useWriteContract } from "wagmi";
import { student_verify_abi } from "@/utils/constants";
import Constants from "expo-constants";
import { ethers, parseUnits } from "ethers";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";
import io from "socket.io-client";
import {
  Button,
  XStack,
  YStack,
  Text,
  Card,
  H4,
  Paragraph,
  Spinner,
  H6,
  Circle,
} from "tamagui";

export default function QRScanner() {
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeContractError,
  } = useWriteContract();

  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(),
  });
  const provider = new ethers.JsonRpcProvider(
    "https://polygon-amoy.g.alchemy.com/v2/MiqdTMIebDF_2oZ3yIrZKzPcp8lqWOBZ"
  );

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [verificationResult, setVerificationResult] = useState("");
  const [verificationError, setVerificationError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [events, setEvents] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [socketError, setSocketError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const socketRef = useRef(null);
  const scrollViewRef = useRef(null);

  const contractAddress =
    Constants?.expoConfig?.extra?.VERIFICATION_CONTRACT_ADDRESS;

  const getServerUrl = () => {
    return Constants?.expoConfig?.extra?.SERVER_URL;
  };

  useEffect(() => {
    connectSocket();
    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (events != null && hash !== null) {
      compareHash();
    }
  }, [events, hash]);

  useEffect(() => {
    const getCameraPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (err) {
        console.error("Camera permission error:", err);
        setHasPermission(false);
      }
    };

    getCameraPermissions();
  }, []);

  const compareHash = () => {
    if(hash !== null && (events !== null || events !== undefined) && hash === events?.transactionHash){
      if(events?.name == "StudentVerified"){
        setVerificationResult("Student Verified");
      }
      else if(events?.name == "VerificationFailed"){
        setVerificationResult("Verification Failed");
      }
    }
  }

  const connectSocket = () => {
    try {
      console.log("Connecting to socket server at:", getServerUrl());
      setSocketError(null);

      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      const socket = io(getServerUrl(), {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 10000,
        forceNew: true,
      });

      socketRef.current = socket;
      setConnectionStatus("Connecting...");

      socket.on("connect", () => {
        console.log("Socket Connected!", socket.id);
        setConnectionStatus("Connected");
      });

      socket.on("connection_confirmed", (data) => {
        console.log("Server confirmed connection:", data);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket Disconnected:", reason);
        setConnectionStatus(`Disconnected (${reason})`);
      });

      socket.on("connect_error", (err) => {
        console.error("Connection error:", err);
        setConnectionStatus("Connection Error");
        setSocketError(`${err.message}`);
      });

      socket.on("blockchain-event", (data) => {
        console.log("Received blockchain event:", data);
        setEvents(data);
      });

      socket.connect();
    } catch (err) {
      console.error("Socket setup error:", err);
      setConnectionStatus("Setup Error");
      setSocketError(`${err.message}`);
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedData(data);

    try {
      if (!data) {
        throw new Error("No QR code data detected");
      }
      verify(data);
    } catch (error) {
      console.error("QR Scan Error:", error);
      setVerificationError(`QR scan error: ${error.message}`);
    }
  };

  const verify = async (data) => {
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(data);
        console.log("Parsed QR data:", parsedData);
      } catch (e) {
        throw new Error(
          "Invalid QR code format. Please scan a valid student verification QR code."
        );
      }

      const { timestamp, signature, address } = parsedData;
      if (!timestamp || !signature || !address) {
        throw new Error(
          "Missing required data in QR code (timestamp, signature, or address)"
        );
      }

      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime - timestamp > 12000) {
        throw new Error(
          "QR code has expired (valid for 15 minutes). Please ask student to generate a new code."
        );
      }

      const timestampBigInt = BigInt(timestamp);

      try {
        setIsConfirming(true);
        await writeContract({
          abi: student_verify_abi,
          address: contractAddress,
          functionName: "verifyStudent",
          args: [address, timestampBigInt, signature],
          gasPrice: parseUnits("40", "gwei"),
        });
      } catch (txError) {
        console.error("Transaction Error:", txError);
        setIsConfirming(false);
        throw new Error(
          `Transaction failed: ${txError.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Verification Error:", error);
      setIsConfirming(false);
      setVerificationError(error.message);
    }
  };

  const handleRescan = () => {
    setScanned(false);
    setScannedData("");
    setVerificationResult(null);
    setVerificationError(null);
    setIsConfirming(false);
    setLogs([]);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).toLocaleString();
  };

  useEffect(() => {
    if (writeContractError) {
      console.error("Write contract error:", writeContractError);
      setIsConfirming(false);
      setVerificationError(
        `Contract error: ${writeContractError.message || "Unknown error"}`
      );
    }
  }, [writeContractError]);

  const handleReconnectSocket = () => {
    connectSocket();
  };

  if (hasPermission === null) {
    return (
      <YStack f={1} jc="center" ai="center" space>
        <Spinner size="large" color="$blue10" />
        <H4>Requesting camera permission...</H4>
      </YStack>
    );
  }

  if (hasPermission === false) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignContent="center"
        padding="$4"
        space
      >
        <H4 color="$red10">No access to camera</H4>
        <Paragraph textAlign="center">
          Camera permission is required to scan QR codes. Please enable camera
          access in your device settings.
        </Paragraph>
      </YStack>
    );
  }

  return (
    <YStack
      width={"260"}
      height={"260"}
      alignItems={"center"}
      justifyContent={"center"}
      marginTop="$4"
    >
      {!scanned ? (
        <YStack flex={1} space>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
        </YStack>
      ) : (
        <YStack justifyContent={"center"} alignItems={"center"}>
          <Card
            width={"250"}
            height={"250"}
            borderRadius={10}
            backgroundColor={"#e3e3e3"}
            justifyContent="center"
            alignItems="center"
          >
            <XStack maxWidth={200} justifyContent="center" alignItems="center">
              <Text color={"#1a1a1a"} fontWeight={600}>
                Server:
              </Text>
              <Circle
                size={6}
                backgroundColor={
                  connectionStatus == "Connected"
                    ? "green"
                    : connectionStatus == "Connecting..."
                    ? "yellow"
                    : "red"
                }
                marginHorizontal={4}
              />
              <Text
                color={"#1a1a1a"}
                fontWeight={600}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {connectionStatus}
              </Text>
            </XStack>

            {verificationResult != "" ? (
              <YStack justifyContent={"center"} alignItems={"center"}>
                <Text fontWeight={800}>{verificationResult}</Text>
              </YStack>
            ) : (
              <YStack justifyContent={"center"} alignItems={"center"}>
                <H6 color="#1a1a1a">Listening</H6>
                <Spinner size="large" color="#1a1a1a" />
              </YStack>
            )}
          </Card>
          <XStack justifyContent={"center"} alignItems={"center"}>
            <Button
              onPress={handleRescan}
              backgroundColor={"#e3e3e3"}
              fontWeight={800}
              marginTop="$4"
            >
              Scan Again
            </Button>
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}

const styles = {
  camera: {
    height: "250",
    aspectRatio: 1,
    borderRadius: 8,
  },
};
