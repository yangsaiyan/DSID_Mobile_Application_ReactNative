import { student_nft_abi } from "@/utils/constants";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useAccount, useReadContract, useSignMessage } from "wagmi";
import Constants from "expo-constants";
import {
  Card,
  H2,
  H4,
  Image,
  Paragraph,
  SizableText,
  Spinner,
  YStack,
} from "tamagui";

export default function ProfileCard() {
  const { address, isConnected } = useAccount();
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
  const [displayID, setDisplayID] = useState<boolean>(true);

  useEffect(() => {
    if (isConnected && address) {
      const url =
        Constants?.expoConfig?.extra?.SERVER_URL + "student/" + encodeURIComponent(address);

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          console.log("Data", data);
          setStudentData(data);
        });
    }
  }, [address]);

  useEffect(() => {
    console.log("studentData", studentData);
  }, [studentData]);

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
        <YStack>
          <Card
            onPress={() => {
              setDisplayID(!displayID);
            }}
            enterStyle={{
              scale: 1.5,
              y: -10,
              opacity: 0,
            }}
            animation="bouncy"
            size="$4"
            width={320}
            height={200}
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
            borderRadius={18}
          >
            {displayID ? (
              <Image
                source={{
                  uri: nftURI,
                  width: 320,
                  height: 200,
                }}
                resizeMode="cover"
              />
            ) : (
              <YStack>
                <Card.Header padded>
                  <H4>Your infomation</H4>
                </Card.Header>
                <SizableText size="$3" paddingLeft={20}>
                  Name: {studentData?.name}
                </SizableText>
                <SizableText size="$3" paddingLeft={20}>
                  Student ID: {studentData?.studentId}
                </SizableText>
                <SizableText size="$3" paddingLeft={20}>
                  Faculty: {studentData?.faculty}
                </SizableText>
                <SizableText size="$3" paddingLeft={20}>
                  Course: {studentData?.course}
                </SizableText>
              </YStack>
            )}
          </Card>
        </YStack>
      ) : (
        <YStack
          width={250}
          height={250}
          justifyContent="center"
          alignItems="center"
        >
          <Spinner size="large" color="#FFFFFF" />
        </YStack>
      )}
    </View>
  );
}
