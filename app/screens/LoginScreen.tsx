import { useAppKit } from "@reown/appkit-wagmi-react-native";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { Button, YStack } from "tamagui";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }: any) {
  const { open } = useAppKit();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      setTimeout(() => {
        navigation.replace("Main");
      }, 1);
    }
  }, [isConnected, navigation]);

  return (
    <YStack
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      padding={20}
    >
      <Button onPress={() => open()} iconAfter={<Ionicons name={"wallet"} size={30} />} size="$7" fontWeight="800">
        Connect Wallet
      </Button>
    </YStack>
  );
}
