import fp from "fastify-plugin";
import AWS from "aws-sdk";
import { FastifyInstance } from "fastify";
import { Multipart, MultipartFile } from "@fastify/multipart";
export interface IUploadResponse {
	originalKey: string;
	compressedKey: string;
}

const uploadToS3Plugin = async (instance: FastifyInstance) => {
	const s3 = new AWS.S3({
		accessKeyId: instance.configs.s3.key,
		secretAccessKey: instance.configs.s3.secret,
		region: "ap-southeast-1",
	});
	const lambda = new AWS.Lambda({
		accessKeyId: instance.configs.s3.key,
		secretAccessKey: instance.configs.s3.secret,
		region: "ap-southeast-1",
	});

	const compressedFilesFolder = "compressed";
	async function compressAndUploadImageLambdaFunction(objectKey: string, compressionPercentage: number) {
		const params = {
			FunctionName: instance.configs.lambda.compressionFunctionName, // Replace 'your-function-name' with the name of your Lambda function
			InvocationType: "Event", // Can be 'Event' for asynchronous invocation
			Payload: JSON.stringify({
				Records: [
					{
						s3: {
							bucket: {
								name: instance.configs.s3.bucketName, // Replace 'your-s3-bucket-name' with your S3 bucket name
							},
							object: {
								key: objectKey, // Replace 'your-s3-object-key' with the key of the object in your S3 bucket,
								compressionPercentage,
								compressedFilesFolder, // The folder which will the files be placed in
							},
						},
					},
				],
			}),
		};

		lambda.invoke(params, (err, data) => {
			if (err) {
				console.error("Error invoking Lambda function:", err);
			} else {
				console.log("Lambda function response:", data);
			}
		});
	}

	instance.decorate(
		"uploadFile",
		// @ts-ignore
		async (parts: Multipart[], folder: string) => {
			// Validate input
			if (!Array.isArray(parts)) {
				throw instance.httpErrors.badRequest("Invalid input: parts must be an array");
			}

			// Process each part (image)
			const uploads = parts.map(async (part: Multipart) => {
				// Ensure the part has a file
				// @ts-ignore
				if (part.file) {
					// Sanitize the filename
					// @ts-ignore
					const fileNm = part.filename.split(" ").join("");
					const fileName = `${Date.now()}-${fileNm}`;
					// @ts-ignore
					const buffer = await part.toBuffer();
					const maxSize = 5000 * 1024;
					const size = buffer.length;
					let compressPercentage = 99;

					if (size > maxSize) {
						compressPercentage = Math.max(100 - (maxSize * 100) / size, 85);
					}

					// Determine content type (optional)
					const extension = fileNm.split(".").pop()?.toLowerCase() || "";
					const allowedExtensions = ["jpg", "jpeg", "png", "pdf"]; // Add allowed extensions here
					let contentType: string | undefined;

					if (!allowedExtensions.includes(extension)) {
						throw instance.httpErrors.badRequest(`File format not supported: ${extension}`);
					}

					if (extension === "pdf") {
						contentType = "application/pdf";
						const originalKey = await uploadToS3(`${folder}/${fileName}`, buffer, contentType);
						// Return uploaded file details
						return `${originalKey}`;
					} else {
						// Set content type based on extension (optional)
						contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;

						// Upload original image to S3
						const originalKey = await uploadToS3(`${folder}/${fileName}`, buffer, contentType);

						compressAndUploadImageLambdaFunction(originalKey, compressPercentage);

						// Return uploaded file details
						return `${compressedFilesFolder}/${originalKey}`;
					}
				}

				throw instance.httpErrors.badRequest("Part does not contain a file");
			});

			// Wait for all uploads to complete
			return Promise.all(uploads);
		}
	);

	async function uploadToS3(fileName: string, buffer: Buffer, contentType?: string): Promise<string> {
		return new Promise((resolve, reject) => {
			s3.upload({
				Bucket: instance.configs.s3.bucketName,
				Key: fileName,
				Body: buffer,
				ContentType: contentType,
				ACL: "public-read",
			})
				.promise()
				.then((result) => resolve(result.Key))
				.catch((err) => reject(err));
		});
	}

	instance.decorate("uploadFileBase64", async (base64: string) => {
		const base64Data = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");

		// Getting the file type, ie: jpeg, png ..etc
		const type = base64.split(";")[0].split("/")[1];

		let contentType = `image/${type}`;
		if (type.includes("svg")) {
			contentType = "image/svg+xml";
		}

		return new Promise(function (resolve, reject) {
			s3.upload({
				Bucket: instance.configs.s3.bucketName,
				Key: `${Date.now()}.${type.replace("+xml", "")}`, // type is not required
				Body: base64Data,
				ACL: "public-read",
				ContentEncoding: "base64", // required
				ContentType: contentType, // required. Notice the back ticks
			})
				.promise()
				.then((result) => resolve(result.Key))
				.catch((err) => reject(err));
		});
	});

	instance.decorate("getPictureURL", (fileName: string) => {
		let url = instance.configs.s3.baseUrl;
		if (url[url.length - 1] === "/") url = url.slice(0, -1);
		return `${url}/${fileName}`;
	});
};

export default fp(uploadToS3Plugin, {
	name: "upload-s3-plugin",
});
