import { describe, it, expect} from "vitest";
import {
	calculateAverageStudent,
	calculateCostAdd, calculateInternshipCost,
	medianScore
} from "../../../src/controllers/function/externFunction";
import mockPrisma from "../../../src/database/__mocks__/prisma";
import originalPrisma from "../../../src/database//prisma"; // Adjust the path accordingly
import { v4 as uuidv4 } from "uuid";
import prisma from "../../../src/database//prisma";

type MockExtern = {
	id: string;
	class: { numberOfStudent: number };
};

type MockInternship = {
	id: string;
	new: {
		value: number
	};
};

describe("CalculateAverageStudent", () => {
	it("Should calculate average student count correctly", async () => {
		const castedMockPrisma = mockPrisma as unknown as typeof originalPrisma;

		originalPrisma.extern.findFirst = castedMockPrisma.extern.findFirst;

		// Mock the Prisma response
		const id = uuidv4();

		const mockExtern: MockExtern = {
    	id,
    	class: {
    		numberOfStudent: 10,
    	},
		};

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.extern.findFirst.mockResolvedValueOnce(mockExtern);

		const externId = "someId";
		const [average, total] = await calculateAverageStudent(externId);

		expect(average).toEqual(5);
		expect(total).toEqual(10);
	});
} );

describe("CalculateCostAdd", () => {
	it("Should calculate the cost of extern | Bonus - Bonus ", async () => {

		const ranking = 10;
		const value = 750;

		// Mock calculateAverageStudent function
		const mockCalculateAverageStudent = async () => [50, 100];
		const resultStudent = await mockCalculateAverageStudent();

		const bonusCost = (((value - 500) / 50) * 0.01) * value;
		const bonusRanking = (((resultStudent[0] - ranking) / 5) * 0.05) * (value - 500);
		const result = parseFloat((bonusRanking + bonusCost).toFixed(1));

		const cost = await calculateCostAdd(value, ranking, await mockCalculateAverageStudent());
		expect(cost).toEqual(result);
	});

	it("Should calculate the cost of extern | Bonus - Malus ", async () => {

		const ranking = 90;
		const value = 750;

		// Mock calculateAverageStudent function
		const mockCalculateAverageStudent = async () => [50, 100];
		const resultStudent = await mockCalculateAverageStudent();

		const malusRanking = (((ranking - resultStudent[0]) / 5) * 0.08) * (value - 500);
		const result = parseFloat((-malusRanking).toFixed(1));

		const cost = await calculateCostAdd(value, ranking, await mockCalculateAverageStudent() );
		expect(cost).toEqual(result);
	});

	it("Should calculate the cost of extern | Malus - Malus ", async () => {

		const ranking = 90;
		const value = 250;

		// Mock calculateAverageStudent function
		const mockCalculateAverageStudent = async () => [50, 100];
		const resultStudent = await mockCalculateAverageStudent();

		const malusCost = (((500 - value) / 50) * 0.01) * (500 + (500 - value));
		const malusRanking = (((ranking - resultStudent[0]) / 5) * 0.05) * (500 - value);
		const result = parseFloat((-(malusRanking + malusCost)).toFixed(1));

		const cost = await calculateCostAdd(value, ranking, await mockCalculateAverageStudent());
		expect(cost).toEqual(result);
	});

	it("Should calculate the cost of extern | Malus - Bonus ", async () => {

		const ranking = 10;
		const value = 250;

		// Mock calculateAverageStudent function
		const mockCalculateAverageStudent = async () => [50, 100];
		const resultStudent = await mockCalculateAverageStudent();

		const bonusRanking = (((resultStudent[0] - ranking) / 5) * 0.08) * (500 - value);
		const result = parseFloat((bonusRanking).toFixed(1));

		const cost = await calculateCostAdd(value, ranking, await mockCalculateAverageStudent());
		expect(cost).toEqual(result);
	});
});

describe("MedianScore", () => {
	type MockExtern = {
		id: string;
		class: { ranking: { score: number | string }[] };

	};

	const castedMockPrisma = mockPrisma as unknown as typeof originalPrisma;

	originalPrisma.extern.findFirst = castedMockPrisma.extern.findFirst;

	// Mock the Prisma response
	const id = uuidv4();

	it("Should calculate median of student's score in class | Even", async () => {

		const mockScores = [{ score: 120.0 }, { score: 340.0 }, { score: 20.0 }, { score: 30.0 }];

		const mockExtern: MockExtern = {
			id,
			class: {
				ranking: mockScores
			},
		};

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.extern.findFirst.mockResolvedValueOnce(mockExtern);

		const externId = "someId";
		const median = await medianScore(externId);

		expect(median).toEqual(75);
	});

	it("Should calculate median of student's score in class | Odd", async () => {

		const mockScores = [{ score: 120.0 }, { score: 340.0 }, { score: 98 }, { score: 20.0 }, { score: 30.0 }];

		const mockExtern: MockExtern = {
			id,
			class: {
				ranking: mockScores
			},
		};

		const listScore = mockScores.map((list) => list.score);
		listScore.sort((a, b) => a - b);
		const mid = Math.floor(listScore.length / 2);
		const valueCenter = listScore[mid];

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.extern.findFirst.mockResolvedValueOnce(mockExtern);

		const externId = "someId";
		const median = await medianScore(externId);

		expect(median).toEqual(98);
		expect(median).toEqual(valueCenter);
	});

	it("Should not calculate median of student's score in class ", async () => {
		try {
			const mockScores = [{ score: "assigned" }, { score: 340.0 }, { score: 98 }, { score: 20.0 }, { score: 30.0 }];

			const mockExtern: MockExtern = {
				id,
				class: {
					ranking: mockScores
				},
			};

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			mockPrisma.extern.findFirst.mockResolvedValueOnce(mockExtern);

			const externId = "someId";

			await medianScore(externId);
		} catch (error) {
			// Assert that the error message matches the expected message
			expect(error.message).toBe("The median can't be calculated due to the internship assigned in the student ranking.");
		}
	});
} );

describe("CalculateInternshipCost", async () => {

	const externId = "someId";
	const internshipId = "someId";
	const value = 100;
	const numberOfStudent = 100;
	const ranking = 25;

	// Mock the Prisma response
	const idExtern = uuidv4();
	const idInternship = uuidv4();

	const mockExtern: MockExtern = {
		id: idExtern,
		class: {
			numberOfStudent,
		},
	};

	const mockInternship: MockInternship = {
		id: idInternship,
		new: {
			value,
		},
	};

	const castedMockPrisma = mockPrisma as unknown as typeof originalPrisma;

	originalPrisma.extern.findFirst = castedMockPrisma.extern.findFirst;
	originalPrisma.internship.findFirst = castedMockPrisma.internship.findFirst;

	it("Should calculate cost of Internship", async () => {

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.extern.findFirst.mockResolvedValueOnce(mockExtern);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.internship.findFirst.mockResolvedValueOnce(mockInternship);

		const mockCalculateAverageStudent = async () => [numberOfStudent/2, numberOfStudent];
		const costAdd = await calculateCostAdd(value, ranking, await mockCalculateAverageStudent());

		const result = await calculateInternshipCost(externId, ranking, true, internshipId);

		expect(result).toEqual(value + costAdd);
		expect(result).toEqual(260);
	});

	// TODO: Mock value in current Extern
	it("Should calculate cost with median", async () => {

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.extern.findFirst.mockResolvedValueOnce(mockExtern);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.internship.findFirst.mockResolvedValueOnce(mockInternship);

		const mockCalculateAverageStudent = async () => [numberOfStudent/2, numberOfStudent];
		const costAdd = await calculateCostAdd(value, ranking, await mockCalculateAverageStudent());

		const result = await calculateInternshipCost(externId, ranking, false, internshipId);

		// const median = await medianScore(externId);
		// const medianResult = (median + (averageAdujstCost * externAdjustLength)) / (1 + externAdjustLength);

		expect(result).toEqual(value + costAdd);
		expect(result).toEqual(260);
	});
} );
