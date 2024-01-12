import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Defining the TokenPayload type
type TokenPayload = {
	externId: string;
	admin?: boolean;
	owner?: boolean;
	jti?: string;
}

// FIXME: Owner doesn't be add in payload of jwt
// Function to generate an access token
const generateAccessToken = (user: { id: string }, admin: boolean, owner: boolean): { token: string, algorithm: string } => {
	const options: SignOptions = {
	  	algorithm: "HS512",
	  	expiresIn: "5m",
	};
  
	let payload: TokenPayload; // Declare the payload variable outside of the conditionals
  
	if (admin === true && owner === false) {
	  	payload = {
			externId: user.id,
			admin: true,
	  	};
	} else if (owner === true && admin === false) {
		payload = {
			externId: user.id,
			owner: true,
	  	};
	} else {
	  	payload = {
			externId: user.id,
	  	};
	}
  
	const token: string = jwt.sign(payload, process.env.VITE_JWT_ACCESS_SECRET, options);
  
	return {
	  	token,
	  	algorithm: options.algorithm,
	};
};

// Function to generate a refresh token
const generateRefreshToken = (user: { id: string }, admin: boolean, owner: boolean): { token: string, algorithm: string } => {
	const options: SignOptions = {
		algorithm: "HS512",
		expiresIn: "8h",
	};
	
	let payload: TokenPayload; // Declare the payload variable outside of the conditionals
	
	if (admin === true && owner === false) {
		payload = {
			externId: user.id,
			admin: true,
			jti: uuidv4()
		};
	} else if (owner === true && admin === false) {
		payload = {
			externId: user.id,
			owner: true,
			jti: uuidv4()
		};
	} else {
		payload = {
			externId: user.id,
			jti: uuidv4()
		};
	}
	
	const token: string = jwt.sign(payload, process.env.VITE_JWT_REFRESH_SECRET, options);
	
	return {
		token,
		algorithm: options.algorithm,
	};
};

// Function to generate access and refresh tokens
const generateTokens = (extern: { id: string }): { accessToken: string, refreshToken: string } => {
	// Generating the access token
	const accessToken = generateAccessToken(extern, false, false);

	// Generating the refresh token
	const refreshToken = generateRefreshToken(extern, false, false);

	// Returning the tokens
	return {
		accessToken: accessToken.token,
		refreshToken: refreshToken.token
	};
};

// Function to generate access and refresh tokens for admin
const generateTokensAdmin = (admin: { id: string }): { accessToken: string, refreshToken: string } => {
	// Generating the admin access token
	const accessToken = generateAccessToken(admin, true, false);

	// Generating the admin refresh token
	const refreshToken = generateRefreshToken(admin, true, false);

	// Returning the tokens
	return {
		accessToken: accessToken.token,
		refreshToken: refreshToken.token
	};
};

// Function to generate access and refresh tokens for owner
const generateTokensOwner = (owner: { id: string }): { accessToken: string, refreshToken: string } => {
	// Generating the admin access token
	const accessToken = generateAccessToken(owner, false, true);

	// Generating the admin refresh token
	const refreshToken = generateRefreshToken(owner, false, true);

	// Returning the tokens
	return {
		accessToken: accessToken.token,
		refreshToken: refreshToken.token
	};
};

// Exporting the functions
export {
	generateAccessToken,
	generateRefreshToken,
	generateTokens,
	generateTokensAdmin,
	generateTokensOwner
};
