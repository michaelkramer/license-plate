import React from "react";
import { NativeModules, Platform, View } from "react-native";
import { env } from "../../env";

const PROD_AD_UNIT_ID =
  env.ADMOB_MAIN_BANNER_ID ?? "ca-app-pub-7868590865402851/2361662381";

let hasInitializedAds = false;
let hasWarnedMissingModule = false;

type GoogleMobileAdsModule = {
  BannerAd: React.ComponentType<{
    unitId: string;
    size: string;
    requestOptions?: { requestNonPersonalizedAdsOnly?: boolean };
  }>;
  BannerAdSize: { BANNER: string };
  TestIds: { BANNER: string };
  MobileAds: () => { initialize: () => Promise<unknown> };
};

export function BannerAd() {
  const [googleMobileAds, setGoogleMobileAds] =
    React.useState<GoogleMobileAdsModule | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    if (Platform.OS === "web") {
      return () => {
        isMounted = false;
      };
    }

    if (!NativeModules.RNGoogleMobileAdsModule) {
      if (!hasWarnedMissingModule) {
        hasWarnedMissingModule = true;
        console.warn(
          "Google Mobile Ads native module missing in this build. Banner ads are disabled.",
        );
      }
      return () => {
        isMounted = false;
      };
    }

    import("react-native-google-mobile-ads")
      .then((module) => {
        if (!isMounted) {
          return;
        }

        const adsModule = module as unknown as GoogleMobileAdsModule;
        setGoogleMobileAds(adsModule);

        if (!hasInitializedAds) {
          hasInitializedAds = true;
          adsModule
            .MobileAds()
            .initialize()
            .catch((error) => {
              console.warn("AdMob initialization failed", error);
            });
        }
      })
      .catch((error) => {
        if (!hasWarnedMissingModule) {
          hasWarnedMissingModule = true;
          console.warn(
            "Google Mobile Ads unavailable in this build. Banner ads are disabled.",
            error,
          );
        }

        if (isMounted) {
          setGoogleMobileAds(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (Platform.OS === "web" || !googleMobileAds) {
    return null;
  }

  const adUnitId = __DEV__ ? googleMobileAds.TestIds.BANNER : PROD_AD_UNIT_ID;

  if (!adUnitId) {
    return null;
  }

  const GoogleBannerAd = googleMobileAds.BannerAd;

  return (
    <View className="items-center border-t border-gray-200 bg-gray-50 py-2 dark:border-gray-700 dark:bg-gray-900">
      <GoogleBannerAd
        unitId={adUnitId}
        size={googleMobileAds.BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}
