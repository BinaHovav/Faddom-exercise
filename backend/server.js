import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getInstanceIdByIP, getCpuUsage } from "./awsUtils.js";

dotenv.config();

const app = express();
const port = 3030;

// Access AWS credentials from environment variables
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_REGION = process.env.AWS_REGION;

app.use(cors());
app.use(json());

app.get("/cpu-usage", async (req, res) => {
  const { timePeriod = "lastDay", period = 3600, ipAddress } = req.query; // Default values

  if (!ipAddress) {
    return res.status(400).json({ error: "IP Address is required" });
  }

  let startTime;
  const endTime = new Date();

  // Ensure period is an integer
  const intervalSeconds = parseInt(period, 10);

  if (isNaN(intervalSeconds) || intervalSeconds <= 0) {
    return res.status(400).json({ error: "Invalid interval value. It must be a positive number." });
  }

  // Calculate start time based on selected time period
  switch (timePeriod) {
    case "12h":
      startTime = new Date(endTime.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
      break;
    case "lastDay":
      startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      break;
    case "lastMonth":
      startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      break;
    case "lastYear":
      startTime = new Date(endTime.getTime() - 365 * 24 * 60 * 60 * 1000); // 365 days ago
      break;
    default:
      startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Default to last day
      break;
  }

  try {
    // Retrieve the instance ID using the provided IP address
    const instanceId = await getInstanceIdByIP(ipAddress, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION);

    // Retrieve CPU usage metrics from CloudWatch
    const metrics = await getCpuUsage(instanceId, startTime, endTime, intervalSeconds);

    res.json({ instanceId, metrics });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
