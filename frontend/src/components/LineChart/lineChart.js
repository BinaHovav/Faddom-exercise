import React, { useState } from "react";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";
import './lineChart.scss';


Chart.register(CategoryScale);

export default function LineChart() {
  const [data, setData] = useState(null);
  const [timePeriod, setTimePeriod] = useState("lastDay"); 
  const [period, setPeriod] = useState(3600); 
  const [ipAddress, setIpAddress] = useState("172.31.88.161"); 
  const [loading, setLoading] = useState(false); 

  // Fetching the data based on timePeriod, period, and IP address
  const fetchData = async () => {
    if (!ipAddress) return alert("IP Address is required!");

    setLoading(true); 

    try {
      const response = await fetch(
        `https://faddom-exercise-backend.onrender.com/cpu-usage?timePeriod=${timePeriod}&period=${period}&ipAddress=${ipAddress}`
      );
      const result = await response.json();
      console.log("Fetched data:", result); 

      if (Array.isArray(result.metrics)) {
        // Sort the data in ascending order
        const sortedData = result.metrics.sort(
          (a, b) => new Date(a.Timestamp) - new Date(b.Timestamp)
        );
        setData(sortedData); 
      } else {
        console.error("Error: 'metrics' is not an array.");
        setData([]); 
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); 
    }
  };
  

  // Creating the chart data and organizing data according to instructions
  const chartData = {
    labels: data?.map((point) =>
      new Date(point.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    ),
        datasets: [
      {
        label: "CPU Usage (%)",
        data: data?.map((point) => point.Average), 
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  return (
<div className="chart-container">
  <h1 className="chart-title">CPU Usage Over Time</h1>

  {/* Time period selection */}
  <div className="input-group">
    <label className="input-label">Time Period: </label>
    <select
      value={timePeriod}
      onChange={(event) => setTimePeriod(event.target.value)}
      className="input-select"
    >
      <option value="12h">12h</option>
      <option value="lastDay">Last Day</option>
      <option value="lastMonth">Last Month</option>
      <option value="lastYear">Last Year</option>
    </select>
  </div>

  {/* Period input (in seconds) */}
  <div className="input-group">
    <label className="input-label">Period (seconds): </label>
    <input
      type="number"
      value={period}
      onChange={(event) => setPeriod(event.target.value)}
      className="input-field"
    />
  </div>

  {/* IP address input */}
  <div className="input-group">
    <label className="input-label">IP Address: </label>
    <input
      type="text"
      value={ipAddress}
      onChange={(e) => setIpAddress(e.target.value)}
      className="input-field"
    />
  </div>

  {/* Load button */}
  <div className="button-container">
    <button onClick={fetchData} disabled={loading} className="load-button">
      {loading ? "Loading..." : "Load"}
    </button>
  </div>

  {/* The chart from chartjs library */}

  <h2 className="chart-subtitle">Line Chart</h2>
  {data ? (
    <Line
      data={chartData}
      options={{
        elements: {
          line: {
            borderJoinStyle: "round",
          },
        },
        plugins: {
          title: {
            display: true,
            text: "CPU Usage Over Time",
          },
          legend: {
            display: false,
          },
        },
      }}
    />
  ) : (
    !loading && <p>No data to display. Please load data.</p>
  )}
</div>

  );
}
