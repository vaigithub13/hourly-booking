import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import messages from "./messages";
import localize from "ajv-i18n";

const translate = (key: string, lang = "en") => {
  if (!messages[key]) {
    return key;
  }

  return messages[key][lang];
};

const i18nPlugin = async (instance: FastifyInstance) => {
  instance.addHook("preSerialization", async (request, reply, payload: any) => {
    let lang = `${request.headers["x-lang"]}`;

    if (lang === "undefined") {
      lang = "en";
    }

    if (payload.message) {
      payload.message = translate(payload.message, lang);
    }

    return payload;
  });

  instance.addHook("onError", async (request, _, payload: any) => {
    let lang = `${request.headers["x-lang"]}`;

    if (lang === "undefined") {
      lang = "en";
    }
    if (payload.message) {
      payload.message = translate(payload.message, lang);
    }

    if (payload.validation) {
      if (lang === "ar") {
        localize.ar(payload.validation);
      } else {
        localize.es(payload.validation);
      }
      const property = payload.validation[0].dataPath.split(".").pop();
      const message = payload.validation[0].message;
      payload.message = `${property} ${message}`;
    }
  });

  instance.addHook(
    "onSend",
    async (request: FastifyRequest, reply: FastifyReply, payload: string) => {
      if (typeof payload === "undefined") {
        return payload;
      }

      if (payload && typeof payload !== "object") {
        let data: any;
        try {
          data = JSON.parse(payload);
        } catch (ex) {
          data = {};
        }
        if (data && !data.openapi) {
          return JSON.stringify({
            success: reply.statusCode === 200,
            data: data.error ? {} : data,
            statusCode: reply.statusCode,
            message: data.message || "",
          });
        }
      }
    }
  );
};

export default fp(i18nPlugin, {
  name: "i18n-plugin",
});
