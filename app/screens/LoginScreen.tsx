import { useAppKit } from "@reown/appkit-wagmi-react-native";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useAccount } from "wagmi";

export default function LoginScreen({ navigation }) {
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
    <View>
      <Pressable onPress={open}>
        <Text>Connect Wallet</Text>
      </Pressable>
      <Pressable onPress={() => navigation.replace("Main")}>
        <Text>Go to Main</Text>
      </Pressable>
    </View>
  );
}
