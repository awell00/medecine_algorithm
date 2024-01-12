import bcrypt from "bcrypt";
import prisma from "../database/prisma";
import { Extern as PrismaExtern, Admin as PrismaAdmin, Owner as PrismaOwner } from "@prisma/client";

// Define the Extern type
type Extern = {
	email: string;
	password: string;
	classId: string;
	firstName: string;
	lastName: string;
	numberOfInternship: number;
	idu: number
}

// Define the Admin type
type Admin = {
	email: string;
	password: string;
}

// type Email = {
// 	from: string,
// 	to: string,
// 	subject: string,
// 	text: string
// }

// Function to find an Extern by email
const findExtern = (email: string): Promise<PrismaExtern | null> => {
	return prisma.extern.findFirst({
		where: {
			email
		},
	});
};

const findExternById = (id: string): Promise<PrismaExtern | null> => {
	return prisma.extern.findFirst({
		where: {
			id
		},
	});
};

// Function to find an Admin by email
const findAdmin = (email: string): Promise<PrismaAdmin | null> => {
	return prisma.admin.findFirst({
		where: {
			email
		},
	});
};

const findAdminById = (id: string): Promise<PrismaAdmin | null> => {
	return prisma.admin.findFirst({
		where: {
			id
		},
	});
};

const findOwner = (email: string): Promise<PrismaOwner | null> => {
	return prisma.owner.findFirst({
		where: {
			email
		},
	});
};

const findOwnerById = (id: string): Promise<PrismaOwner | null> => {
	return prisma.owner.findFirst({
		where: {
			id
		},
	});
};

// Function to create an Extern by email and password
const createExtern = (extern: Extern): Promise<PrismaExtern> => {
	if (!Number.isInteger(extern.idu) || extern.idu < 100000 || extern.idu > 999999) {
		throw new Error("idu must be a 6-digit number.");
	}
	console.log(extern.idu);
	
	// Hash the password before storing it in the database
	extern.password = bcrypt.hashSync(extern.password, 12);
	
	return prisma.extern.create({
		data: extern,
	});
};

// Function to create an Admin
const createAdmin = (admin: Admin): Promise<PrismaAdmin> => {
	// Hash the password before storing it in the database
	admin.password = bcrypt.hashSync(admin.password, 12);
	
	return prisma.admin.create({
		data: admin,
	});
};

const createOwner = (owner: Admin): Promise<PrismaAdmin> => {
	// Hash the password before storing it in the database
	owner.password = bcrypt.hashSync(owner.password, 12);
	
	return prisma.owner.create({
		data: owner,
	});
};

export {
	findAdmin,
	findAdminById,
	findOwner,
	findOwnerById,
	findExtern,
	findExternById,
	createExtern,
	createAdmin,
	createOwner
};
