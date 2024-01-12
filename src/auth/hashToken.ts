import crypto from "crypto";
import bcrypt from "bcrypt";

const createToken = (): string => {
	return crypto.randomBytes(64).toString("hex");
};

const hashComparaison = async (token: string, anotherToken: string): Promise<boolean> => {
	try {
		return await bcrypt.compare(token, anotherToken);
	} catch (error) {
		throw new Error("Error during bcrypt.compare" );
	}
};

// Function to hash a token using SHA-512 algorithm
const hashToken = (token: string): string => {
	return bcrypt.hashSync(token, 12);
};

export { hashToken, createToken, hashComparaison };

