import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, ScrollView, Pressable, Text } from "react-native";

export default function StateList({
  states,
  trackedPlates,
  handlePlateClick,
}: {
  states: string[];
  trackedPlates: string[];
  handlePlateClick: (state: string) => void;
}) {
  return (
    <View className="flex-1" id="states-list">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
        {states.map((state) => (
          <Pressable
            key={state}
            onPress={() => handlePlateClick(state)}
            className={`flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 ${
              trackedPlates.includes(state) ? "bg-gray-200" : ""
            }`}
          >
            <Text className="py-6 px-3 text-gray-700 dark:text-gray-300">
              {state}
            </Text>
            {trackedPlates.includes(state) && (
              <Ionicons
                name="checkmark-circle"
                size={28}
                color="gray-900 dark:text-gray-50"
                style={{ marginRight: 16 }}
              />
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
