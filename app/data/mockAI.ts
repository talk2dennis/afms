import { weatherContext } from "../auth/context";

function mockAIResponse(userMessage: string) {
  const msg = userMessage.toLowerCase();

  if (msg.includes("flood")) {
    return `⚠️ Flood Risk is currently ${weatherContext.floodRisk} in ${weatherContext.location}. 
Heavy rainfall is expected tomorrow. Avoid low-lying areas and monitor drainage systems.`;
  }

  if (msg.includes("rain")) {
    return `🌧️ Rainfall today is about ${weatherContext.current.rainfall_mm}mm. 
Tomorrow may experience heavier rainfall (${weatherContext.forecast[1].rain_mm}mm).`;
  }

  if (msg.includes("safe")) {
    return `✅ Stay indoors if possible, avoid flooded roads, and keep emergency contacts ready.`;
  }

  return `🤖 Based on current weather in ${weatherContext.location}, 
rainfall is ongoing. You can ask about flood risk, safety tips, or forecasts.`;
}

export default mockAIResponse;