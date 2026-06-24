const API_URL = "https://statsapi.mlb.com/api/v1/standings?leagueId=125&season=2026";

export async function getLMBData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data.records;
  } catch (error) {
    console.error("Error fetching LMB data:", error);
    return null;
  }
}