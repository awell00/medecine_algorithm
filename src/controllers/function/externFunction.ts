import prisma from "../../database/prisma";

// TODO: Change the classment to ranking
const calculateAverageStudent = async (externId: string) => {
	const result = await prisma.extern.findFirst({
		where: {
			id: externId
		}, 
		include: {
			class: {
				select: {
					numberOfStudent: true
				}
			}
		}
	});

	const numberOfStudent = result.class.numberOfStudent;

	return [numberOfStudent / 2, numberOfStudent];
};


const calculateCostAdd = async (value: number, ranking: number, calculateAvgFn: number[]) => { // REVOIR

	const resultStudent = calculateAvgFn;

	// Bonus
	if (value >= 500 && value <= 1000) {
		const bonusCost = (((value - 500) / 50) * 0.01) * value;

		// Classment Bonus
		if (ranking <= resultStudent[0] && ranking >= 1) {
			const bonusRanking = (((resultStudent[0] - ranking) / 5) * 0.05) * (value - 500);
			return parseFloat((bonusRanking + bonusCost).toFixed(1));
		}

		// Classment Malus
		if (ranking >= resultStudent[0] && ranking <= resultStudent[1]) {
			const malusRanking = (((ranking - resultStudent[0]) / 5) * 0.08) * (value - 500);
			return parseFloat((-malusRanking).toFixed(1));
		}
	}

	// Malus 
	if (value <= 500 && value >= 1) {
		const malusCost = (((500 - value) / 50) * 0.01) * (500 + (500 - value));

		// Classment Malus
		if (ranking >= resultStudent[0] && ranking <= resultStudent[1]) {
			const malusRanking = (((ranking - resultStudent[0]) / 5) * 0.05) * (500 - value);
        
			return parseFloat((-(malusRanking + malusCost)).toFixed(1));
        
		}
		// Classment Bonus
		if (ranking <= resultStudent[0] && ranking >= 1) {
			const bonusRanking = (((resultStudent[0] - ranking) / 5) * 0.08) * (500 - value);
			return parseFloat((bonusRanking).toFixed(1));
		}

	}

	return 0;
};

const medianScore = async (externId: string) => {
    
	const result = await prisma.extern.findFirst({
		where: {
			id: externId
		}, 
		include: {
			class: {
				select: {
					ranking: {
						select: {
							score: true
						}
					}
				}
			}
		}
	});

	const rankScore = result.class.ranking;

	// Use Array.isArray to filter out non-numeric elements and convert the rest to numbers
	const listScore: (number | string)[] = rankScore.map((list) => list.score);

	if (listScore.includes("assigned")) {
		throw new Error("The median can't be calculated due to the internship assigned in the student ranking.");
	}

	const mid = Math.floor(listScore.length / 2);

	// Filter out non-numeric values before sorting
	const numericScores: number[] = listScore
		.filter((score) => typeof score === "number")
		.map((score) => Number(score));

	const sorted: number[] = numericScores.sort((a, b) => a - b);

	return numericScores.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// FIXME: WHY USE LASTPREVIOUS ??
// TODO: affichage pourcentage bonus pour stage peu demender qui incite a remonter dans le classement et avoir forcement un stage

const calculateInternshipCost = async (externId: string, ranking: number, status: boolean, internshipId: string): Promise<number> => {

	const internship = await prisma.internship.findFirst({
		where: { id: internshipId },
		select: {
			new: true
		}
	});

	if (!internship.new) {
		// Handle the case where internship or internship.new is undefined or null
		return null; // or handle the error appropriately
	}

	// const lastPrevious = internship.previous[internship.previous.length - 1];
	// console.log(internship.previous);
	 
	const currentExtern = await prisma.currentOfExtern.findMany({
		where: { externId },
	});

	const adjustCost = currentExtern.reverse().map((list, i) => list.cost * (1-(i*0.2)));
	const externAdjustLength = currentExtern.length * 0.1;

	const averageAdujstCost = adjustCost.reduce((accumulate, value) => accumulate + value, 0) / ((1.1 - externAdjustLength) * currentExtern.length);

	if (status === false) {
		const median = await medianScore(externId);
		return (median + (averageAdujstCost * externAdjustLength)) / (1 + externAdjustLength);
	} 

	const costAdd = await calculateCostAdd(internship.new.value, ranking, await calculateAverageStudent(externId));
	// console.log(lastPrevious.value);
	return internship.new.value+ costAdd;
};

export { calculateInternshipCost, calculateAverageStudent, calculateCostAdd, medianScore };