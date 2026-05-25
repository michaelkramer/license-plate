import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScoreContext } from "../../providers/score";

type HeaderMenuProps = {
  visible: boolean;
  onClose: () => void;
};

function formatMenuTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HeaderMenu({ visible, onClose }: HeaderMenuProps) {
  const pathname = usePathname();
  const { top } = useSafeAreaInsets();
  const { activeGame, score } = useScoreContext();

  const items = [
    { href: "/", label: "Track states", match: pathname === "/" },
    {
      href: "/state-plates",
      label: "Plates",
      match: pathname === "/state-plates",
    },
    {
      href: "/game-log",
      label: "Game log",
      match: pathname === "/game-log",
    },
  ] as const;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close menu"
      >
        <Pressable
          className="absolute left-0 top-0 w-72 max-w-[85%] border-r border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900"
          style={{ paddingTop: top + 56 }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Menu
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button">
              <Ionicons name="close" size={24} color="#6b7280" />
            </Pressable>
          </View>

          {activeGame && (
            <View className="mb-4 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950">
              <Text className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Game in progress
              </Text>
              <Text className="mt-1 text-xs text-blue-800 dark:text-blue-200">
                Since {formatMenuTime(activeGame.startedAt)} · {score} states
              </Text>
            </View>
          )}

          {items.map((item) => (
            <Link key={item.href} href={item.href} asChild onPress={onClose}>
              <Pressable
                className={`mb-1 rounded-lg px-3 py-3 active:opacity-80 ${
                  item.match ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
                accessibilityRole="button"
              >
                <Text className="text-base font-medium text-gray-900 dark:text-gray-50">
                  {item.label}
                </Text>
              </Pressable>
            </Link>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
