import { Express } from "express";

import { isAuthenticated } from "../controllers/function/authFunction";

import { postClass, getClass, updateClass, deleteClass } from "../controllers/class";
import { postInternship, getInternship, addInternship, getAddInternship, addInternshipAuto } from "../controllers/internship";
import { getExtern, postRank, getRank, getAddExtern } from "../controllers/extern";
import { postRanking, getRanking, getExternRanking, postInternshipRank } from "../controllers/ranking";
import { postRegister, postLogin, getProfile, getLogout } from "../controllers/auth";
import { postUniversity, getUniversity, getUniversityClass, postUniversityList, getUniversityList } from "../controllers/university";
import { getOwner, postOwner } from "../controllers/owner";
import { postRequestReset, postPasswordReset } from "../controllers/auth";

export const routes = (app: Express) => {
	app.post("/university", isAuthenticated, postUniversity);
	app.get("/university", isAuthenticated, getUniversity);
	app.get("/university/class/:name", isAuthenticated, getUniversityClass);
	app.post("/university/list", isAuthenticated, postUniversityList);
	app.get("/university/list/:name", isAuthenticated, getUniversityList);

	app.post("/owner", isAuthenticated, postOwner);
	app.get("/owner", isAuthenticated, getOwner);

	app.post("/class", isAuthenticated, postClass);
	app.get("/class/:university", isAuthenticated, getClass);
	app.post("/class/update", isAuthenticated, updateClass);
	app.delete("/class/:year", isAuthenticated, deleteClass);

	app.post("/internship", isAuthenticated, postInternship);
	app.get("/internship", isAuthenticated, getInternship);
	app.post("/internship/add", isAuthenticated, addInternship);
	app.post("/internship/add/auto", isAuthenticated, addInternshipAuto);
	app.get("/internship/:name/:state", isAuthenticated, getAddInternship);

	app.get("/extern", isAuthenticated, getExtern);
	app.post("/extern/rank", isAuthenticated, postRank);
	app.get("/extern/rank", isAuthenticated, getRank);
	// app.post("/extern/add", isAuthenticated, addExtern);  
	app.get("/extern/:state", isAuthenticated, getAddExtern);

	app.post("/ranking", isAuthenticated, postRanking);
	app.get("/ranking", isAuthenticated, getRanking);
	app.get("/ranking/extern", isAuthenticated, getExternRanking);
	app.post("/ranking/internship", isAuthenticated, postInternshipRank);

	app.post("/register", postRegister);
	app.post("/login", postLogin);
	app.get("/logout", getLogout);

	app.get("/profile", isAuthenticated, getProfile);
	// app.post("/refreshToken", postRefreshToken);
	// app.post("/revoke", isAuthenticated, postRevokeRefreshTokens);

	app.post("/email", postRequestReset);
	app.get("/passwordReset", postPasswordReset);

};



