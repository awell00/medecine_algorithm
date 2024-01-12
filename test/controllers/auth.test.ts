import prisma from "../../src/database/__mocks__/prisma";
import { expect, describe, it, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/server";

describe(" [POST] /register | Admin ", () => {
	it("Should respond with a '200' status code and user details", async () => {
		const { status, body } = await request(app).post("/register").send({
			email: "admin@gmail.com",
			password: "test",
			admin: true,
			passwordAdmin: process.env.VITE_ADMIN,
			// university: "Univ",
			// idu: "123456",
			// classId: "1234",
			// firstName: "test",
			// lastName: "test2"
		});

		console.log("Response status:", status);
		console.log("Response body:", body);

		// const newExtern = await prisma.extern.findFirst();

		expect(status).toBe(200);

	});
});
