import {
  headersSchema,
  langsSchema,
  langsSchema2,
  langsSchema3,
  locationOptionalSchema,
  locationSchema,
  deviceSchema,
} from "./../../utils/json-schema";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

const jsonSchemaPlugin = async (instance: FastifyInstance) => {
  instance.addSchema(headersSchema);
  instance.addSchema(langsSchema);
  instance.addSchema(langsSchema2);
  instance.addSchema(langsSchema3);
  instance.addSchema(locationSchema);
  instance.addSchema(locationOptionalSchema);
  instance.addSchema(deviceSchema);
};

export default fp(jsonSchemaPlugin, {
  name: "json-schema-plugin",
});
