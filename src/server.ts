import express, { Express } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

import { routes } from "./routers/routers";

dotenv.config();

// Setting up your port
const PORT = process.env.PORT || 4000;

// Express app
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Options for cors middleware
const options: cors.CorsOptions = {
	origin: ["http://localhost:5173", "https://5173-awell00-medicinealgorit-y705d9xb86b.ws-eu100.gitpod.io", "http://51.178.138.91"],
	allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
	credentials: true,
	exposedHeaders: ["*", "Authorization" ],
	maxAge: 28000,
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use cors middleware with the specified options
app.use(cors(options));

routes(app);


app.listen(PORT, () => {
	console.log(`App listening at ${PORT}`);
});

export {app };


