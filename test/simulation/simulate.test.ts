import { describe, it, expect} from "vitest";
import {
	calculateAverageStudent,
	calculateCostAdd, calculateInternshipCost,
	medianScore
} from "../../src/controllers/function/externFunction";
import mockPrisma from "../../src/database/__mocks__/prisma";
import originalPrisma from "../../src/database//prisma";
import { v4 as uuidv4 } from "uuid";

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