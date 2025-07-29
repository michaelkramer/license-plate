import React from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import PlateImage from "../component/PlateImage";
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
  const [size, setSize] = React.useState(20);
  React.useEffect(() => {
    const fetchPlatesData = async () => {
      try {
        const response = await fetch("http://localhost:3000/plates/data");
        if (!response.ok) {
          throw new Error("Failed to fetch plates data");
        }
        const data = await response.json();
        setPlatesData(data);
      } catch (error) {
        console.error("Error fetching plates data:", error);
      }
    };
    fetchPlatesData();
  }, []);

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
      <TextInput
        className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-48 text-center mb-2 text-gray-900 dark:text-gray-50"
        placeholder="Results limit (e.g., 20)"
        placeholderTextColor="#888"
        value={size.toString()}
        onChangeText={(text) => {
          const num = parseInt(text, 10);
          if (!isNaN(num) && num > 0) {
            setSize(num);
          }
        }}
        keyboardType="numeric"
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
        {platesData
          .filter(
            (plate) =>
              !filterState ||
              (plate.state &&
                plate.state.toUpperCase() === filterState.toUpperCase()),
          )
          .splice(0, size) // Limit to 20 results for performance
          .map((plate, index) => (
            <View
              key={index}
              className="p-4 border-b border-gray-200 dark:border-gray-700"
            >
              <Text className="text-lg font-medium text-gray-900 dark:text-gray-50">
                {plate.state}: {plate.plate_title}
              </Text>
              <PlateImage
                plate={{ state: plate.state, plate_img: plate.plate_img }}
                scale={0.5}
              />
            </View>
          ))}
      </ScrollView>
    </View>
  );
}
