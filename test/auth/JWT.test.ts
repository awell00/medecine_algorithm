import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";
import { generateAccessToken, generateRefreshToken, generateTokens, generateTokensAdmin, generateTokensOwner } from "../../src/auth/jwt";
import { v4 as uuidv4 } from "uuid";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";


describe("JWT", () => {
	
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		// restoring date after each test run
		vi.useRealTimers();
	});	

	describe("Access", () => {
		const secret = process.env.VITE_JWT_ACCESS_SECRET || undefined;

		describe("GenerateAccessToken | Extern", () => {

			const mockExtern = { id: uuidv4() };
			const accessToken = generateAccessToken(mockExtern, false, false);
			
			it("Should generate an access token with the correct payload", () => {
		
				if (secret) {
					const decodedToken = jwt.verify(
					  accessToken.token,
					  secret
					) as JwtPayload;
					
					expect(decodedToken.externId).toEqual(mockExtern.id);
				} else {
					throw new Error("process.env.VITE_JWT_ACCESS_SECRET is not defined");
				}
	
			});
	
			it("Should generate an access token with the correct algorithm", () => {
			
				const { algorithm } = generateAccessToken(mockExtern, false, false);
				expect(algorithm).toEqual("HS512");
	
			});
			
			it("Should generate an access token that expires after the specified duration", async () => {
				vi.advanceTimersByTime(5 * 60 * 1000);
				
				 // Use undefined if process.env.VITE_JWT_ACCESS_SECRET is undefined
	
				if (secret) {
					expect(() => {
						jwt.verify(accessToken.token, secret);
					}).toThrow(jwt.TokenExpiredError);
				} else {
					throw new Error("process.env.VITE_JWT_ACCESS_SECRET is not defined");
				}
			});
		});

		describe("GenerateAccessToken | Admin", () => {

			const mockAdmin = { id: uuidv4() };
			const accessToken = generateAccessToken(mockAdmin, true, false);
			
			it("Should generate an access token with the correct payload for admin", () => {
		
				if (secret) {
					const decodedToken = jwt.verify(
					  accessToken.token,
					  secret
					) as JwtPayload;
			  
					expect(decodedToken.externId).toEqual(mockAdmin.id);
				} else {
					throw new Error("process.env.VITE_JWT_ACCESS_SECRET is not defined");
				}
	
			});
		});

		describe("GenerateAccessToken | Owner", () => {

			const mockAdmin = { id: uuidv4() };
			const accessToken = generateAccessToken(mockAdmin, false, true);
			
			it("Should generate an access token with the correct payload for owner", () => {
		
				if (secret) {
					const decodedToken = jwt.verify(
					  accessToken.token,
					  secret
					) as JwtPayload;
			  
					expect(decodedToken.externId).toEqual(mockAdmin.id);
				} else {
					throw new Error("process.env.VITE_JWT_ACCESS_SECRET is not defined");
				}
	
			});
		});
	});

	describe("Refresh", () => {
		const secret = process.env.VITE_JWT_REFRESH_SECRET || undefined;

		describe("GenerateRefreshToken | Extern", () => {

			const mockExtern = { id: uuidv4() };
			const refreshToken = generateRefreshToken(mockExtern, false, false);
			
			it("Should generate an refresh token with the correct payload", () => {
		
				if (secret) {
					const decodedToken = jwt.verify(
						refreshToken.token,
					  	secret
					) as JwtPayload;
			  
					expect(decodedToken.externId).toEqual(mockExtern.id);
				} else {
					throw new Error("process.env.VITE_JWT_ACCESS_SECRET is not defined");
				}
	
			});
	
			it("Should generate an refresh token with the correct algorithm", () => {
			
				const { algorithm } = generateAccessToken(mockExtern, false, false);
				expect(algorithm).toEqual("HS512");
	
			});
			
			it("Should generate an refresh token that expires after the specified duration", async () => {
				vi.advanceTimersByTime(8 * 60 * 60 * 1000);
				
				if (secret) {
					expect(() => {
						jwt.verify(refreshToken.token, secret);
					}).toThrow(jwt.TokenExpiredError);
				} else {
					throw new Error("process.env.VITE_JWT_ACCESS_SECRET is not defined");
				}
			});
		}); 

		describe("GenerateRefreshToken | Admin", () => {

			const mockAdmin = { id: uuidv4() };
			const refreshToken = generateRefreshToken(mockAdmin, true, false);
			
			it("Should generate an refresh token with the correct payload", () => {
		
				if (secret) {
					const decodedToken = jwt.verify(
						refreshToken.token,
					  	secret
					) as JwtPayload;
			  
					expect(decodedToken.externId).toEqual(mockAdmin.id);
				} else {
					throw new Error("process.env.VITE_JWT_ACCESS_SECRET is not defined");
				}
	
			});
		}); 

		describe("GenerateRefreshToken | Owner", () => {

			const mockAdmin = { id: uuidv4() };
			const refreshToken = generateRefreshToken(mockAdmin, false, true);
			
			it("Should generate an refresh token with the correct payload", () => {
		
				if (secret) {
					const decodedToken = jwt.verify(
						refreshToken.token,
					  	secret
					) as JwtPayload;
			  
					expect(decodedToken.externId).toEqual(mockAdmin.id);
				} else {
					throw new Error("process.env.VITE_JWT_ACCESS_SECRET is not defined");
				}
	
			});
		}); 
	});

	describe("Generate", () => {
		it("should generate access and refresh tokens correctly for Extern", () => {
			const mockExtern = { id: uuidv4() };
			const tokens = generateTokens(mockExtern);
		
			// Assert that the generated tokens have the correct structure
			expect(tokens).toHaveProperty("accessToken");
			expect(tokens).toHaveProperty("refreshToken");
		});

		it("should generate access and refresh tokens correctly for Admin", () => {
			const mockAdmin = { id: uuidv4() };
			const tokens = generateTokensAdmin(mockAdmin);
		
			// Assert that the generated tokens have the correct structure
			expect(tokens).toHaveProperty("accessToken");
			expect(tokens).toHaveProperty("refreshToken");
		
		});

		it("should generate access and refresh tokens correctly for Owner", () => {
			const mockAdmin = { id: uuidv4() };
			const tokens = generateTokensOwner(mockAdmin);
		
			// Assert that the generated tokens have the correct structure
			expect(tokens).toHaveProperty("accessToken");
			expect(tokens).toHaveProperty("refreshToken");
		
		});
	});
	
});