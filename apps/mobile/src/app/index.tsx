import React from "react";
import { View } from "react-native";
import StateList from "../component/StateList";
import TrackedPlates from "../component/TrackedPlates";
import { Footer } from "../component/layout/Footer";
import { Header } from "../component/layout/Header";
import { StateData } from "../interfaces/License-Plate";
import { useScoreContext } from "../providers/score";
import { states } from "../utilities/constants";

export default function Page() {
  return (
    <View className="flex flex-1">
      <Header />
      <Content />
      <Footer />
    </View>
  );
}

function Content() {
  const { score, trackedPlates, setTrackedPlates } = useScoreContext();

  const handlePlateClick = (state: StateData) => {
    if (!state) return;
    if (
      trackedPlates.find(
        (plate) => plate.state.abbreviation === state.abbreviation,
      )
    ) {
      // If the plate is already tracked, remove it
      const existingPlates = trackedPlates.filter(
        (plate) => plate.state.abbreviation !== state.abbreviation,
      );
      setTrackedPlates(existingPlates);
    } else {
      // If the plate is not tracked, add it
      setTrackedPlates([...trackedPlates, { state, plate_title: null }]);
    }
  };
  return (
    <View className="flex-1">
      <View className="px-4 md:px-6">
        <View className="flex flex-col items-center gap-4 text-center">
          <TrackedPlates count={score} />
          {/*
          // save for later use
          <View>
            {trackedPlates.map((plate, index) => (
              <Text
                key={plate.state.abbreviation}
                className="text-gray-700 dark:text-gray-300 text-center"
              >
                {index + 1}. {plate.state.state} –{" "}
                {plate.plate_title || "No plate title"}
              </Text>
            ))}
          </View> */}
        </View>
      </View>
      <View className="px-4 md:px-6 mt-6 flex-1">
        <StateList
          states={states}
          trackedPlates={trackedPlates}
          handlePlateClick={handlePlateClick}
        />
      </View>
    </View>
  );
}
