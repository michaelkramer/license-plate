import React from "react";
import { Platform, View } from "react-native";
import {
  BannerAd as GoogleBannerAd,
  BannerAdSize,
  TestIds,
  mobileAds,
} from "react-native-google-mobile-ads";
import { env } from "../../env";

const PROD_AD_UNIT_ID =
  env.ADMOB_MAIN_BANNER_ID ?? "ca-app-pub-7868590865402851/2361662381";

let hasInitializedAds = false;

export function BannerAd() {
  React.useEffect(() => {
    if (hasInitializedAds || Platform.OS === "web") {
      return;
    }

    hasInitializedAds = true;
    mobileAds()
      .initialize()
      .catch((error) => {
        console.warn("AdMob initialization failed", error);
      });
  }, []);

  if (Platform.OS === "web") {
    return null;
  }

  const adUnitId = __DEV__ ? TestIds.BANNER : PROD_AD_UNIT_ID;

  if (!adUnitId) {
    return null;
  }

  return (
    <View className="items-center border-t border-gray-200 bg-gray-50 py-2 dark:border-gray-700 dark:bg-gray-900">
      <GoogleBannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}
