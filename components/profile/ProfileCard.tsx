import { student_nft_abi } from "@/utils/constants";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useAccount, useReadContract, useSignMessage } from "wagmi";
import Constants from "expo-constants";
import { Image, YStack } from "tamagui";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

export default function ProfileCard() {
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  const { data: student_NFT_ID } = useReadContract({
    abi: student_nft_abi,
    address: Constants?.expoConfig?.extra?.NFT_CONTRACT_ADDRESS,
    functionName: "getTokenIdOfStudent",
    args: [address],
    query: {
      enabled: !!address,
    },
  });
  const { data: student_NFT_URI } = useReadContract({
    abi: student_nft_abi,
    address: Constants?.expoConfig?.extra?.NFT_CONTRACT_ADDRESS,
    functionName: "getTokenURI",
    args: student_NFT_ID ? [student_NFT_ID] : undefined,
    query: {
      enabled: !!student_NFT_ID,
    },
  });

  const [studentData, setStudentData] = useState<any>(null);
  const [nftURI, setURI] = useState<string>("");

  // useEffect(() => {
  //   if (isConnected && address) {
  //     setStudentData((prev)=>{
  //       return await readContract
  //     })
  //   }
  // }, [])

  useEffect(() => {
    if (!student_NFT_URI) return;

    fetch(
      Constants?.expoConfig?.extra?.NFT_PINATA_GATEWAY +
        student_NFT_URI.toString()
    )
      .then((res) => res.json())
      .then((data) => {
        setURI(data?.image);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [student_NFT_URI]);

  return (
    <View>
      {nftURI ? (
        <Image
          source={{
            uri: nftURI,
            width: 320,
            height: 200,
          }}
          resizeMode="cover"
        />
      ) : (
        <YStack width={250} height={250} backgroundColor={"#FFFFFF"}>
          <Text>Loading student data...</Text>
        </YStack>
        // <Text>Loading student data...</Text>
      )}
    </View>
  );
}
