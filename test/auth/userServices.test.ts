import { expect, describe, it, vi, beforeEach } from "vitest";
import { createExtern, createAdmin, findExtern, findAdmin, createOwner, findOwner } from "../../src/auth/userServices";
import prisma from "../../src/database/__mocks__/prisma";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";

vi.mock("../../src/database/prisma");

describe("UserServices", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe("Extern", () => {
		type Extern = {
			email: string;
			password: string;
			classId: string;
			firstName: string;
			lastName: string;
			numberOfInternship: number;
			idu: number;
		};
	
		it("createExtern should return the generated Extern", async () => {
			const password = "test";
			const id = uuidv4();
		
			const newExtern: Extern = {
				email: "extern@prisma.io",
				password,
				classId: "12345",
				firstName: "ExternF",
				lastName: "ExternL",
				numberOfInternship: 0,
				idu: 148740
			};
		
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			prisma.extern.create.mockResolvedValue({ ...newExtern, id });
		
			const extern = await createExtern(newExtern);
		  
			const validPassword = await bcrypt.compare(password, newExtern.password);
		
			const expectedExtern = {
				...newExtern,
				id,
				password: expect.any(String), // Exclude password from strict equality check
			};
		
			expect(validPassword).toBe(true);
			expect(extern).toStrictEqual(expectedExtern);
		  
		});
	
		it("findExtern should find and return an Extern", async () => {
			type MockExtern = Extern & {
				id: string;
			};
	
			const password = "test";
			const id = uuidv4();
			const email = "extern@prisma.io";
	
			const mockExtern: MockExtern = {
				id,
				email,
				password,
				classId: "12345",
				firstName: "ExternF",
				lastName: "ExternL",
				numberOfInternship: 0,
				idu: 384689
			};

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			prisma.extern.findFirst.mockResolvedValueOnce(mockExtern);
	
			const extern = await findExtern(email);
			expect(extern).toStrictEqual(mockExtern);
		});
	});
	
	describe("Admin", () => {
		type Admin = {
			email: string;
			password: string;
		}
		
		it("createAdmin should return the Admin", async () => {
			const password = "admin";
			const id = uuidv4();
		
			const newAdmin: Admin = {
				email: "admin@gmail.com",
				password,
			};

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			prisma.admin.create.mockResolvedValue({ ...newAdmin, id });
		
			const admin = await createAdmin(newAdmin);
		  
			const validPassword = await bcrypt.compare(password, newAdmin.password);
		
			const expectedUser = {
				...newAdmin,
				id,
				password: expect.any(String), // Exclude password from strict equality check
			};
		
			expect(validPassword).toBe(true);
			expect(admin).toStrictEqual(expectedUser);
		  
		});
	
		it("findAdmin should find and return an Admin", async () => {
			type MockAdmin = Admin & {
				id: string;
			};
	
			const password = "test";
			const id = uuidv4();
			const email = "admin@gmail.com";
	
			const mockAdmin: MockAdmin = {
				id,
				email,
				password,
			};

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			prisma.admin.findFirst.mockResolvedValueOnce(mockAdmin);
	
			const admin = await findAdmin(email);
			expect(admin).toStrictEqual(mockAdmin);
		});
	});

	describe("Owner", () => {
		type Owner = {
			email: string;
			password: string;
		}
		
		it("createOwner should return the Owner", async () => {
			const password = "owner";
			const id = uuidv4();
		
			const newOwner: Owner = {
				email: "owner@gmail.com",
				password,
			};

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			prisma.owner.create.mockResolvedValue({ ...newOwner, id });
		
			const owner = await createOwner(newOwner);
		  
			const validPassword = await bcrypt.compare(password, newOwner.password);
		
			const expectedUser = {
				...newOwner,
				id,
				password: expect.any(String), // Exclude password from strict equality check
			};
		
			expect(validPassword).toBe(true);
			expect(owner).toStrictEqual(expectedUser);
		  
		});
	
		it("findExtern should find and return an Extern", async () => {
			type MockOwner = Owner & {
				id: string;
			};
	
			const password = "test";
			const id = uuidv4();
			const email = "owner@gmail.com";
	
			const mockOwner: MockOwner = {
				id,
				email,
				password,
			};
	
			prisma.owner.findFirst.mockResolvedValueOnce(mockOwner);
	
			const owner = await findOwner(email);
			expect(owner).toStrictEqual(mockOwner);
		});
	});
});


