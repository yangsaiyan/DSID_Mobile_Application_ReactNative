import ProfileCard from "@/components/profile/ProfileCard";
import { Text, View } from "react-native";
import { YStack } from "tamagui";

export default function ProfileScreen() {
  return (
    <YStack
      width={"100%"}
      height={"100%"}
      justifyContent={"center"}
      alignItems="center"
      backgroundColor={"#1a1a1a"}
    >
      <ProfileCard />
    </YStack>
  );
}
