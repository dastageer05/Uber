const axios = require("axios");

module.exports.getAddressCoordinates = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  // const url = "https://maps.gomaps.pro/maps/api/directions/json?";
  const url = `https://maps.gomaps.pro/maps/api/geocode/json?address= ${encodeURIComponent(
    address
  )}&key=${apiKey}`;
  try {
    // const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    //     params: {
    //         address: address,
    //         key: 'YOUR_GOOGLE_MAPS_API_KEY'
    //     }
    // });
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const distanceTime = response.data.rows[0].elements[0];
      if (!distanceTime.distance || !distanceTime.duration) {
        throw new Error("Unable to fetch distance and time");
      }
      return {
        distance: distanceTime.distance.text,
        duration: distanceTime.duration.text,
      };
    } else {
      throw new Error("Unable to fetch distance and time");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  if (!input) {
    throw new Error("Input is required");
  }
  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      return response.data.predictions.map(
        (prediction) => prediction.description
      );
    } else {
      throw new Error("Unable to fetch suggestions");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
  // radius in km

  const captains = await captainModel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[ltd, lng], radius / 6371],
      },
    },
  });

  return captains;
};
