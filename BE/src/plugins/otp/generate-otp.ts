import dayjs from "dayjs";
import { FastifyInstance } from "fastify";

export const generateOtp = (instance: FastifyInstance) => {
	return {
		// for client testing
		otpCode: `${Math.floor(1000 + Math.random() * 9000)}`,
		// : '1234',
		otpCodeValidUntil: dayjs().add(instance.configs.otp.validUntil, "minute").format(),
	};
};
