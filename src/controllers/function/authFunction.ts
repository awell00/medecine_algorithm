import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

type AuthenticatedRequest = {
    payload: {
      externId?: string;
      admin?: string;
	  owner?: string;
    };
} & Request;

const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const authorizationHeader = req.cookies.refresh_token;
	
	if (authorizationHeader === undefined) {
		return res.status(401).json({ message: "There is no user logged in" });
	}

	if (!authorizationHeader) {
		return res.status(401).json({ message: "🚫 Un-Authorized 🚫" });
	}
  
	try {
		const payload = jwt.verify(authorizationHeader, process.env.JWT_REFRESH_SECRET) as { userID?: string; admin?: string; owner?: string; };
		req.payload = payload;
	} catch (err) {
		
		if (err.name === "TokenExpiredError") {
			return res.status(401).json({message: "Token Expired"});
		}
		return res.status(401).json({ message: "🚫 Un-Authorized 🚫" });
	}
  
	return next();
};

type EmailPayload = {
	name: string, 
	link?: string
}

const sendEmail = async (email: string, subject: string, payload: EmailPayload, template: string, res: Response): Promise<void> => {
	try {
		// create reusable transporter object using the default SMTP transport
		const transporter = nodemailer.createTransport({
			service: process.env.EMAIL_SERVICE,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});

		const source = fs.readFileSync(path.join(__dirname, template), "utf8");
		
		const compiledTemplate = handlebars.compile(source);
		const options = () => {
			return {
				from: process.env.FROM_EMAIL,
				to: email,
				subject: subject,
				html: compiledTemplate(payload),
			};
		};

		// Send email
		await new Promise<void>((resolve, reject) => {
			transporter.sendMail(options(), (error) => {
			  if (error) {
					reject(error);
			  } else {
					resolve();
			  }
			});
		});
	  
		res.status(200).json({
			success: true,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: "An error occurred while sending the email.",
		});
	}
};
  
export { isAuthenticated, sendEmail };