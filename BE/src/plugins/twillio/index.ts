import { FastifyInstance } from "fastify";
import Twillio from "twilio";
import fp from "fastify-plugin";

const smsPlugin = async (instance: FastifyInstance) => {
  const client = Twillio(
    instance.configs.twilio.sid,
    instance.configs.twilio.auth
  );
  const serviceSidSMS = instance.configs.twilio.serviceSidSMS;
  instance.decorate("sendSMS", async (phone: string, lang: string) => {
    try {
      const verification = await client.verify.v2
        .services(serviceSidSMS)
        .verifications.create({
          to: phone,
          channel: "sms",
          locale: lang,
        });
      return {
        done: true,
      }; // Return the service SID for verification
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  instance.decorate("sendWhatsappOTP", async (phone: string, lang: string) => {
    try {
      // Send SMS verification
      const verification = await client.verify.v2
        .services(serviceSidSMS)
        .verifications.create({
          to: phone,
          channel: "whatsapp",
          locale: lang,
        });

      return {
        done: true,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  instance.decorate("verifyOtp", async (phone: string, code: string) => {
    try {
      const verificationCheck = await client.verify.v2
        .services(serviceSidSMS)
        .verificationChecks.create({
          to: phone,
          code: code,
        });
      return {
        status: verificationCheck.status,
      };
    } catch (error: any) {
      if (error.status == 429 && error.code == 60202)
        return {
          status: "max",
        };
      throw error;
    }
  });
};

export default fp(smsPlugin, {
  name: "sms-plugin",
});
