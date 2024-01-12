import nodemailer from "nodemailer";
// import { Request, Response } from "express";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "medbracket@gmail.com",
		pass: process.env.PASSWORD
	}
});

const mailOptions = {
	from: "'MED Bracket' <medbracket@gmail.com>",
	to: "mail@gmail.com",
	subject: "Subject",	
	text: "Email content"
};

// type Data = {
// 	from: string,
// 	to: string,
// 	subject: string,
// 	text: string
// }

transporter.sendMail(mailOptions, (error: Error, info: any) => {
	if (error) {
		console.log(error);
	} else {
		console.log("Email sent: " + info.response);
		 
	}
});	


// const sendMail = async (req: Request, res: Response) => {
// 	const { from, to, subject, text } = req.body;
// 	const data: Data = { from, to, subject, text };
// 	const r = await nodemailer.send(data);
// 	res.send(r);
// };

// export { sendMail };


// todo add post https://javascript.plainenglish.io/send-emails-for-your-node-js-application-using-nodemailer-express-b12584d999af