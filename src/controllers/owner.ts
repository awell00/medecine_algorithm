import { Request, Response, NextFunction } from "express";
import prisma from "../database/prisma";
import { createOwner, findOwner } from "../auth/userServices";

type AuthenticatedRequest = {
	payload: {
	    admin: string;
	};
} & Request

// TODO: Add the possibility to login owner for add class internship in the university 
const postOwner = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { admin } = req.payload;
		const { passwordAdmin, password, email} = req.body;

		const existingOwner = await findOwner(email);

		if (!admin || passwordAdmin !== process.env.ADMIN || passwordAdmin === undefined) {
			return res.status(401).json({ message: "No access"});
		}

		if (existingOwner) {
			return res.status(400).json({ message: `The owner : ${email} already exists` });
		}

		return res.json(await createOwner({ email, password }));
	} catch (e) {
		next(e);
	}
};

const getOwner = async (req: AuthenticatedRequest, res: Response) => {
	const { admin } = req.payload;

	if (!admin || admin === null) {
		return res.status(401).json({ message: "No access"});
	}
    
	return res.json(await prisma.owner.findMany());
};

export { postOwner, getOwner };