import { promisify } from "util";
import { getApp } from "./app";
import { registerJobs } from "./jobs";
import { runOnAppInit } from "./utils/on-app-init";
import crypto from "crypto";
const scrypt = promisify(crypto.scrypt);
process.env.TZ = "Asia/Kolkata";

const main = async () => {
	const salt = crypto.randomBytes(8).toString("hex");
	const app = await getApp();
	async function closeGracefully(signal: string) {
		console.info(`Received signal to terminate: ${signal}`);

		// shutdown the server
		await app.close();

		process.kill(process.pid, signal);
	}

	process.once("SIGINT", closeGracefully);
	process.once("SIGTERM", closeGracefully);

	try {
		await app.listen({ port: app.configs.instance.port, host: "0.0.0.0" });
		app.log.info(`App is running on ports : ${app.configs.instance.port}`);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
	runOnAppInit();
};

async function runApp() {
	await main();
	registerJobs();
}

runApp();
