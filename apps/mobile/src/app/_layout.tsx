import "../global.css";
import { Slot } from "expo-router";
import React from "react";
import { ScoreProvider } from "../providers/score";

export default function Layout() {
  return (
    <ScoreProvider>
      <Slot />
    </ScoreProvider>
  );
}
