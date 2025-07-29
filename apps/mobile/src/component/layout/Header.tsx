import { Link } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Header() {
  const { top } = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: top }}>
      <View className="px-4 lg:px-6 h-14 flex items-center flex-row justify-between ">
        <Link className="font-bold flex-1 items-center justify-center" href="/">
          License Plate Tracker Game
        </Link>
        <Link
          href="/test-plates"
          className="mt-2 text-blue-600 font-medium hover:underline"
        >
          test
        </Link>
        <Link
          href="/state-plates"
          className="mt-2 text-blue-600 font-medium hover:underline"
        >
          Plates
        </Link>
      </View>
    </View>
  );
}
