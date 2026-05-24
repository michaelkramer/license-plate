import { Link, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScoreContext } from "../../providers/score";
import { ConfirmModal } from "./ConfirmModal";

export function Header() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { resetTracking } = useScoreContext();
  const [confirmVisible, setConfirmVisible] = React.useState(false);

  const handleConfirmNewGame = () => {
    setConfirmVisible(false);
    resetTracking();
    router.push("/");
  };

  return (
    <View style={{ paddingTop: top }}>
      <View className="px-4 h-14 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          {/* Add new game button */}
          <Pressable
            className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 active:opacity-80 dark:border-gray-600 dark:bg-gray-800"
            accessibilityRole="button"
            accessibilityLabel="Start new game"
            onPress={() => setConfirmVisible(true)}
          >
            <Text
              className="text-sm font-semibold text-gray-900 dark:text-gray-50"
              numberOfLines={1}
            >
              New game
            </Text>
          </Pressable>
          <Link href="/" asChild>
            <Pressable
              className="min-w-0 flex-1 active:opacity-80"
              accessibilityRole="button"
            >
              <Text
                className="text-center text-sm font-bold text-gray-900 dark:text-gray-50"
                numberOfLines={1}
              >
                Tracking Plate Game
              </Text>
            </Pressable>
          </Link>
        </View>
        <Link href="/state-plates" asChild>
          <Pressable
            className="rounded-lg bg-blue-600 px-4 py-2 active:bg-blue-700"
            accessibilityRole="button"
          >
            <Text className="text-sm font-semibold text-white">Plates</Text>
          </Pressable>
        </Link>
      </View>

      <ConfirmModal
        visible={confirmVisible}
        title="Start a new game?"
        message="This will clear all tracked states and plates. Your progress cannot be undone."
        confirmLabel="Start over"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmNewGame}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}
