
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useAccount, useSignMessage } from "wagmi";

export default function ProfileCard() {
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  const [studentData, setStudentData] = useState<any>(null);

  // useEffect(() => {
  //   if (!isConnected || !address) return; // Prevent running if the wallet is not connected

  //   const fetchStudent = async () => {
  //     try {
  //       console.log("Fetching student data...");
    
  //       if (!signMessage) {
  //         console.error("❌ signMessageAsync is undefined!");
  //         return;
  //       }
  //       // console.log("✅ signMessageAsync exists");
    
  //       // if (!address) {
  //       //   console.error("❌ Wallet address not found!");
  //       //   return;
  //       // }
  //       // console.log("✅ Wallet Address:", address);
    
  //       // console.log("📌 Requesting message signature...");
        
  //       // setTimeout(() => console.warn("⚠️ Still waiting for signature..."), 5000); // Alert if it takes too long
    
  //       // const signedMessage = await signMessage({ message: "Sign to verify your identity" });
    
  //       // console.log("✅ Signed Message:", signedMessage);
    
  //       console.log("📌 Fetching encrypted student data from GunDB...");
  //       console.log(address);
  //       const encryptedData = await getStudent(address);
  //       console.log("✅ Encrypted Data:", encryptedData);
    
  //       if (!encryptedData) {
  //         console.error("❌ No encrypted data received!");
  //         return;
  //       }
    
  //       console.log("📌 Decrypting student data...");
  //       const student = await signMessageAndDecrypt(signedMessage, encryptedData);
  //       console.log("✅ Decrypted Student Data:", student);
    
  //       setStudentData(JSON.parse(student));
  //     } catch (error) {
  //       console.error("❌ Error in fetchStudent:", error);
  //     }
  //   };
    

  //   fetchStudent();
  // }, [address, isConnected]); // Runs only when `address` or connection status changes

  return (
    <View>
      {studentData ? (
        <Text>Student Name: {studentData.name}</Text>
      ) : (
        <Text>Loading student data...</Text>
      )}
    </View>
  );
}
