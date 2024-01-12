import { Request, Response, NextFunction } from "express";
import prisma from "../database/prisma";

type AuthenticatedRequest = {
	payload: {
	    admin: boolean;
	};
} & Request

// TODO: UPDATE TOTALLY IN TS
const postUniversity = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { admin } = req.payload;
		const { name, passwordAdmin, ownerId } = req.body;

		const universityCount = await prisma.university.count({
			where: {
				name
			}
		});

		const univOwner = await prisma.university.findMany({
			select: {
				ownerId: true
			}
		});

		const ownerCount = await prisma.owner.count({
			where: {
				id: ownerId
			}
		});

		if (ownerCount === 0) {
			return res.status(400).json({ message: "The owner doesn't exist" });
		}

		const ownerIdExists = univOwner.some(obj => obj.ownerId === ownerId);

		if (ownerIdExists) {
			return res.status(400).json({ message: "The owner already assigned" });
		}

		if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
			return res.status(401).json({ message: "No access"});
		}

		if (universityCount !== 0) {
			return res.status(400).json({ message: `The university : ${name} already exists` });
		}

		const code = Math.floor(1000 + Math.random() * 9000);
        
		return res.json(await prisma.university.create({
			data: {
				name,
				code,
				ownerId
			},
		}));
	} catch (e) {
		next(e);
	}
};

const getUniversity = async (req: AuthenticatedRequest, res: Response) => {
	const { admin } = req.payload;

	console.log(admin);

	if (!admin) {
		return res.status(401).json({ message: "No access"});
	}
    
	return res.json(await prisma.university.findMany());
};

const getUniversityClass = async (req: AuthenticatedRequest, res: Response) => {
	const { admin } = req.payload;

	if (!admin) {
		return res.status(401).json({ message: "No access"});
	} 

	const universityCount = await prisma.university.count({
		where: {
			name: {
				equals: req.params.name,
				mode: "insensitive"
			}
		}
	});

	if (universityCount === 0) {
		return res.status(404).json({ message: "The university doesn't exist" });
	}

	return res.json(await prisma.university.findFirst({
		where: { 
			name: {
				equals: req.params.name,
				mode: "insensitive"
			} 
		},
		select: { class: true }
	}));
};

const postUniversityList = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { admin } = req.payload;
		const { university, passwordAdmin, fullName, code } = req.body;

		const universityCount = await prisma.university.count({
			where: {
				name: university
			}
		});

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

		if (universityCount === 0 || universityValue === null) {
			return res.status(400).json({ message: `The university : ${university} doesn't exists` });
		}

		if (universityValue.code !== code) {
			return res.status(422).json({ message: "The code is incorrect"});
		}

		const idu = Math.floor(100000 + Math.random() * 900000);

		if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
			return res.status(401).json({ message: "No access"});
		}
        
		return res.json(await prisma.list.create({
			data: {
				university: { connect: { id: universityValue.id } },
				fullName,
				idu
			},
		}));
	} catch (e) {
		next(e);
	}
};

const getUniversityList = async (req: AuthenticatedRequest, res: Response) => {
	const { admin } = req.payload;

	if (!admin) {
		return res.status(401).json({ message: "No access"});
	}
    
	return res.json(await prisma.university.findFirst({
		where: {
			name: {
				equals: req.params.name,
				mode: "insensitive"
			}
		},
		select: {
			List: true
		}
	}));

};


export { postUniversity, getUniversity, getUniversityClass, postUniversityList, getUniversityList };