import { useLogout } from "@/hooks/use-logout";
import { View, Text, Pressable } from "react-native";

export default function SettingScreen() {
  const { logout, isLoggingOut } = useLogout()
  return (
    <View className="flex items-center ">
      <Pressable className="flex-1 w-full py-5 border border-white" onPress={logout} disabled={isLoggingOut}>
        <Text className="text-content-1">{isLoggingOut ? '退出中...' : '退出登录'}</Text>
      </Pressable>
    </View>
  )
}
