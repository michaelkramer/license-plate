import { useLocalSearchParams, router } from "expo-router";
import React from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import PlateImage from "../component/PlateImage";
import { Footer } from "../component/layout/Footer";
import { Header } from "../component/layout/Header";
import { LicensePlate } from "../interfaces/License-Plate";
import { useScoreContext } from "../providers/score";
import { getAllBundledPlates } from "../services/plates";
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
  const { state } = useLocalSearchParams<{
    state: string;
  }>();
  const { trackedPlates, setTrackedPlates } = useScoreContext();

  const [platesData, setPlatesData] = React.useState<LicensePlate[] | null>(
    null,
  );
  const [filterState, setFilterState] = React.useState("");
  const [size, setSize] = React.useState(20);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<{ label: string; value: string }[]>(
    [],
  );

  const handleSpecialPlateClick = (plate: LicensePlate) => {
    console.log("Clicked special plate:", plate, trackedPlates);
    if (!plate) return;
    const existingPlates = trackedPlates.filter(
      (p) => p.state.abbreviation !== plate.state,
    );

    const currentState = trackedPlates.find(
      (p) => p.state.abbreviation === plate.state,
    );
    if (!currentState) return;

    setTrackedPlates([
      ...existingPlates,
      { ...currentState, plate_title: plate.plate_title },
    ]);
    router.replace("/");
  };

  React.useEffect(() => {
    getAllBundledPlates()
      .then(setPlatesData)
      .catch((error) => {
        console.error("Error loading bundled plates:", error);
      });
  }, []);

  React.useEffect(() => {
    if (platesData) {
      const uniqueCategories = Array.from(
        new Set(
          platesData
            .filter(
              (plate) =>
                !filterState ||
                (plate.state &&
                  plate.state.toUpperCase() === filterState.toUpperCase()),
            )
            .map((plate) => plate.category),
        ),
      ).sort();
      setCategories(uniqueCategories);
    }
  }, [platesData, filterState]);

  React.useEffect(() => {
    if (state) {
      setFilterState(state.toUpperCase());
    }
  }, [state]);

  React.useEffect(() => {
    if (categories.length > 0) {
      const items = categories.sort().map((category) => ({
        label: category,
        value: category,
      }));
      setItems(items);
    }
  }, [categories]);

  if (!platesData) {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Loading license plate data...
        </Text>
      </View>
    );
  }

  console.log("Tracked Plates:", trackedPlates);

  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        Track License Plates by State
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
        Showing curated plates (up to 20 per state) with bundled images.
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
      {/* save for later use
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder="Category"
        listMode="SCROLLVIEW"
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 4,
        }}
        containerStyle={{ width: 192 }}
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
      /> */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
        {platesData
          .filter(
            (plate) =>
              !filterState ||
              (plate.state &&
                plate.state.toUpperCase() === filterState.toUpperCase()),
          )
          .filter((plate) => !value || plate.category === value)
          .slice(0, size)
          .map((plate, index) => (
            <View
              key={`${plate.plate_title}${index}`}
              className="p-4 border-b border-gray-200 dark:border-gray-700"
            >
              <Text className="text-lg font-medium text-gray-900 dark:text-gray-50 text-center">
                {plate.state}: {plate.plate_title}
              </Text>
              <View className="flex items-center justify-center mt-2">
                <Pressable onPress={() => handleSpecialPlateClick(plate)}>
                  <PlateImage plate={plate} scale={0.5} />
                </Pressable>
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}
