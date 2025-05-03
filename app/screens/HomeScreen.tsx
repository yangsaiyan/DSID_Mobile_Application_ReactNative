import { Text, View } from "react-native";
import { YStack } from "tamagui";

export default function HomeScreen() {
  return (
    <YStack
      width={"100%"}
      height={"100%"}
      justifyContent={"center"}
      alignItems="center"
      backgroundColor={"#1a1a1a"}
    >
      <Text>Home</Text>
    </YStack>
  );
}
