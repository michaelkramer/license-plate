import React from "react";
import { Text, View } from "react-native";

export default function TrackedPlates({ count }) {
  return (
    <View className="flex flex-col items-center gap-2" id="tracked-plates">
      <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">
        Plates tracked
      </Text>
      <Text className="text-5xl font-bold text-gray-900 dark:text-gray-50">
        {count}
      </Text>
    </View>
  );
}
