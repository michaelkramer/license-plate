import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import React from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScoreContext } from "../../providers/score";
import { ConfirmModal } from "./ConfirmModal";
import { HeaderMenu } from "./HeaderMenu";

const appName = "Tracking Plate Game";

export function Header() {
  const { top } = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { hasActiveGame, startGame, completeGame } = useScoreContext();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [completeVisible, setCompleteVisible] = React.useState(false);
  const iconColor = colorScheme === "dark" ? "#f9fafb" : "#111827";

  const handleConfirmComplete = () => {
    setCompleteVisible(false);
    completeGame();
  };

  return (
    <View style={{ paddingTop: top }}>
      <View className="relative h-14 w-full flex-row items-center px-4">
        <View className="z-10 min-w-0 flex-1 flex-row items-center justify-start">
          <Pressable
            className="rounded-lg p-2 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="menu" size={28} color={iconColor} />
          </Pressable>
        </View>

        <Text
          className="pointer-events-none absolute inset-x-4 text-center text-md font-semibold text-gray-900 dark:text-gray-50"
          numberOfLines={1}
          accessibilityRole="header"
        >
          {appName}
        </Text>

        <View className="z-10 min-w-0 flex-1 flex-row items-center justify-end">
          {isHome &&
            (hasActiveGame ? (
              <Pressable
                className="rounded-lg bg-green-600 px-3 py-2 active:bg-green-700"
                onPress={() => setCompleteVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Complete game"
              >
                <Text
                  className="text-sm font-semibold text-white"
                  numberOfLines={1}
                >
                  Complete
                </Text>
              </Pressable>
            ) : (
              <Pressable
                className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 active:opacity-80 dark:border-gray-600 dark:bg-gray-800"
                onPress={startGame}
                accessibilityRole="button"
                accessibilityLabel="Start game"
              >
                <Text
                  className="text-sm font-semibold text-gray-900 dark:text-gray-50"
                  numberOfLines={1}
                >
                  Start
                </Text>
              </Pressable>
            ))}
        </View>
      </View>

      <HeaderMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <ConfirmModal
        visible={completeVisible}
        title="Complete this game?"
        message="This will save the game to your log and clear tracking for a fresh board."
        confirmLabel="Complete game"
        cancelLabel="Cancel"
        destructive={false}
        onConfirm={handleConfirmComplete}
        onCancel={() => setCompleteVisible(false)}
      />
    </View>
  );
}
