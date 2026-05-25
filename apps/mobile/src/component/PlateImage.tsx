import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import { LicensePlate } from "../interfaces/License-Plate";
import { getPlateImageSource } from "../services/plates";

const PLATE_HEIGHT = 250;
const PLATE_WIDTH = 500;

export default function PlateImage({
  plate,
  scale = 1,
  compact = false,
}: {
  plate: LicensePlate;
  scale?: number;
  compact?: boolean;
}) {
  const width = PLATE_WIDTH * scale;
  const height = PLATE_HEIGHT * scale;
  const marginTop = compact ? 0 : 8;
  const [failed, setFailed] = React.useState(false);
  const resolved = getPlateImageSource(plate);

  React.useEffect(() => {
    setFailed(false);
  }, [plate.state, plate.plate_img, plate.plate_title]);

  if (!resolved || failed) {
    const hint = "Image unavailable";

    return (
      <View
        style={{
          width,
          height,
          borderRadius: 8,
          borderColor: "#ccc",
          borderWidth: 1,
          marginTop,
          backgroundColor: "#e5e7eb",
          alignItems: "center",
          justifyContent: "center",
          padding: compact ? 2 : 8,
        }}
      >
        {!compact && (
          <Text style={{ textAlign: "center", color: "#374151" }}>
            {plate.plate_title}
          </Text>
        )}
        {!compact && (
          <Text style={{ textAlign: "center", color: "#6b7280", fontSize: 12 }}>
            {hint}
          </Text>
        )}
      </View>
    );
  }

  return (
    <Image
      source={resolved}
      onError={() => setFailed(true)}
      style={{
        width,
        height,
        borderRadius: 8,
        borderColor: "#ccc",
        borderWidth: 1,
        marginTop,
      }}
      contentFit="contain"
      cachePolicy="memory-disk"
    />
  );
}
