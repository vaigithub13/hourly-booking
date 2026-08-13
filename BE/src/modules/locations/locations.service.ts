import { FastifyInstance } from "fastify";
import { Location } from "./locations.model";
import { RequestData } from "../../types/request";
import {
  CreateLocation,
  ISearch,
  LocationResponse,
  UpdateLocation,
  locationResponse,
} from "./locations.dto";
import { translateMessage } from "../../utils/common-methods";
import constants from "../../utils/constants/shared-constants";
import { LocationFilterService } from "./utils/locations.filter-service";

const LocationsService = (instance: FastifyInstance) => {
  const privateMethods = {
    filterLocations: (name?: string) => {
      const filters = new LocationFilterService();
      if (name) {
        filters.substringInsensitive("zone", name);
      }
      return filters.build();
    },
  };
  const service = {
    findLocation: async (id: number) => {
      const location = await Location.findByPk(id);
      if (!location) {
        throw instance.httpErrors.notFound("location.response.notFound");
      }
      return location;
    },
    getLocations: async (dto: RequestData<ISearch>) => {
      const filter = privateMethods.filterLocations(dto.data.name);
      const locations = await Location.findAll({
        where: filter,
        order: [["id", "DESC"]],
      });
      return {
        locations: locations.map((l) =>
          locationResponse(
            l,
            dto.langCode,
            dto.request!.permission.isAdmin || false
          )
        ),
      };
    },
    addLocation: async (dto: RequestData<CreateLocation>) => {
      const location = await Location.create({
        ...dto.data,
      });
      return {
        location: locationResponse(
          location,
          dto.langCode,
          dto.request!.permission.isAdmin
        ),
      };
    },
    editLocation: async (dto: RequestData<UpdateLocation>) => {
      const location = await service.findLocation(dto.data.id);
      await location.update({
        ...dto.data,
      });
      await location.reload();
      return {
        location: locationResponse(
          location,
          dto.langCode,
          dto.request!.permission.isAdmin
        ),
      };
    },
    deleteLocation: async (dto: RequestData<number>) => {
      const location = await service.findLocation(dto.data);
      await location.destroy();
      return {
        result: true,
      };
    },
  };
  return service;
};

export default LocationsService;
