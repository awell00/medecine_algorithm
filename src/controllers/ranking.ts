import { calculateScore } from "./function/rankingFunction";
import { Request, Response, NextFunction } from "express";
import prisma from "../database/prisma";
import { calculateInternshipCost } from "./function/externFunction";
import { fetchDataAndConvertToJson } from "../model/conversion";

type AuthenticatedRequest = {
	payload: {
        externId: string;
	    admin: string;
	};
} & Request

// TODO: UPDATE TOTALLY IN TS
const postRanking = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => { // check if all extern have rank or internship is add with id of specific internship
	try {
		const { admin } = req.payload;
		const { classId, passwordAdmin } = req.body;

		if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
			return res.status(401).json({ message: "No access"});
		}

		const className = await prisma.class.findFirst({
			where: { id: classId },
			select: {
				state: true,
				numberOfRanking: true,
				numberOfInternship: true
			}
		});

		if (className === null) {
			return res.status(404).json({ message: "There is no specified class"});
		}

		const internshipCount = await prisma.internship.count({
			where: { classId }
		});

		const externCount = await prisma.extern.count({
			where: { classId }
		});

		if (externCount === 0) {
			return res.status(404).json({ message: "There is no specified extern"});
		}


		// FIXME: ERROR TO ADD RANKING
		if (className.state || className.numberOfRanking !== className.numberOfInternship || internshipCount === 0 || externCount === 0) {
			return res.status(409).json({ message: "The ranking already exist for this internship or internship and extern don't exist" });
		}
        
		const externs = await prisma.extern.findMany({
			where: {
				classId
			},
			select: {
				rank: true
			}
		});
    
		const allExternsHaveRank = externs.every(extern => extern.rank && extern.rank.length > 0);

		const newInternships = await prisma.internship.findMany({
			where: {
				classId
			},
			select: {
				new: true
			}
		});

		let allInternshipHaveNew: boolean;

		for (let i = 0; i < newInternships.length; i++) {
			const newValue = newInternships[i].new;
			if (Array.isArray(newValue) && newValue.length === 0) {
				allInternshipHaveNew = false;
			} else {
				allInternshipHaveNew = true;
			}
		}

		const allocations = await prisma.ranking.findMany({
			where: {
				classId
			},
			select: {
				internshipId: true
			}
		});
    
		const allExternHaveInternship = allocations.every(allocation => allocation.internshipId === "assigned");

    
		if (!allExternsHaveRank) {
			return res.status(400).json({ message: "Not all externs have a rank" });
		}

		if (!allInternshipHaveNew) {
			return res.status(400).json({ message: "Not all internships have a new value" });
		}

		if (!allExternHaveInternship) {
			return res.status(400).json({ message: "Not all internships are assigned for the previous internship" });
		}
            
		await prisma.class.update({
			where: {
				id: classId
			},
			data: {
				state: true
			}
		});

		const extern = await prisma.extern.findMany({
			where: {
				classId
			}, 
			select: {
				id: true
			}
		});

		for (let i = 0; i < extern.length; i++) {
			const score = await calculateScore(extern[i].id);

			const externCount = await prisma.extern.count({
				where: {
					id: extern[i].id
				}
			});
            
			const classCount = await prisma.class.count({
				where: {
					id: classId
				}
			});

			const rankCount = await prisma.rank.findFirst({
				where: {
					externId: extern[i].id
				}
			});

			if (externCount === 0 || classCount === 0 || rankCount === null) {
				return res.status(404).json({ message: "The extern or the class or the rank don't exist" });
			}
              
			const rankingCount = await prisma.ranking.count({
				where: {
					externId: extern[i].id
				}
			});
        
			const newValue = {
				score,
				externId: extern[i].id,
				classId
			};
        
			if (rankingCount === 0) {
				await prisma.ranking.create({ data: newValue });

			} else {
				const rankingValue = await prisma.ranking.findFirst({
					where: {
						externId: extern[i].id
					}
				});
				await prisma.previousOfScore.create({
					data: {
						score: rankingValue.score,
						externId: rankingValue.externId
					}
				});

				await prisma.previousOfRanking.create({
					data: {
						score: rankingValue.score,
						internshipValue: rankingValue.internshipValue,
						internshipName: rankingValue.internshipName,
						numberOfInternship: rankingValue.numberOfInternship,
						classId: rankingValue.classId
					}
				});
    
				await prisma.ranking.update({
					where: {
						externId: extern[i].id
					},
					data: {
						score: newValue.score
					}
				});
			}
                
		}

		const number = className.numberOfRanking + 1;
		await prisma.class.update({
			where: {
				id: classId
			}, 
			data: {
				numberOfRanking: number,
			}
		});

		res.status(200).json({ message: "It works" });
        
	} catch (e) {
		next(e);
	}
    
};

const getRanking = async (req: AuthenticatedRequest, res: Response) => {
	const { classId, passwordAdmin } = req.body;
	const { admin } = req.payload;

	if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
		return res.status(401).json({ message: "No access"});
	}

	const classCount = await prisma.class.count({
		where: {
			id: classId
		}
	});

	if ( classId === undefined || classCount === 0) {
		return res.status(404).json({ message: "There is no specified class"});
	}

	return res.json(await prisma.ranking.findMany({
		where: {
			classId
		}
	}));
};

const getExternRanking = async (req: AuthenticatedRequest, res: Response) => {
	const { externId } = req.payload;

	const externCount = await prisma.extern.count({
		where: {
			id: externId
		}
	});

	const rankingCount = await prisma.ranking.count({
		where: {
			externId
		}
	});
    
	if (externCount === 0 || rankingCount === 0) {
		return res.status(404).json({ message: "The extern doesn't exists or there isn't ranking" });
	}
        
	const externValue = await prisma.extern.findFirst({
		where: {
			id: externId
		},
		select: {
			ranking: true
		}
	});
    
	delete externValue.ranking.score;

	res.json(externValue);
};

const addExtern = async (status: boolean, externId: string, passwordAdmin: string, admin: string, res: Response, next: NextFunction)  => {
	try {
		// const { status, externId, passwordAdmin } = req.body;
		// const { admin } = req.payload;

		if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
			return res.status(401).json({ message: "No access"});
		}

		const result = await prisma.ranking.findMany({
			orderBy: {
				score: "asc"
			}
		});

		const internshipValue = await prisma.ranking.findFirst({
			where: {
				externId
			},
			select: {
				internshipId: true
			}
		});

		const ranking = result.findIndex(ranking => ranking.externId === externId) + 1;
    
		if (internshipValue === null || internshipValue.internshipId === "assigned" || internshipValue.internshipId === null) {
			return res.status(400).json({ message: "The internship isn't specify or is already assigned or the internship hasn't value" });
		}
            
		const internshipId = internshipValue.internshipId;

		const externCount = await prisma.extern.count({
			where: { id: externId }
		});

		const internshipCount = await prisma.internship.count({
			where: { id: internshipId }
		});
    
		if (externCount === 0 && internshipCount === 0) {
			return res.status(404).json({ message: "The extern doesn't exists" });
		}
            
		const newExterncount = await prisma.newOfExtern.count({
			where: { externId }
		});

		const newValues = {
			internshipId,
			status,
			externId,
		};

		console.log("externCount: " + newExterncount);

		if (newExterncount === 0) {
			console.log("TEST");
			await prisma.newOfExtern.create({ data: newValues });
            
			const cost = await calculateInternshipCost(externId, ranking, status, internshipId);
			
			if (cost === null) {
				return res.status(400).json("No previous elements found in the 'previous' array.");
			}

			await prisma.newOfExtern.update({ 
				where: { externId }, 
				data: { cost }
			});

		} else if (newExterncount === 1) {
			const currentExternCount = await prisma.currentOfExtern.count({
				where: { externId  }
			});
    
			if (currentExternCount <= 4) {
				const new_value = await prisma.newOfExtern.findFirst({
					where: { externId }
				});

				console.log(new_value);
				
    
				await prisma.currentOfExtern.create({
					data: {
						internshipId: new_value.internshipId,
						cost: new_value.cost,
						status: new_value.status,
						externId: new_value.externId,
					},
				});
    
				await prisma.newOfExtern.deleteMany({
					where: { externId }
				});
    
				await prisma.newOfExtern.create({ data: newValues });

				const cost = await calculateInternshipCost(externId, ranking, status, internshipId);
				await prisma.newOfExtern.update({ 
					where: { externId }, 
					data: { cost }
				});

			} else {
				const currentExternValue = await prisma.currentOfExtern.findMany({
					where: { externId }
				});
    
				await prisma.previousOfExtern.create({
					data: {
						internshipId: currentExternValue[0].internshipId,
						cost: currentExternValue[0].cost,
						status: currentExternValue[0].status,
						externId: currentExternValue[0].externId,
					},
				});
    
				await prisma.currentOfExtern.delete({ where: { id: currentExternValue[0].id } });
    
				const newExternValue = await prisma.newOfExtern.findFirst({
					where: { externId }
				});
    
				await prisma.currentOfExtern.create({
					data: {
						internshipId: newExternValue.internshipId,
						cost: newExternValue.cost,
						status: newExternValue.status,
						externId: newExternValue.externId,
					},
				});
    
				await prisma.newOfExtern.deleteMany({
					where: { externId }
				});
    
				await prisma.newOfExtern.create({ data: newValues });

				const cost = await calculateInternshipCost(externId, ranking, status, internshipId);
                
				await prisma.newOfExtern.update({ 
					where: { externId }, 
					data: { cost }
				});
			}
		}

		await prisma.ranking.update({
			where: {
				externId
			},
			data: {
				internshipId: "assigned"
			}
		});

	} catch (e) {
		next(e);
	}
 
};

// FIXME: First add rank doesn't assigned the internship
const postInternshipRank = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { classId, passwordAdmin } = req.body;
		const { admin } = req.payload;

		if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
			return res.status(401).json({ message: "No access"});
		}

		const className = await prisma.class.findFirst({
			where: {
				id: classId
			},
			select: {
				state: true,
				numberOfInternship: true
			}
		});

		const RankingCount = await prisma.ranking.count({
			where: {
				classId
			}
		});

		const newInternships = await prisma.internship.findMany({
			where: {
				classId
			},
			select: {
				new: true
			}
		});

		if (className === null) {
			return res.status(404).json({ message: "There is no specified class"});
		}
		
		let allInternshipHaveNew: boolean;

		for (let i = 0; i < newInternships.length; i++) {
			const newValue = newInternships[i].new;
			allInternshipHaveNew = !(Array.isArray(newValue) && newValue.length === 0);
		}
		if (!className.state || RankingCount === 0 || !allInternshipHaveNew) {
			return res.status(400).json({ message: "There are already a ranking or not ranking exist" });
		}
        
		const extern = await prisma.ranking.findMany({
			where: {
				classId
			}, 
			orderBy: {
				score: "asc"
			},
			select: {
				externId: true
			}
		});
    
		// Add the next internship if all internship are unavailable 
		const internships = await prisma.internship.findMany({ 
			where: {
				classId
			}, 
			select: {
				id: true
			}
		});
    
		for (let i = 0; i < extern.length; i++) {

            type Rank = {
                first: string | null;
                second: string | null;
                third: string | null;
                fourth: string | null;
                fifth: string | null;
                sixth: string | null;
            }
              
            const rank = await prisma.rank.findFirst({
            	where: {
            		externId: extern[i].externId
            	}, 
            	select: {
            		first: true,
            		second: true,
            		third: true,
            		fourth: true,
            		fifth: true,
            		sixth: true
            	}
            });
     
            // FIXME: The internship doesn't add in new internship for extern
            const updateInternshipAllocation = async (id: string, externId: string, rank: Rank, value: string) => {
            	const internshipValue = await prisma.internship.findFirst({
            		where: { id },
            		select: {
            			new: {
            				select: {
            					allocation: true,
            					places: true,
            					value: true,
            				},
            			},
            			name: true,
            		},
            	});

            	const rankValue = await prisma.rank.findFirst({
            		where: {
            			externId
            		},
            		select: {
            			numberInternship: true
            		}
            	});
                
            	if (internshipValue.new.allocation < internshipValue.new.places) {
            		await prisma.internship.update({
            			where: { id },
            			data: { new: { update: { allocation: internshipValue.new.allocation + 1 } } },
            		});
    
            		await prisma.ranking.update({
            			where: { externId },
            			data: {
            				internshipId: id,
            				internshipValue: internshipValue.new.value,
            				internshipName: internshipValue.name,
            				numberOfInternship: rankValue.numberInternship
            			}
            		});

            		//FIXME: Work only on first extern and not all 
            		await addExtern(true, externId, passwordAdmin, admin, res, next);
    
            	} else if (value === "first" && rank.second !== null) {
            		await updateInternshipAllocation(rank.second, externId, rank, "second");
                    
            	} else if (value === "second" && rank.third !== null) {
            		await updateInternshipAllocation(rank.third, externId, rank, "thrid");
               
            	} else if (value === "thrid" && rank.fourth !== null) {
            		await updateInternshipAllocation(rank.fourth, externId, rank, "fourth");
                
            	} else if (value === "fourth" && rank.fifth !== null) {
            		await updateInternshipAllocation(rank.fifth, externId, rank, "fifth");
               
            	} else if (value === "fifth" && rank.sixth !== null) {
            		await updateInternshipAllocation(rank.sixth, externId, rank, "sixth");
        
            	}  else {
            		await prisma.ranking.update({
            			where: { externId },
            			data: {
            				internshipId: "unavailable"
            			}
            		});
            		console.log({ message: "There aren't more places available" });
            	}
            };
              
            const rankOrder: (keyof Rank)[] = ["first", "second", "third", "fourth", "fifth", "sixth"];
    
            for (const r of rankOrder) {
            	if (rank !== null && rank[r] !== null) {

            		const internshipCount = await prisma.newOfInternship.count({
            			where: {
            				internshipId: rank[r]
            			},
                        
            		});

            		if (internshipCount === 0) {
            			return res.status(404).json({ message: "The internship doesn't have new values" });
            		}

            		await updateInternshipAllocation(rank[r], extern[i].externId, rank, r);
            		break;
            	}
            }
		}
    
		const number = className.numberOfInternship + 1;
		await prisma.class.update({
			where: {
				id: classId
			}, 
			data: {
				numberOfInternship: number,
				state: false
			}
		});

		// DELETE ALSO

		// FIXME: Not working on internship with 0 demand
		for (let i = 0; i < internships.length; i++) {
			const newValue = await prisma.newOfInternship.findFirst({
				where: { internshipId: internships[i].id }
			});

			console.log(newValue);
			 
			if (newValue !== null) {
				await prisma.previousOfInternship.create({
					data: {
						average: newValue.average,
						numberOfDemands: newValue.numberOfDemands,
						places: newValue.places,
						value: newValue.value,
						internshipId: newValue.internshipId,
					},
				});

				await prisma.newOfInternship.deleteMany({
					where: { internshipId: internships[i].id }
				});
			}
		}

		await fetchDataAndConvertToJson("./src/database/data.csv");

		return res.status(200).json({ message: "It works" });
            
	} catch(error) {
		if (error.message === "The median can't be calculated due to the internship assigned in the student ranking.") {
			res.status(400).json({ error: "The median can't be calculated due to the internship assigned in the student ranking." });
		} else {
			// Handle other types of errors
			res.status(500).json({ error: "An unexpected error occurred." });
		}
	}
};

export { postRanking, getRanking, getExternRanking, postInternshipRank };