import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import axios from "axios";

const googleMapsPlugin = async (instance: FastifyInstance) => {
  instance.decorate(
    "searchRevGeocoding",
    async (data: { lng: string; lat: string; searchLocation: string }) => {
      const { lat, lng, searchLocation } = data;

      if (!lat || !lng)
        throw instance.httpErrors.badRequest(
          "Long and latitude should be provided."
        );

      const response = await axios.get<{ results: any[] }>(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${lat},${lng}`,
            key: instance.configs.googleMaps.apiKey,
          },
        }
      );
      const results = response.data.results;

      return results.some((result) =>
        result["formatted_address"].includes(searchLocation)
      );
    }
  );
};

export default fp(googleMapsPlugin, {
  name: "googleMapsPlugin",
});
