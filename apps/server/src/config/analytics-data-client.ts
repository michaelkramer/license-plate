import { BetaAnalyticsDataClient } from "@google-analytics/data";
import env from "../env";

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    private_key: env.GOOGLE_PRIVATE_KEY,
    client_email: env.GOOGLE_CLIENT_EMAIL,
  },
});

export { analyticsDataClient };