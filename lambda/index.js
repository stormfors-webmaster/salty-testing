import { WebflowClient } from "webflow-api";

let apiKey = "9ec5e1f4897f12dbab60414d1892de013acdef4279efca371bce4d7b058bff11";
let collectionID = "6786e26d4438e40d5e56c085";

const webflow = new WebflowClient({ accessToken: apiKey });

const response = await webflow.collections.items.listItemsLive(collectionID);
let beaches = response.items;
let allBeaches = format(beaches);
let validBeaches = validate(allBeaches);
let latitudes = mapLatitudes(validBeaches);
let longitudes = mapLongitudes(validBeaches);
let weatherData = await fetchWeatherData(latitudes, longitudes);
let updatedBeaches = mapNewData(weatherData, validBeaches);
updateWebflow(updatedBeaches);

function mapNewData(data, validBeaches) {
  data.forEach((beach, i) => {
    if (beach.current.temperature_2m) {
      validBeaches[i].fieldData["api-current-temp"] =
        beach.current.temperature_2m;
    }
  });

  const formattedData = {
    items: validBeaches,
  };
  return formattedData;
}

async function fetchWeatherData(latitudes, longitudes) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitudes}&longitude=${longitudes}&current=temperature_2m&temperature_unit=fahrenheit&timezone=Europe%2FBerlin&forecast_days=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

function format(data) {
  let formattedData = [];

  data.forEach((beach) => {
    let beachData = {
      id: beach.id,
      fieldData: {
        name: beach.fieldData.name,
        longitude: beach.fieldData.longitude,
        latitude: beach.fieldData.latitude,
      },
    };

    formattedData.push(beachData);
  });

  return formattedData;
}

function validate(beachList) {
  // Validate coordinates
  const validBeaches = beachList.filter((beach) => {
    const isValidLat =
      beach.fieldData.latitude >= -90 && beach.fieldData.latitude <= 90;
    const isValidLong =
      beach.fieldData.longitude >= -180 && beach.fieldData.longitude <= 180;

    if (!isValidLat || !isValidLong) {
      console.warn(
        `Invalid coordinates for beach ${beach.name}: Lat ${beach.latitude}, Long ${beach.longitude}`
      );
      return false;
    }
    return true;
  });

  if (validBeaches.length === 0) {
    console.error("No valid beach coordinates found");
    return;
  }

  return validBeaches;
}

function mapLatitudes(validBeaches) {
  const latitudes = validBeaches
    .map((beach) => beach.fieldData.latitude)
    .join(",");

  return latitudes;
}

function mapLongitudes(validBeaches) {
  const longitudes = validBeaches
    .map((beach) => beach.fieldData.longitude)
    .join(",");

  return longitudes;
}

async function updateWebflow(data) {
  const patchResponse = await fetch(
    `https://api.webflow.com/v2/collections/${collectionID}/items/live`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!patchResponse.ok) {
    throw new Error(`HTTP error! status: ${patchResponse.status}`);
  }

  console.log("Update successful:");
}
