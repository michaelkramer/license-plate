import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import StateList from "../component/StateList";
import TrackedPlates from "../component/TrackedPlates";
import { Footer } from "../component/layout/Footer";
import { Header } from "../component/layout/Header";

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
  const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];
  const [trackedPlates, setTrackedPlates] = React.useState([]);
  const handlePlateClick = (state) => {
    if (trackedPlates.includes(state)) {
      setTrackedPlates((prev) => prev.filter((plate) => plate !== state));
    } else {
      setTrackedPlates((prev) => [...prev, state]);
    }
  };
  return (
    <View className="flex-1">
      <View className="px-4 md:px-6">
        <View className="flex flex-col items-center gap-4 text-center">
          <TrackedPlates count={trackedPlates.length} />
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
