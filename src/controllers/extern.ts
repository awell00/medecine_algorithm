import { Request, Response, NextFunction } from "express";
import prisma from "../database/prisma";

type AuthenticatedRequest = {
	payload: {
	    externId: string;
        admin: string;
		owner: string;
	};
} & Request

// TODO: UPDATE TOTALLY IN TS
const getExtern = async (req: AuthenticatedRequest, res: Response) => {
	const { classId } = req.body;
	const { admin } = req.payload;

	if (!admin) {
		return res.status(401).json({ message: "No access"});
	}    

	if ( classId === undefined ) {
		return res.status(400).json({ message: "There is no specified class"});
	}

	res.json(await prisma.extern.findMany());
};

const postRank = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { first, second, third, fourth, fifth, sixth } = req.body;
		const { externId, admin, owner } = req.payload;
		
		if (admin || owner) {
			return res.status(400).json({ message: "You're not extern"});
		}
    
		const numInternship = await prisma.rank.findFirst({
			where: { externId },
			select: { numberInternship: true }
		});

		const classExtern = await prisma.extern.findFirst({
			where: {
				id: externId
			},
			select: {
				classId: true
			}
		});

		if (classExtern.classId === null) {
			return res.status(400).json({ message: "There is no specified class"});
		}

		const allocations = await prisma.ranking.findMany({
			where: {
				classId: classExtern.classId
			},
			select: {
				internshipId: true
			}
		});
    
		const allExternHaveInternship = allocations.every(allocation => allocation.internshipId === "assigned");

		if (!allExternHaveInternship) {
			return res.status(400).json({ message: "Not all internships are assigned for the previous internship" });
		}

		const numberInternshipVal = numInternship === null ? 1 : numInternship.numberInternship + 1;

		const numberInternshipClass = await prisma.extern.findFirst({
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

		if (numberInternshipVal > numberInternshipClass.class.numberOfInternship) {
			return res.status(404).json({ message: "The rank wasn't applied" });
		}

		const externCount = await prisma.extern.count({ where: { id: externId } });
		const rankCount = await prisma.rank.count({ where: { externId } });
  
		console.log(req.payload);
		
		const newValue = {
			first,
			second,
			third,
			fourth,
			fifth,
			sixth,
			externId,
			numberInternship: numberInternshipVal
		};
  
		if (externCount === 0) {
			return res.status(404).json({ message: "The extern doesn't exist" });
		}
            
		if (rankCount !== 0) {
			await prisma.rank.delete({ where: { externId } });
		}
        
		return res.json(await prisma.rank.create({ data: newValue }));
        
	} catch (e) {
		next(e);
	}
};

const getRank = async (req: AuthenticatedRequest, res: Response) => {
	const { externId, admin, owner } = req.payload;

	if (admin || owner) {
		return res.status(400).json({ message: "You're not extern"});
	}

	const externCount = await prisma.extern.count({
		where: {
			id: externId
		}
	});

	if (externCount === 0) {
		return res.status(401).json({ message: "The extern doesn't exist" });
	} 
    
	return res.json(await prisma.extern.findMany({
		where: {
			id: externId
		},
		select: {
			rank: true
		}
	}));

        
};

const getAddExtern = async (req: AuthenticatedRequest, res: Response) => { 
	const { externId, admin, owner } = req.payload;

	if (admin || owner) {
		return res.status(400).json({ message: "You're not extern"});
	}

	const externCount = await prisma.extern.count({
		where: {
			id: externId
		}
	});

	if (externCount === 0) {
		return res.status(401).json({ message: "The extern doesn't exists" });
	}

	if (req.params.state === "previous") {
		const infos = await prisma.extern.findMany({
			where: {
				id: externId
			},
			select: {
				previous: true,
			}
		});
		res.json(infos);
	} else if (req.params.state === "current") {
		const infos = await prisma.extern.findMany({
			where: {
				id: externId
			},
			select: {
				current: true,
			}
		});
		res.json(infos);
	} else if (req.params.state === "new") {
		const infos = await prisma.extern.findMany({
			where: {
				id: externId
			},
			select: {
				new: true,
			}
		});
		res.json(infos);
	} else if (req.params.state === "score") {
		const infos = await prisma.extern.findMany({
			where: {
				id: externId
			},
			select: {
				previousScore: true,
			}
		});
		res.json(infos);
	}    
        
};

export { getExtern, postRank, getRank, getAddExtern };