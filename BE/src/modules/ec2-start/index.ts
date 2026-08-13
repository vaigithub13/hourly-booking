import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { FastifyRequestTypebox } from 'src/types/FastifyTypebox';

dotenv.config();

export default async function routes(fastify: FastifyInstance) {
    const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();

    // ✅ Initialize AWS SDK configuration
    AWS.config.update({
        accessKeyId: process.env.AWS_S3_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET,
        region: 'ap-southeast-1',
    });

    const ec2 = new AWS.EC2();
    const rds = new AWS.RDS();

    // ✅ Function to start both EC2 and RDS
    async function startAwsInstances() {
        const ec2Params = { InstanceIds: ['i-0e9764ab3b5203a44' as string] };
        const rdsParams = { DBInstanceIdentifier: 'staging-db' as string };

        const [ec2Result, rdsResult] = await Promise.all([
            ec2.startInstances(ec2Params).promise(),
            rds.startDBInstance(rdsParams).promise(),
        ]);

        return {
            ec2Result,
            rdsResult,
        };
    }

    // ✅ Fastify route: calls only one function for both EC2 + RDS
    instance.get('/', async (request: FastifyRequestTypebox<{}>, reply) => {
        try {
            const result = await startAwsInstances();
            return reply.send({
                message: 'EC2 and RDS start initiated successfully',
                result,
            });
        } catch (error: any) {

            request.log.error(error);
            const awsError = {
                message: error.message || 'Unknown AWS Error',
                code: error.code,
                time: error.time,
                requestId: error.requestId,
                statusCode: error.statusCode,
                stack: error.stack,
            };
            return reply.status(500).send({
                message: 'Error ' + process.env.AWS_S3_KEY + ' ' + process.env.AWS_S3_SECRET + ' ' + '' + JSON.stringify(awsError),
            });
        }
    });
}
