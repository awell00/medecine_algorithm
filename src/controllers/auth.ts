import { generateTokens, generateTokensAdmin, generateTokensOwner } from "../auth/jwt";
import { NextFunction, Request, Response } from "express";
import {
	createAdmin,
	createExtern,
	findAdmin,
	findAdminById,
	findExtern,
	findExternById,
	findOwner,
	findOwnerById
} from "../auth/userServices";
import { sendEmail } from "./function/authFunction";
import { createToken, hashComparaison, hashToken } from "../auth/hashToken";
import { DateTime } from "luxon";
import bcrypt from "bcrypt";
import prisma from "../database/prisma";

type AuthenticatedRequest = {
	payload: {
	  	externId: string;
		admin?: boolean;
		owner?: boolean;
	};
} & Request

// TODO: Adapt for owner !!!!!!!!!
const postRegister = async (req: Request, res: Response) => {
	try {
		const { email, password, university, classId, admin, passwordAdmin, firstName, lastName, idu } = req.body;

		const authorizationHeader = req.cookies.refresh_token;
	
		if (authorizationHeader) {
			return res.status(401).json({ message: "You must logout to register with another email adress" });
		}

		if (!email || !password) {
			return res.status(400).json({ message: "You must provide an email and a password." });
		}

		// TODO: Change findextern
		const existingExtern = await findExtern(email);
		console.log(email);

		const iduCount = await prisma.extern.count({
			where: {
				idu
			} 
		});
		
		const existingAdmin = await findAdmin(email);

		if (existingExtern || existingAdmin) {
			return res.status(400).json({ message: "Email already in use."});
		}

		if (iduCount === 1) {
			return res.status(400).json({ message: "IDU already in use."});
		}

		if (admin === true && email !== "admin@gmail.com") {
			return res.status(400).json({ message: "Email for admin is incorrect."});
		}

		if ( admin === true && passwordAdmin === process.env.ADMIN && email === "admin@gmail.com") {
			const admin = await createAdmin({ email, password });
			const { accessToken, refreshToken } = generateTokensAdmin(admin);
		
			type TokenOptions = {
				httpOnly: boolean,
				secure: boolean,
				sameSite: "strict"
			}		

		   	const tokenOptions: TokenOptions = {
			   	httpOnly: true,
			   	secure: true,
			   	sameSite: "strict",
		   	};

		   	res.cookie("refresh_token", refreshToken, tokenOptions);


			res.json({
				accessToken,
				refreshToken,
			});
		} else {
			const fullName = firstName + " " + lastName;

			const universityValue = await prisma.university.findFirst({
				where: {
					name: {
						equals: university,
						mode: "insensitive"
					}
				},
				select: {
					id: true
				}
			});

			if (universityValue === null) {
				return res.status(400).json({ message: "The university doesn't exist" });
			}
			

			const listCount = await prisma.list.count({
				where: {
					universityId: universityValue.id,
					fullName,
					idu
				}
			});

			if (listCount === 0) {
				return res.status(400).json({ message: "Full Name doesn't exist or IDU is incorrect"});
			}

			const classCount = await prisma.class.count({
				where: { id: classId }
			});

			if (classCount === 0) {
				return res.status(400).json({ message: "The class doesn't exist" });
			}

			const extern = await createExtern({ email, password, classId, numberOfInternship: 0, firstName, lastName, idu });
			const { accessToken, refreshToken } = generateTokens(extern);
			
			type TokenOptions = {
				httpOnly: boolean,
				secure: boolean,
				sameSite: "strict"
			}		

		   	const tokenOptions: TokenOptions = {
			   	httpOnly: true,
			   	secure: true,
			   	sameSite: "strict",
		   	};

		   	res.cookie("refresh_token", refreshToken, tokenOptions);


			res.json({
				accessToken,
				refreshToken,
			});
		}

	} catch (error) {
		if (error.message === "idu must be a 6-digit number.") {
			res.status(400).json({ error: "Invalid idu. It must be a 6-digit number." });
		  } else {
			// Handle other types of errors
			res.status(500).json({ error: "An unexpected error occurred." });
		}
	}
};

// FIXME: problem when there are no admin
const postLogin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password, admin, passwordAdmin, owner } = req.body;

		const authorizationHeader = req.cookies.refresh_token;
	
		if (authorizationHeader) {
			return res.status(401).json({ message: "You must logout to login with another email adress" });
		}

		if (!email || !password) {
			return res.status(400).json({ message: "You must provide an email and a password." });
		}

		if ( admin === true && passwordAdmin === process.env.ADMIN && email === "admin@gmail.com") {
			const existingAdmin = await findAdmin(email);
			const validPassword = await bcrypt.compare(password, existingAdmin.password);

			if (!existingAdmin || !validPassword) {
				return res.status(403).json({ message: "Invalid login credentials."});
			}

			const { accessToken, refreshToken } = generateTokensAdmin(existingAdmin);

			type TokenOptions = {
			 	httpOnly: boolean,
			 	secure: boolean,
			 	sameSite: "strict"
		 	}		

			const tokenOptions: TokenOptions = {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
			};

			res.cookie("refresh_token", refreshToken, tokenOptions);

			res.json({
				accessToken,
				refreshToken
			});
		} else if (admin === false && passwordAdmin === "" && email !== "admin@gmail.com" && owner === undefined) {
			const existingExtern = await findExtern(email);
			let validPassword = false;
			if (existingExtern !== null) {
				validPassword = await bcrypt.compare(password, existingExtern?.password);
			}
			
			if (!existingExtern || !validPassword) {
				return res.status(403).json({ message: "Invalid login credentials."});
			}

			const { accessToken, refreshToken } = generateTokens(existingExtern);

			type TokenOptions = {
				httpOnly: boolean,
				secure: boolean,
				sameSite: "strict"
			}		
			   
			const tokenOptions: TokenOptions = {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
			};

			res.cookie("refresh_token", refreshToken, tokenOptions);

			res.json({
				accessToken,
				refreshToken
			});
		} else if (admin === undefined && passwordAdmin === undefined && email !== "admin@gmail.com" && owner === true) {
			const existingOwner = await findOwner(email);

			let validPassword = false;
			if (existingOwner !== null) {
				validPassword = await bcrypt.compare(password, existingOwner?.password);
			}
			
			if (!existingOwner || !validPassword) {
				return res.status(403).json({ message: "Invalid login credentials."});
			}

			const { accessToken, refreshToken } = generateTokensOwner(existingOwner);

			type TokenOptions = {
				httpOnly: boolean,
				secure: boolean,
				sameSite: "strict"
			}		
			   
			const tokenOptions: TokenOptions = {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
			};

			res.cookie("refresh_token", refreshToken, tokenOptions);

			res.json({
				accessToken,
				refreshToken
			});
		} else {
			return res.status(403).json({ message: "No access to admin rights" });
		}
        
	} catch (error) {
		next(error);
	}  
};

const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const { externId, admin, owner } = req.payload;
	
		if (admin) {
			const adminValue = await findAdminById(externId);
			delete adminValue.password;
			res.json(adminValue);
		}
	
		if (owner) {
			const ownerValue = await findOwnerById(externId);
			delete ownerValue.password;
			res.json(ownerValue);
		}

		const externValue = await findExternById(externId);
		delete externValue.password;

		res.json(externValue);
	} catch (error) {
		next(error);
	}
};

const postRequestReset = async (req: Request, res: Response) => {
	const { email } = req.body;

	if (email === undefined) {
		return res.status(403).json({ message: "Email doesn't specify" }); 
	}

	const user = await findExtern(email);
  
	if (!user) return res.status(403).json({ message: "Extern doesn't exist" });

	const resetToken = createToken();
	const hash = hashToken(resetToken);
	const currentTime = DateTime.now().toJSDate(); 

	await prisma.extern.update({
		where: { id: user.id },
		data: {
			passwordResetToken: hash,
			passwordResetAt: currentTime,
		},
	});

	const link = `${process.env.URL}/passwordReset?token=${resetToken}&id=${user.id}`;
	sendEmail(user.email,"Password Reset Request",{name: user.firstName , link: link},"./template/resetPassword.handlebars", res);

	return link;
};

const postPasswordReset = async (req: Request, res: Response) => {
	const { token, id } = req.query;
	const { password, passwordConfirm} = req.body;

	const tokenAsString: string = token as string;

	const extern = await prisma.extern.findFirst({
		where: {
			id:  id as string,
		},
		select: {
			email: true,
			firstName: true,
			passwordResetToken: true, 
			password: true
		}
	});

	const deleteToken = async () => {
		await prisma.extern.update({
			where: {
				id: id as string,
			},
			data: {
				passwordResetAt: null,
				passwordResetToken: null
			}
		});
	};	

	if (!extern || !extern.passwordResetToken) {
		return res.status(403).json({ message: "Invalid or expired password reset token" });
	}

	if (!await hashComparaison(tokenAsString, extern.passwordResetToken)) {
		await deleteToken();
		return res.status(400).json({ message: "You're not authorized to reset the password" });
	}

	if (password !== passwordConfirm) {
		await deleteToken();
		return res.status(400).json({ message: "Both passwords are different" });
	}

	if (await hashComparaison(password, extern.password)) {
		await deleteToken();
		return res.status(400).json({ message: "The new password is the same as the current password" });
	}

	await prisma.extern.update({
		where: {
			id: id as string,
		},
		data: {
		  	password: hashToken(password),
		  	passwordResetAt: null,
		  	passwordResetToken: null
		},
	});

	sendEmail(extern.email,"Password Reset Successfully",{name: extern.firstName},"./template/successfulReset.handlebars", res);
};

const getLogout = (req: Request, res: Response) => {
	if (req.cookies.refresh_token === undefined) {
		res.status(401).json({ message: "There is no Extern login"});
	}

	return res
		.clearCookie("refresh_token")
		.status(200)
		.json({ message: "Successfully logged out" });
};

export { postRegister, postLogin, getProfile, getLogout, postRequestReset, postPasswordReset };

