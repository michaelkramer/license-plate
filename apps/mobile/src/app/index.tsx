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
  const { score, trackedPlates, setTrackedPlates, plateDisplaySeed } =
    useScoreContext();

  const handlePlateClick = (state: StateData) => {
    if (!state) return;

    const isTracked = trackedPlates.some(
      (plate) => plate.state.abbreviation === state.abbreviation,
    );

    if (isTracked) {
      setTrackedPlates(
        trackedPlates.filter(
          (plate) => plate.state.abbreviation !== state.abbreviation,
        ),
      );
    } else {
      setTrackedPlates([...trackedPlates, { state, plate_title: null }]);
    }
  };

  return (
    <View className="flex-1">
      <View className="px-4 md:px-6">
        <View className="flex flex-col items-center gap-4 text-center">
          <TrackedPlates count={score} />
        </View>
      </View>
      <View className="mt-6 flex-1 px-4 md:px-6">
        <StateList
          states={states}
          trackedPlates={trackedPlates}
          plateDisplaySeed={plateDisplaySeed}
          handlePlateClick={handlePlateClick}
        />
      </View>
    </View>
  );
}
