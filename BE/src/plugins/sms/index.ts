import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import {
  ISMSResponse,
  ISendSMSPayload,
  MessageEncodingEnum,
  MessageTypeEnum,
  SMSalaURL,
  buildOTPTextMessage,
} from "./utils";
import axios from "axios";

const smsalaPlugin = async (instance: FastifyInstance) => {
  instance.decorate("sendSMS", async (phoneNumber: string, otpCode: string) => {
    try {
      // phone number should be with country code but without the "+"
      if (phoneNumber[0] === "+") {
        phoneNumber = phoneNumber.slice(1);
      }
      const body: ISendSMSPayload[] = [
        {
          apiToken: instance.configs.smsala.apiKey,
          messageType: MessageTypeEnum.TRANSACTIONAL,
          messageEncoding: MessageEncodingEnum.ASCI,
          destinationAddress: phoneNumber,
          sourceAddress: instance.configs.smsala.sourceAddress,
          messageText: buildOTPTextMessage(
            otpCode,
            instance.configs.smsala.sourceAddress
          ),
        },
      ];
      const { data } = await axios.post<ISMSResponse[]>(SMSalaURL, body);
      if (data[0]?.Status === "Success") {
        return true;
      } else {
        throw instance.httpErrors.internalServerError(
          "user.response.sendOTPFailed"
        );
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  });
};

export default fp(smsalaPlugin, {
  name: "smsala-plugin",
});
