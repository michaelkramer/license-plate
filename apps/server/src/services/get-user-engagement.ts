import env from "../env";
import { analyticsDataClient } from "../config/analytics-data-client";

const propertyId = env.PROPERTY_ID; // Use environment variable or default value

export async function getUserEngagementByScreen(startDate: string = "180daysAgo", endDate: string = "today"): Promise<{ screen: string; durationSeconds: string }[] | undefined> {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "unifiedScreenName" }],
    metrics: [{ name: "userEngagementDuration" }],
    orderBys: [
      {
        desc: true,
        metric: { metricName: "userEngagementDuration" },
      },
    ],
  });

  return response.rows?.map((row) => {
    const screen = row.dimensionValues?.[0]?.value ?? "unknown";
    const durationSeconds = parseFloat(
      row.metricValues?.[0]?.value ?? "0",
    ).toFixed(2);
    return {
      screen,
      durationSeconds,
    };
  });
}
