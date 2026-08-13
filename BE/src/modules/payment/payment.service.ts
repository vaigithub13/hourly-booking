import { FastifyInstance } from "fastify";
import axios, { AxiosResponse } from "axios";
import crypto, { randomUUID } from "crypto";
import { JObject } from "src/types/common-types";
import { Payments } from "./payment.model";
import {
  ICreatePaymentDto,
  ISCCreatePaymentPayload,
  ISCPaymentResponse,
} from "./payment.dto";

const PaymentService = (instance: FastifyInstance) => {
  const encryptHeader = (data: JObject) => {
    let hashed = "";
    for (const key in data) {
      hashed += `${key.charAt(0).toUpperCase() + key.substring(1)}=${
        data[key]
      },`;
    }
    hashed = hashed.substring(0, hashed.length - 1);
    const hmac = crypto.createHmac(
      "sha256",
      instance.configs.skipCash.secretKey
    );
    hmac.update(hashed);
    const calculatedSignature = hmac.digest("base64");
    return calculatedSignature;
  };

  const service = {
    createPayment: async (dto: ICreatePaymentDto) => {
      const {
        amount,
        transactionId,
        user,
        toPayWithWallet = 0,
        locationId,
      } = dto;
      const data: ISCCreatePaymentPayload = {
        Uid: randomUUID(),
        KeyId: instance.configs.skipCash.keyId,
        Amount: amount.toFixed(2),
        FirstName: user?.firstName || "userFirstName",
        LastName: user?.lastName || "userLastName",
        Phone: user.phoneNumber,
        Email: user?.email || "none@email.com",
        TransactionId: `${transactionId}`,
        Custom1: `${toPayWithWallet}`,
      };

      // test url:  "https://skipcashtest.azurewebsites.net/api/v1/payments",
      const response = await axios.post<ISCPaymentResponse>(
        `${instance.configs.skipCash.baseUrl}/api/v1/payments`,
        data,
        {
          headers: {
            Authorization: encryptHeader(data),
          },
        }
      );
      const payment = new Payments({
        uid: data.Uid,
        amount: data.Amount,
        transactionId: data.TransactionId,
        toPayWithWallet: `${toPayWithWallet}`,
        locationId: locationId,
        statusId: response.data.resultObj.statusId.toString(),
        paymentUrl: response.data.resultObj.payUrl,
        paymentId: response.data.resultObj.id,
        skipCashResponse: response.data.resultObj,
      });
      await payment.save();
      return payment;
    },

    getPaymentDetails: async (paymentId: string) => {
      return await Payments.findOne({ where: { paymentId: paymentId } });
    },

    getPaymentDetailsFromSkipCash: async (paymentId: string) => {
      const response = await axios.get<ISCPaymentResponse>(
        `${instance.configs.skipCash.baseUrl}/api/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: instance.configs.skipCash.clientId,
          },
        }
      );
      return response;
    },
  };

  return service;
};

export default PaymentService;
