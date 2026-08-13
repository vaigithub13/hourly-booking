import { FastifyInstance } from "fastify";
import { UserAddress } from "../user-address/user-address.model";
import {
  ICreateUserAddress,
  IGetUserAddressesQuery,
  IUpdateUserAddress,
  userAddressResponse,
} from "./user-address.dto";
import { PaginatedRequest, RequestData } from "../../types/request";
import { translateMessage } from "../../utils/common-methods";
import { UserAddressFilterService } from "./utils/user-address.filter-service";

const UserAddressService = (instance: FastifyInstance) => {
  const privateMethods = {
    findUserAddressFilter: (query: IGetUserAddressesQuery) => {
      const { userId } = query;
      const filters = new UserAddressFilterService();
      if (userId) filters.equals("userId", userId);
      return filters.build();
    },
  };

  const service = {
    findByPk: async (data: { id: number }) => {
      const { id } = data;
      const address = await UserAddress.findByPk(id);
      if (!address) {
        throw instance.httpErrors.notFound("userAddress.response.notFound");
      }
      return address;
    },
    findMyAddress: async (id: number, userId: number) => {
      const address = await UserAddress.findOne({ where: { id, userId } });
      if (!address) {
        throw instance.httpErrors.notFound("userAddress.response.notFound");
      }
      return address;
    },
    findDefaultAddress: async (data: {
      userId: number;
      throwError: boolean;
    }) => {
      const { throwError, userId } = data;
      const address = await UserAddress.findOne({
        where: { userId, isDefault: true },
      });
      if (!address && throwError) {
        throw instance.httpErrors.notFound("userAddress.response.notFound");
      }
      return address;
    },

    findAll: async (dto: PaginatedRequest<IGetUserAddressesQuery>) => {
      const query = dto.data as IGetUserAddressesQuery;
      const { limit, offset } = dto;
      query.userId = dto.request.user.id;
      const addresses = await UserAddress.findAll({
        where: privateMethods.findUserAddressFilter(query),
        limit,
        offset,
      });
      return addresses.map((address) => userAddressResponse(address));
    },

    create: async (dto: RequestData<ICreateUserAddress>) => {
      let insideDoha = false;
      if (dto.data.lat && dto.data.lng) {
        insideDoha = await instance.searchRevGeocoding({
          lat: dto.data.lat,
          lng: dto.data.lng,
          searchLocation: "Doha",
        });
      }
      if (dto.data.isDefault === true) {
        await UserAddress.update(
          { isDefault: false },
          { where: { userId: dto.request!.user.id } }
        );
      }
      const address = await UserAddress.create({ ...dto.data, insideDoha });
      await address.save();
      return userAddressResponse(address);
    },

    update: async (dto: RequestData<IUpdateUserAddress>) => {
      const address = await service.findByPk({ id: dto.data.id });
      await instance.authorizeUserResource(address, dto.request!.user.id);
      let insideDoha = false;
      if (dto.data.lat && dto.data.lng) {
        insideDoha = await instance.searchRevGeocoding({
          lat: dto.data.lat,
          lng: dto.data.lng,
          searchLocation: "Doha",
        });
      }
      if (dto.data.isDefault === true) {
        await UserAddress.update(
          { isDefault: false },
          { where: { userId: dto.request!.user.id } }
        );
      }
      await address.update({ ...dto.data, insideDoha });
      return userAddressResponse(address);
    },

    delete: async (dto: RequestData<number>) => {
      const address = await service.findByPk({ id: dto.data });
      await instance.authorizeUserResource(address, dto.request!.user.id);
      await address.destroy();
      return {
        message: translateMessage("common.response.success", dto.langCode),
      };
    },
  };

  return service;
};

export default UserAddressService;
