import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { CloudWatchClient, GetMetricStatisticsCommand } from "@aws-sdk/client-cloudwatch";
import dotenv from "dotenv";
dotenv.config();

const awsConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
};

export const getInstanceIdByIP = async (ipAddress = process.env.IP_ADDRESS) => {
  const ec2Client = new EC2Client(awsConfig);
  
  const { Reservations = [] } = await ec2Client.send(
    new DescribeInstancesCommand({
      Filters: [{ 
        Name: "network-interface.addresses.private-ip-address", 
        Values: [ipAddress] 
      }]
    })
  );

  const instanceId = Reservations[0]?.Instances[0]?.InstanceId;
  if (!instanceId) throw new Error("No instance found");

  return instanceId;
};

export const getCpuUsage = async (instanceId, startTime, endTime, interval) => {
  const cloudWatchClient = new CloudWatchClient(awsConfig);

  const command = new GetMetricStatisticsCommand({
    Namespace: "AWS/EC2",
    MetricName: "CPUUtilization",
    Dimensions: [{ Name: "InstanceId", Value: instanceId }],
    StartTime: startTime,
    EndTime: endTime,
    Period: Number(interval),
    Statistics: ["Average", "Maximum", "Minimum"],
    Unit: "Percent",
  });

  try {
    const { Datapoints = [] } = await cloudWatchClient.send(command);
    return Datapoints;
  } catch (error) {
    console.error("Error fetching CloudWatch metrics:", error);
    throw error;
  }
};

