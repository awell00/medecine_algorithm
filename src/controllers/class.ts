import { Request, Response, NextFunction } from "express";
import prisma from "../database/prisma";

// FIXME: Change name adminId
type AuthenticatedRequest = {
	payload: {
	  	admin: string;
	};
} & Request

// TODO: AND UPDATE TOTALLY IN TS
const postClass = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { admin } = req.payload;
		const { numberOfInternship, numberOfStudent, year, state, numberOfRanking, passwordAdmin, university, code } = req.body;

		const universityCount = await prisma.university.count({
			where: {
				name: {
					equals: university,
					mode: "insensitive"
				}
			}
		});

		const universityClassCount = await prisma.university.count({
			where: { 
				name: {
					equals: university,
					mode: "insensitive"
				},
				class: {
					some: {
						year: {
							in: [year]
						}
					}
				}
			}
            
		});
    
		if (universityCount === 0) {
			return res.status(400).json({ message: "The university doesn't exist" });
		}

		const universityValue = await prisma.university.findFirst({
			where: {
				name: {
					equals: university,
					mode: "insensitive"
				}
			},
			select: {
				id: true,
				code: true
			}
		});

		if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
			return res.status(401).json({ message: "No access"});
		}

		if (universityClassCount !== 0) {
			return res.status(400).json({ message: `The class of ${year} already exists` });
		}

		if (universityValue.code !== code) {
			return res.status(422).json({ message: "The code is incorrect"});
		}

		return res.json(await prisma.class.create({
			data: {
				numberOfInternship,
				numberOfStudent,
				year,
				state,
				numberOfRanking,
				universityId: universityValue.id
			},
		}));
        
	} catch(e) {
		next(e);
	}   
    
};

const getClass = async (req: AuthenticatedRequest, res: Response) => {
	const { admin } = req.payload;

	if (!admin || admin === null) {
		return res.status(401).json({ message: "No access"});
	}
    
	return res.json(await prisma.class.findMany());
};

const updateClass = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { admin } = req.payload;
		const { numberOfInternship, numberOfStudent, year, passwordAdmin } = req.body;

		const existence = await prisma.class.count({
			where: {
				year
			}
		});

		if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
			return res.status(401).json({ message: "No access"});
		}

		if (year === undefined) {
			return res.status(400).json({ message: "The year must be filled in" });
		}

		if (existence === 0) {
			return res.status(404).json({ message: `The class of ${year} doesn't exists` });
		}

		const classValue = await prisma.class.findFirst({
			where: {
				year
			},
			select: {
				id: true
			}
		});

		return res.json(await prisma.class.update({
			where: {
				id : classValue.id
			},
			data: {
				numberOfInternship,
				numberOfStudent,
				year
			},
		}));
 
	} catch(e) {
		next(e);
	}   
};

const deleteClass = async (req: AuthenticatedRequest, res: Response) => {
	// const year = parseInt(req.params.year);
	const { admin } = req.payload;
	const { passwordAdmin, university , year} = req.body;

	if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
		return res.status(401).json({ message: "No access"});
	}
    

	const universityObject = await prisma.university.findFirst({
		where: { 
			name: {
				equals: university,
				mode: "insensitive"
			} 
		},
		select: { id: true }

	});

	const classToDelete = await prisma.class.findFirst({
		where: {
			year,
			universityId: universityObject.id
		}
	});
      
	try {
		if (classToDelete) {
			await prisma.class.delete({
				where: {
					id: classToDelete.id
				}
			});
		}
		res.status(200).json({ message: "Class deleted successfully!" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete Class" });
	}
};

export { postClass, getClass, updateClass, deleteClass };