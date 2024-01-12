import { calculateRank, averageRank, numOfDemands, calculateValue, rankVerification } from "./function/internshipFunction";
import { Request, Response, NextFunction } from "express";
import prisma from "../database/prisma";

type AuthenticatedRequest = {
	payload: {
	    admin: string;
	};
} & Request

// TODO: UPDATE TOTALLY IN TS
const postInternship = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { admin } = req.payload;
		const { name, classId, passwordAdmin } = req.body;

		if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
			return res.status(401).json({ message: "No access"});
		}

		const classCount = await prisma.class.count({
			where: { id: classId }
		});

		const internshipCount = await prisma.internship.count({
			where: { name }
		});

		if (classCount === 0) {
			return res.status(404).json({ message: "The class doesn't exists" }); 
		}

		if (internshipCount !== 0) {
			return res.status(400).json({ message: "The internship already exists"});
		}
        
		return res.json(await prisma.internship.create({
			data: { name, classId },
		}));
            
	} catch (e) {
		next(e);
	}    
};

const getInternship = async (req: AuthenticatedRequest, res: Response) => {
	const { admin } = req.payload;

	if (!admin) {
		return res.status(401).json({ message: "No access"});
	}

	return res.json(await prisma.internship.findMany());
};

const addInternship = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { places, internshipId, allocation, passwordAdmin} = req.body;
		const { admin } = req.payload;

		if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
			return res.status(401).json({ message: "No access"});
		}

		const classValue = await prisma.internship.findFirst({
			where: {
				id: internshipId
			},
			select: {
				classId: true
			}
		});
		

		if (classValue === null) {
			return res.status(404).json({ message: "The internship doesn't exists" }); 
		}
		

		const numberOfDemands = await numOfDemands(internshipId);
		const rankValue = await rankVerification(classValue.classId);
		
		
		
		if (rankValue === false) {
			return res.status(400).json({ message: "There aren't rank for all student" });
		}
            
		const newInternshipCount = await prisma.newOfInternship.count({
			where: { internshipId }
		});

		const average = await averageRank(internshipId);

		const newValues = {
			average,
			numberOfDemands,
			places,
			internshipId,
			allocation
		};

		if (newInternshipCount !== 0) {
			return res.status(409).json({ message: "There is already a internship" });
		}
            
		await prisma.newOfInternship.create({ data: newValues });
        
		const newAverage = await calculateRank(internshipId);
		const value = await calculateValue(internshipId, places, newAverage);

		return res.json(await prisma.newOfInternship.update({ 
			where: { internshipId },
			data: {
				average: newAverage,
				value
			} 
		}));
        
	} catch(e) {
		next(e);
	}
};

const addInternshipAuto = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { classId, passwordAdmin} = req.body;
		const { admin } = req.payload;

		const AllInternship = await prisma.internship.findMany({
			where: {
				classId
			},
			select: {
				id: true
			}
		});

		const AllInternshipId = AllInternship.map(internship => internship.id);

		if (AllInternshipId) {
			for (const internshipId of AllInternshipId) {
				const places = Math.floor(Math.random() * 30) + 1;
				const allocation = 0;

				if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
					res.status(401).json({ message: "No access" });
				}

				const classValue = await prisma.internship.findFirst({
					where: {
						id: internshipId
					},
					select: {
						classId: true
					}
				});


				if (classValue === null) {
					res.status(404).json({ message: "The internship doesn't exists" });
				}


				const numberOfDemands = await numOfDemands(internshipId);
				const rankValue = await rankVerification(classValue.classId);



				if (rankValue === false) {
					res.status(400).json({ message: "There aren't rank for all student" });
				}

				const newInternshipCount = await prisma.newOfInternship.count({
					where: { internshipId }
				});

				const average = await averageRank(internshipId);

				const newValues = {
					average,
					numberOfDemands,
					places,
					internshipId,
					allocation
				};

				if (newInternshipCount !== 0) {
					res.status(409).json({ message: "There is already a internship" });
				}

				await prisma.newOfInternship.create({ data: newValues });

				const newAverage = await calculateRank(internshipId);
				const value = await calculateValue(internshipId, places, newAverage);

				await prisma.newOfInternship.update({
					where: { internshipId },
					data: {
						average: newAverage,
						value
					}
				});

			}
		}


	} catch(e) {
		next(e);
	}

	res.json({ message: "Internships added successfully" });
};

const getAddInternship = async (req: AuthenticatedRequest, res: Response) => {
	const { admin } = req.payload;

	if (!admin) {
		return res.status(401).json({ message: "No access"});
	}

	const internshipCount = await prisma.internship.count({
		where: {
			name: req.params.name
		}
	});

	if (internshipCount === 0) {
		return res.status(404).json({ message: "The internship doesn't exist" });
	}
        
	if (req.params.state === "previous") {
		return res.json(await prisma.internship.findMany({
			where: { name: req.params.name },
			select: { previous: true }
		}));

	} else if (req.params.state === "new") {
		return res.json(await prisma.internship.findMany({
			where: { name: req.params.name },
			select: { new: true }
		}));
   
	}
};

export { postInternship, getInternship, addInternship, getAddInternship, addInternshipAuto };