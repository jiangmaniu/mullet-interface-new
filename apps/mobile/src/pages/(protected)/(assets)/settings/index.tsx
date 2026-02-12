import { useLogout } from "@/hooks/use-logout";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { IconifyFilter } from "@/components/ui/icons";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Trans } from "@lingui/react/macro";

export default function SettingsScreen() {
  const { logout, isLoggingOut } = useLogout()
  return (
    <View className="">
      <ScreenHeader
        showBackButton={true}
        content={<Trans>设置</Trans>}

      />

      <Pressable onPress={logout} >
        <View className=" w-full flex justify-center items-center py-3.5 px-3">
          <Text className="text-content-1 text-paragraph-p3">{isLoggingOut ? '退出中...' : '退出登录'}</Text>
        </View>
      </Pressable>
    </View>
  )
}
