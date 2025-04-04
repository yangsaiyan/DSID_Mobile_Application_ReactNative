// import { Alert, Button, StyleSheet, Text, View } from "react-native";
// import {
//   useAccount,
//   useSignMessage,
//   useWalletClient,
//   useWriteContract,
// } from "wagmi";
// import QRCode from "react-native-qrcode-svg";
// import { useState } from "react";
// import { ethers, verifyMessage } from "ethers";
// import { student_verify_abi } from "@/utils/constants";

// export default function QRGenerator() {
//   const { writeContract } = useWriteContract();
//   const { signMessageAsync } = useSignMessage();
//   const { address, isConnected } = useAccount();
//   const { data: walletClient } = useWalletClient();

//   const [qrGenerated, setQRGenerated] = useState(false);
//   const [qrInfo, setQRInfo] = useState("");

//   const generateQR = async () => {
//     if (!isConnected || !address || !walletClient) {
//       Alert.alert("Connection Error", "Please connect your wallet first.");
//       return;
//     }

//     const timestamp = Math.floor(Date.now() / 1000);

//     try {
//       // 1. Generate message hash exactly matching Solidity's method
//       const messageHash = ethers.solidityPackedKeccak256(
//         ["address", "uint256"],
//         [address, timestamp]
//       );

//       // 2. Recreate the Solidity signature generation process
//       //const messageString = ethers.hexlify(messageHash);
//       const ethSignedMessage = ethers.hashMessage(ethers.getBytes(messageHash));
//       // 3. Sign using the Ethereum-signed message hash
//       const signature = await signMessageAsync({
//         message: ethSignedMessage,
//       });

//       // 4. Verify signature locally before contract call
//       const recoveredAddress = ethers.verifyMessage(ethSignedMessage, signature);

//       console.log("Signature Verification:", {
//         originalAddress: address,
//         recoveredAddress: recoveredAddress,
//         addressMatch: recoveredAddress.toLowerCase() === address.toLowerCase(),
//       });

//       Alert.alert(recoveredAddress.toLowerCase() === address.toLowerCase() ? "true" : "false")

//       // Proceed with contract call if verification passes
//       writeContract(
//         {
//           abi: student_verify_abi,
//           address: "0x",
//           functionName: "verifyStudent",
//           args: [address, timestamp, signature],
//         },
//         {
//           onSuccess: (txHash) => {
//             console.log("Transaction hash:", txHash);

//             // Prepare QR data
//             const qrData = JSON.stringify({
//               timestamp: timestamp,
//               signature: signature,
//               address: address,
//             });

//             // Update state
//             setQRInfo(qrData);
//             setQRGenerated(true);
//           },
//           onError: (error) => {
//             console.error("Transaction error:", error);
//             Alert.alert("Error", error.shortMessage || error.message);
//           },
//         }
//       );
//     } catch (error) {
//       console.error("Signature Generation Error:", error);
//       Alert.alert(
//         "Error",
//         error instanceof Error ? error.message : "Unknown error"
//       );
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Student Verification QR</Text>
//       <Text>{qrInfo}</Text>
//       {qrGenerated ? (
//         <View style={styles.qrSection}>
//           <QRCode
//             value={qrInfo}
//             size={250}
//             color="black"
//             backgroundColor="white"
//           />
//           <Text style={styles.qrHint}>Scan this QR code for verification</Text>
//         </View>
//       ) : (
//         <Button title="Generate Verification QR" onPress={generateQR} />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   qrSection: {
//     alignItems: "center",
//     marginVertical: 30,
//   },
//   qrHint: {
//     marginTop: 15,
//     color: "#666",
//   },
// });
