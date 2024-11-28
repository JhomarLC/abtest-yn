import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import the external CSS file

function App() {
	const [data, setData] = useState(null); // State to store fetched data
	const [error, setError] = useState(null); // State to store errors if any
	const [loading, setLoading] = useState(true); // State to indicate loading status

	useEffect(() => {
		// Define the headers
		const headers = {
			"X-Api-Token": "a23a7734e3687c683e68c7f26140b7f1", // Replace with your actual token or header value
			"Content-Type": "application/json", // Optional: specify the content type
		};

		// Make a GET request using Axios
		axios
			.get("https://api.wishpond.com/api/v1/lists?type=smart", {
				headers: headers,
			})
			.then((response) => {
				setData(response.data); // Update state with fetched data
				setLoading(false); // Set loading to false
			})
			.catch((error) => {
				setError(error); // Handle error
				setLoading(false); // Set loading to false
			});
	}, []); // Empty dependency array ensures this runs only once when the component mounts

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

	// Filter the data for entries with "VARIATION1 VR-FORM" or "ORIGINAL VR-FORM"
	const filteredLists = data.lists.filter(
		(list) => list.name.includes("AB TEST") && list.name.includes("VR-FORM")
	);

	// Group the filtered lists by country
	const groupedByCountry = filteredLists.reduce((acc, list) => {
		const country = list.name.split(" ")[0]; // Extract the country code (e.g., "FR", "DE", "IT")
		if (!acc[country]) {
			acc[country] = [];
		}
		acc[country].push(list);
		return acc;
	}, {});

	// Calculate percentages and counts for each country
	const calculateStats = (lists) => {
		const originalYes =
			lists.find((list) => list.name.includes("ORIGINAL VR-FORM YES"))
				?.lead_count || 0;
		const originalNo =
			lists.find((list) => list.name.includes("ORIGINAL VR-FORM NO"))
				?.lead_count || 0;

		const variationYes =
			lists.find((list) => list.name.includes("VARIATION1 VR-FORM YES"))
				?.lead_count || 0;
		const variationNo =
			lists.find((list) => list.name.includes("VARIATION1 VR-FORM NO"))
				?.lead_count || 0;

		const originalTotal = originalYes + originalNo;
		const variationTotal = variationYes + variationNo;

		return {
			Original: {
				YesCount: originalYes,
				NoCount: originalNo,
				YesPercent: originalTotal
					? ((originalYes / originalTotal) * 100).toFixed(2)
					: "0.00",
				NoPercent: originalTotal
					? ((originalNo / originalTotal) * 100).toFixed(2)
					: "0.00",
			},
			Variation1: {
				YesCount: variationYes,
				NoCount: variationNo,
				YesPercent: variationTotal
					? ((variationYes / variationTotal) * 100).toFixed(2)
					: "0.00",
				NoPercent: variationTotal
					? ((variationNo / variationTotal) * 100).toFixed(2)
					: "0.00",
			},
		};
	};

	return (
		<div className="app-container">
			<h1>Lead Breakdown by Country</h1>
			{Object.keys(groupedByCountry).map((country) => {
				const stats = calculateStats(groupedByCountry[country]);

				return (
					<div key={country}>
						<h2>{country}</h2>
						<div className="table-container">
							<table className="styled-table">
								<thead>
									<tr>
										<th>Category</th>
										<th>Yes (Count)</th>
										<th>No (Count)</th>
										<th>Yes (%)</th>
										<th>No (%)</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Original</td>
										<td>{stats.Original.YesCount}</td>
										<td>{stats.Original.NoCount}</td>
										<td>{stats.Original.YesPercent}</td>
										<td>{stats.Original.NoPercent}</td>
									</tr>
									<tr>
										<td>Variation1</td>
										<td>{stats.Variation1.YesCount}</td>
										<td>{stats.Variation1.NoCount}</td>
										<td>{stats.Variation1.YesPercent}</td>
										<td>{stats.Variation1.NoPercent}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default App;
