import env from "../env";
import { analyticsDataClient } from "../config/analytics-data-client";

const propertyId = env.PROPERTY_ID; // Use environment variable or default value

export async function getSessionsByScreen(startDate: string = "180daysAgo", endDate: string = "today"): Promise<{
  screen: string | null | undefined;
  sessionCount: string | null | undefined;
}[] | undefined> {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'unifiedScreenName' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [
      {
        desc: true,
        metric: { metricName: 'sessions' },
      },
    ],
  });

  console.log('Sessions by Screen Name:\n');
  return response.rows?.map(row => {
    const screen = row.dimensionValues?.[0]?.value;
    const sessionCount = row.metricValues?.[0]?.value;
    console.log(`${screen}: ${sessionCount} sessions`);
    return {
      screen,
      sessionCount,
    };
  });
}