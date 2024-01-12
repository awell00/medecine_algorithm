import { Rank } from "@prisma/client";
import prisma from "../../database/prisma";

/**
 * Retrieve rank values for a given internship
 * @param internship The ID of the internship
 * @returns An array of rank values
 */
const rankValues = async (internship: string): Promise<Rank[]> => {
	// Retrieve the internship details, including the number of internships in the class
	const result = await prisma.internship.findFirst({
		where: {
			id: internship,
		},
		include: {
			class: {
				select: {
					numberOfInternship: true,
				},
			},
		},
	});

	// Extract the number of internships from the result
	const numberOfInternship = result.class.numberOfInternship;

	// Retrieve the rank values for the given internship and number of internships
	return await prisma.rank.findMany({
		where: {
			numberInternship: numberOfInternship,
			OR: [
				{ first: internship },
				{ second: internship },
				{ third: internship },
				{ fourth: internship },
				{ fifth: internship },
				{ sixth: internship },
			],
		},
	});
};

const rankVerification = async (classId: string) => {
	const externList = await prisma.extern.findMany({
		where: {
			classId
		},
		select: {
			rank: true
		}
	});

	const classValue = await prisma.class.findFirst({
		where: {
			id: classId
		},
		select: {
			numberOfInternship: true
		}
	});

	const hasEmptyRank = externList.map(obj => obj.rank.length === 0);
	const sameValue = externList.map(obj => obj.rank[0].numberInternship === classValue.numberOfInternship);
	console.log(hasEmptyRank, sameValue);

	return !hasEmptyRank.includes(true) && !sameValue.includes(false);
	
};

/**
 * Calculate the average rank for a given internship
 * @param internship The ID of the internship
 * @returns The average rank as a number
 */
const averageRank = async (internship: string): Promise<number> => {
	let total = 0;
	let weight = 0;
  
	// Retrieve rank values for the internship
	const rankValue = await rankValues(internship);
	
	if( rankValue.length === 0 ) {
		console.log(rankValue.length);
		
		return 6;
	}
  
	// Create an array to store rank totals, weights, and averages
	const rankValueObject: { total: number; weight: number; average: number }[] = Array.from(
		{ length: 6 },
		() => ({ total: 0, weight: 0, average: 0 })
	);

	
  
    // Define the properties of the Rank type
    type Rank = {
      first: string | null;
      second: string | null;
      third: string | null;
      fourth: string | null;
      fifth: string | null;
      sixth: string | null;
    };
  
    // Define an array of property names
    const properties: (keyof Rank)[] = ["first", "second", "third", "fourth", "fifth", "sixth"];
  
    // Iterate over each rank value
    for (const value of rankValue) {
    	// Find the index of the internship in the properties array
    	const index = properties.findIndex((prop) => value[prop] === internship);
  
    	// If the internship is found, update the total and weight for the corresponding rank
    	if (index >= 0) {
    		rankValueObject[index].total += index + 1;
    		rankValueObject[index].weight += 1;
    	}
    }

    // Calculate the total and weight for the average rank
    rankValueObject.map((value) => {
    	total += value.total;
    	weight += value.weight;
    });

    // Calculate and return the average rank
    return total / weight;
};  

const weightAverage = async (internship: string) => {
	const numberInternship = await prisma.previousOfInternship.count({
		where: {
			internshipId: internship
		}
	});
	const internshipValue = await prisma.previousOfInternship.findMany({
		where: {
			internshipId: internship
		},
    
	});

	if (numberInternship !== 0) {
		let sum = 0;
		let weightSum = 0;

		for (let i = 0; i < numberInternship; i++) {
			if (internshipValue[i].numberOfDemands !== 0) {
				sum += internshipValue[i].average * internshipValue[i].numberOfDemands;
				weightSum += internshipValue[i].numberOfDemands;
			} else {
				sum += 6;
				weightSum += 1;
			}
			
		}
        
		const result = sum / weightSum;
		return result;
	}
};

const quartilDemands = async (internship: string) => {
	const internshipValue = await prisma.previousOfInternship.findMany({
		where: {
			internshipId: internship
		},
	});
	const listDemands = internshipValue.map((list) => list.numberOfDemands);
	const sorted = listDemands.sort((a, b) => a - b);

	if (sorted.length === 1) {
		return sorted[0];
	} 
    
	if (sorted.length === 0) {
		return null;
	}

	const index = (25 / 100) * (sorted.length - 1);
	const lowerIndex = Math.floor(index);
	const upperIndex = lowerIndex + 1;
	const weight = index - lowerIndex;

	if (upperIndex >= sorted.length) {
		return sorted[lowerIndex];
	} else {
		return sorted[lowerIndex] * (1 - weight) + sorted[upperIndex] * weight;
	}
};

const numOfDemands = async (internship: string) => {
	return prisma.rank.count({
		where: {
			OR: [
				{first: internship},
				{second: internship},
				{third: internship},
				{fourth: internship},
				{fifth: internship},
				{sixth: internship}
			],
		},
	});

};

const calculateRank = async (internship: string) => {
    
	const internshipValue = await prisma.newOfInternship.findFirst({
		where: {
			internshipId: internship
		},
	});

	const internshipCount = await prisma.newOfInternship.count({
		where: {
			internshipId: internship
		},
	});

	const adjustRank = internshipCount * 0.1;

	const numberInternship = await prisma.previousOfInternship.count({
		where: {
			internshipId: internship
		}
	});

	if (numberInternship !== 0) {
		if (internshipValue.numberOfDemands !== 0) {
			const weightAvg  = await weightAverage(internship);
		
			const quarDemands = await quartilDemands(internship);
			
			const bayesianAverage = ( internshipValue.average * internshipValue.numberOfDemands + weightAvg  * quarDemands) / ( quarDemands + internshipValue.numberOfDemands );
	   
			return (bayesianAverage * adjustRank + internshipValue.average) / (1 + adjustRank);
		} else {
			return internshipValue.average;
		}
		
	} else {
		return internshipValue.average;
	}
};

const calculateValue = async (internship: string, places: number, coefficient: number) => {
	const numberOfDemands = await numOfDemands(internship);

	if (numberOfDemands === 0) {
		return 0;
	}

	const availablePlaces = places;
	const result = await prisma.internship.findFirst({
		where: {
			id: internship
		}, 
		include: {
			class: {
				select: {
					numberOfStudent: true
				}
			}
		}
	});

	const totalNumberOfStudents = result.class.numberOfStudent;
  
	const x = (numberOfDemands / availablePlaces) * (numberOfDemands / totalNumberOfStudents);
	const y = (availablePlaces / totalNumberOfStudents) * 0.1;
  
	const value = (1000 / (1 + Math.exp(-x)) * (7 - coefficient) / 6) * (1-y);
	return Math.round(value);
};

export { calculateRank, averageRank, numOfDemands, calculateValue, rankValues, rankVerification };