import prisma from "../../database/prisma";

const averageCost = async (externId: string, propertyName: string) => {
	const cost = await getCost(externId, propertyName);
	return cost.reduce((accumulate: number, value: number) => accumulate + value, 0) / cost.length;
};

/**
 * Retrieve the cost values for a given extern ID and property name
 * @param externId The ID of the extern
 * @param propertyName It can be current or previous class
 * @returns An array of cost values
 */
const getCost = async (externId: string, propertyName: string): Promise<number[]> => {
	if (propertyName === "current") {
		// Retrieve the cost values for the given extern ID and property name
		const result = await prisma.currentOfExtern.findMany({
			where: { externId },
			select: { cost: true },
		});

		console.log(result);
		
  
		// Extract the cost values from the result
		return result.map((result) => result.cost);
	} else if (propertyName === "previous") {
		// Retrieve the cost values for the given extern ID and property name
		const result = await prisma.previousOfExtern.findMany({
			where: { externId },
			select: { cost: true },
		});

		console.log(result);
		
  
		// Extract the cost values from the result
		return result.map((result) => result.cost);
	}
};


const calculateScore = async (externId: string) => {
	const random = Math.floor(Math.random() * 1000) + 1;

	const externPreviousCount = await prisma.previousOfExtern.count({
		where: { externId },
	});

	const externCurrentCount = await prisma.currentOfExtern.count({
		where: { externId },
	});

	const result = await prisma.extern.findFirst({
		where: {
			id: externId
		}, 
		include: {
			class: {
				select: {
					numberOfInternship: true
				}
			}
		}
	});

	const numberOfInternship = result.class.numberOfInternship;

	const averageCurrentCost = await averageCost(externId, "current");

	if (externPreviousCount !== 0) {
		const averagePreviousCost = await averageCost(externId, "previous");
		const adjustCost = externPreviousCount * 0.1;
		return parseFloat(((averagePreviousCost * adjustCost + averageCurrentCost) / (1 + adjustCost)).toFixed(1));
	} else if (externCurrentCount !== 0) {
		return parseFloat((averageCurrentCost).toFixed(1));
	} else if (externCurrentCount === 0 || numberOfInternship === 1) {
		return random;
	}
};

export { calculateScore };