import prisma from "../database/prisma";
import fs from "fs/promises";

type ExternData = {
	score: number,
	internshipValue: number,
	internshipName: string,
	numberOfInternship: number,
	class: { year: number}
}

const fetchDataAndConvertToJson = async (filePath: string) => {
	console.time("functionExecution");
	try {
		const data: ExternData[] = await prisma.ranking.findMany({
			select: {
				score: true,
				internshipValue: true,
				internshipName: true,
				numberOfInternship: true,
				class: {
					select: {
						year: true
					}
				}
			}
		});

		const formattedData = data.map(item => ({
			score: item.score,
			internshipName: item.internshipName,
			internshipValue: item.internshipValue,
			numberOfInternship: item.numberOfInternship,
			year: item.class.year
		}));

		const csvHeader = "Score,Internship Name,Internship Value,Number Of Internship,Year";

		const csvRows = formattedData.map(item => {
			return `${item.score},${item.internshipName},${item.internshipValue},${item.numberOfInternship},${item.year}`;
		});

		// Combine header and data rows
		const csvString = `${csvHeader}\n${csvRows.join("\n")}`;

		try {
			// Read the existing CSV data
			let existingData = await fs.readFile(filePath, "utf-8");

			// Remove the header row from the existing data
			const lines = existingData.split("\n");
			lines.shift(); // Remove the first line (header)
			existingData = lines.join("\n"); // Rejoin the lines

			const allData = csvString + "\n" + existingData;

			// Write the modified data back to the CSV file
			await fs.writeFile(filePath, allData, "utf-8");

			console.log("CSV file updated successfully.");
		} catch (error) {
			console.error("Error:", error);
		}

	} catch (error) {
		console.error("Error fetching or converting data:", error);
		throw error;
	}
};

export { fetchDataAndConvertToJson };



