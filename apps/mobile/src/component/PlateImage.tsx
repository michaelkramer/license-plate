import React from "react";
import { Image } from "react-native";
import env from "../env";

const PLATE_HEIGHT = 250; // Default height for the plate image
const PLATE_WIDTH = 500; // Default width for the plate image

export default function PlateImage({
  plate,
  scale = 1,
}: {
  plate: { state: string; plate_img: string };
  scale: number;
}) {
  const width = PLATE_WIDTH * scale;
  const height = PLATE_HEIGHT * scale;

  const imagePath = `${env.API_URL}/plates/${plate.state}/${plate.plate_img}`;

  return (
    <Image
      source={{
        uri: imagePath,
      }}
      style={{
        width: width,
        height: height,
        borderRadius: 8,
        borderColor: "#ccc",
        borderWidth: 1,
        marginTop: 8,
      }}
      resizeMode="contain" // Changed to contain for better aspect ratio handling
    />
  );
}
