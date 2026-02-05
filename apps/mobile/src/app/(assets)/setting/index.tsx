import { useLogout } from "@/hooks/use-logout";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";

export default function SettingScreen() {
  const { logout, isLoggingOut } = useLogout()
  return (
    <View className="">
      <Pressable onPress={logout} >
        <View className=" w-full flex justify-center items-center py-3.5 px-3">
          <Text className="text-content-1 text-paragraph-p3">{isLoggingOut ? '退出中...' : '退出登录'}</Text>
        </View>
      </Pressable>
    </View>
  )
}
