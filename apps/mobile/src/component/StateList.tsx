import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { View, ScrollView, Pressable, Text } from "react-native";
import { TrackedPlate, StateData } from "../interfaces/License-Plate";
import { getDisplayPlateForState } from "../services/plates";
import PlateImage from "./PlateImage";

function isStateTracked(trackedPlates: TrackedPlate[], state: StateData) {
  return trackedPlates.some(
    (plate) => plate.state.abbreviation === state.abbreviation,
  );
}

function getTrackedTitle(
  trackedPlates: TrackedPlate[],
  state: StateData,
): string | null {
  return (
    trackedPlates.find((p) => p.state.abbreviation === state.abbreviation)
      ?.plate_title ?? null
  );
}

export default function StateList({
  states,
  trackedPlates,
  plateDisplaySeed,
  handlePlateClick,
}: {
  states: StateData[];
  trackedPlates: TrackedPlate[];
  plateDisplaySeed: number;
  handlePlateClick: (state: StateData) => void;
}) {
  return (
    <View className="flex-1" id="states-list">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
        {states.map((state) => {
          const tracked = isStateTracked(trackedPlates, state);
          const displayPlate = getDisplayPlateForState(
            state.abbreviation,
            getTrackedTitle(trackedPlates, state),
            plateDisplaySeed,
          );

          return (
            <Pressable
              key={state.abbreviation}
              onPress={() => handlePlateClick(state)}
              className={`min-h-[64px] flex-row items-center border-b border-gray-200 dark:border-gray-700 active:opacity-80 ${
                tracked ? "bg-gray-200 dark:bg-gray-700" : ""
              }`}
              accessibilityRole="button"
              accessibilityLabel={`${state.state}, ${tracked ? "tracked" : "not tracked"}`}
            >
              <Text className="flex-1 px-4 py-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                {state.state}
              </Text>
              {displayPlate && (
                <View
                  key={`${state.abbreviation}-${plateDisplaySeed}-${displayPlate.plate_img}`}
                  className="mr-2"
                >
                  <PlateImage plate={displayPlate} scale={0.15} compact />
                </View>
              )}
              {tracked && (
                <View className="flex-row items-center gap-3 pr-4">
                  <Link
                    href={`/state-plates?state=${state.abbreviation}`}
                    asChild
                  >
                    <Pressable
                      className="rounded-lg bg-blue-600 px-4 py-3 active:bg-blue-700"
                      accessibilityRole="button"
                      accessibilityLabel={`More plates for ${state.state}`}
                    >
                      <Text className="text-base font-semibold text-white">
                        More
                      </Text>
                    </Pressable>
                  </Link>
                  <Ionicons name="checkmark-circle" size={36} color="#111827" />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
