import React from "react";
import { View, Text, ScrollView, TextInput, Image } from "react-native";
import platesDataRaw from "../assets/us-license-plates.json";
import { Footer } from "../component/layout/Footer";
import { Header } from "../component/layout/Header";
import { LicensePlate } from "../interfaces/License-Plate";

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
  const [platesData, setPlatesData] = React.useState<LicensePlate[]>(null);
  const [filterState, setFilterState] = React.useState("");
  React.useEffect(() => {
    if (platesDataRaw) {
      setPlatesData(platesDataRaw);
    }
  }, [platesDataRaw]);

  if (!platesData) {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Loading license plate data...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        Track License Plates by State
      </Text>
      <TextInput
        className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-48 text-center mb-2 text-gray-900 dark:text-gray-50"
        placeholder="Enter state abbreviation (e.g., CA)"
        placeholderTextColor="#888"
        value={filterState}
        onChangeText={setFilterState}
        autoCapitalize="characters"
        maxLength={2}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
        {platesData
          .filter(
            (plate) =>
              !filterState ||
              (plate.state &&
                plate.state.toUpperCase() === filterState.toUpperCase()),
          )
          .map((plate, index) => (
            <View
              key={index}
              className="p-4 border-b border-gray-200 dark:border-gray-700"
            >
              <Text className="text-lg font-medium text-gray-900 dark:text-gray-50">
                {plate.state}: {plate.plate_title}
              </Text>
              <Image
                source={{
                  uri: `asset:/plates/${plate.state}/${plate.plate_img}`,
                }}
                style={{
                  width: "100%",
                  height: 128,
                  borderRadius: 8,
                  marginTop: 8,
                }}
                resizeMode="cover"
              />
            </View>
          ))}
      </ScrollView>
    </View>
  );
}
