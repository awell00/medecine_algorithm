import { expect, describe, it, vi, beforeEach } from "vitest";
import prisma from "../../src/database/__mocks__/prisma";
import { v4 as uuidv4 } from "uuid";
import { findAdmin } from "../../src/auth/userServices";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import request from "supertest";
import mockPrisma from "../../src/database/__mocks__/prisma";
import originalPrisma from "../../src/database/prisma";
import { app } from "../../src/server";
import { generateTokensAdmin } from "../../src/auth/jwt";

vi.mock("../../src/database/prisma");


type MockUniversity = {
	id: string;
	name: string;
	code: number;
	ownerId: string;
};
// TODO: change mock and update function
// Describe your test suite


describe("postUniversity", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	// Test case 1: Test successful university creation
	it("should create a university", async () => {
		// Mock the Prisma methods
		const castedMockPrisma = mockPrisma as unknown as typeof originalPrisma;

		originalPrisma.university.create = castedMockPrisma.university.create;
		originalPrisma.university.count = castedMockPrisma.university.count;
		originalPrisma.university.findMany = castedMockPrisma.university.findMany;
		originalPrisma.owner.count = castedMockPrisma.owner.count;

		const mockUniversity: MockUniversity = {
			id: "Id",
			name: "Test University",
			code: 1234,
			ownerId: "ownerId",
		}; // <-- Removed extra closing parenthesis here

		const list = [
			{
				id: "universityId1",
				name: "Test University 1",
				code: 1234,
			},
			{
				id: "universityId2",
				name: "Test University 2",
				code: 5678,
			},
		];

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.university.create.mockResolvedValueOnce(mockUniversity);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.university.count.mockResolvedValueOnce(0);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.university.findMany.mockResolvedValueOnce([]);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.owner.count.mockResolvedValueOnce(1);

		type Admin = {
			email: string;
			password: string;
		}

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

		const { refreshToken } = generateTokensAdmin(admin);

		const cookie = `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict`;
		// Make an HTTP request to your Express route
		const response = await request(app)
			.post("/university")
			.send({
				name: "Test University",
				passwordAdmin: process.env.VITE_ADMIN,
				ownerId: "ownerId",
				list
			})
			.set("Cookie", [cookie]);

		console.log(response.body);
		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ id: "Id", name: "Test University", code: 1234, ownerId: "ownerId" });
	});

	it("should create a list ", async () => {
		const castedMockPrisma = mockPrisma as unknown as typeof originalPrisma;

		// originalPrisma.university.create = castedMockPrisma.university.create;
		// originalPrisma.university.count = castedMockPrisma.university.count;
		originalPrisma.university.findFirst = castedMockPrisma.university.findFirst;
		originalPrisma.list.create = castedMockPrisma.list.create;
		// originalPrisma.owner.count = castedMockPrisma.owner.count;
		//
		const mockUniversity: MockUniversity = {
			id: "Id",
			name: "Test University",
			code: 1234,
			ownerId: "ownerId",
		};  // <-- Removed extra closing parenthesis here

		mockPrisma.university.findFirst.mockResolvedValueOnce(mockUniversity);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mockPrisma.list.create.mockResolvedValue({
			id: "Id",
			universityId: "Id",
			fullName: "Full Name",
			idu: 123456,
		});

		type Admin = {
			email: string;
			password: string;
		}

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

		const { refreshToken } = generateTokensAdmin(admin);

		const cookie = `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict`;
		// Make an HTTP request to your Express route
		const response = await request(app)
			.post("/university/list")
			.send({
				name: "Test University",
				passwordAdmin: process.env.VITE_ADMIN,
				fullName: "Full Name",
				code: 1234,
			})
			.set("Cookie", [cookie]);


		// Assertions
		expect(response.status).toBe(200);
		console.log(response.body);
	});

	// TODO: way to return value for all user

	it("should return a list for many user", async () => {

		const castedMockPrisma = mockPrisma as unknown as typeof originalPrisma;

		// originalPrisma.university.create = castedMockPrisma.university.create;
		// originalPrisma.university.count = castedMockPrisma.university.count;
		originalPrisma.university.findFirst = castedMockPrisma.university.findFirst;
		originalPrisma.list.create = castedMockPrisma.list.create;
		// originalPrisma.owner.count = castedMockPrisma.owner.count;

		type MockUniversityList = {
			id: string
			name: string;
			code: number;
			ownerId: string;
			List: {
				id: string;
				fullName: string;
				idu: number;
				universityId: string;
			}[]
		}

		const mockUniversityList: MockUniversityList = {
			id: "Id",
			name: "Test University",
			code: 1234,
			ownerId: "ownerId",
			List: [
				{
					id: "Id",
					universityId: "Id",
					fullName: "Full Name",
					idu: 234567,
				},
				{
					id: "Id",
					universityId: "Id",
					fullName: "Full Name2",
					idu: 123456,
				},
				{
					id: "Id",
					universityId: "Id",
					fullName: "Full Name3",
					idu: 123454,
				}
			]
		};  // <-- Removed extra closing parenthesis here

		mockPrisma.university.findFirst.mockResolvedValueOnce(mockUniversityList);

		type Admin = {
			email: string;
			password: string;
		}

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

		const { refreshToken } = generateTokensAdmin(admin);

		const cookie = `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict`;
		// Make an HTTP request to your Express route
		const response = await request(app)
			.get(`/university/list/${mockUniversityList.name}`)
			.set("Cookie", [cookie]);
		// Assertions
		expect(response.status).toBe(200);
		console.log(response.body);

	});
});


