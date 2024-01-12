import { hashToken, createToken, hashComparaison } from "../../src/auth/hashToken";
import { describe, expect, it } from "vitest";
import * as bcrypt from "bcrypt";

const password = "test";
const newHashing: string = hashToken(password);
const anotherHashing: string = hashToken(password);

describe("Hash Token", () => {

	it("Should generate 12-character hash token ", async () => {
		const hashCompare: boolean = await bcrypt.compare(password, newHashing);

		expect(hashCompare).toEqual(true);
	});

	it("Should generate different hashing on each call", () => {
		expect(newHashing).not.toEqual(anotherHashing);
	});
});

describe("Comparing Hash Tokens", () => {
	it("Should return correct boolean value", async () => {
		const functionHC = await hashComparaison(password, newHashing);
		const hashCompare: boolean = await bcrypt.compare(password, newHashing);

		expect(functionHC).toEqual(hashCompare);
	});
});

describe("Create Token", () => {
	const newToken: string = createToken();

	it("Should generate 64-character token", () => {
		const newTokenBytes = new Blob([newToken]);
    
		expect(newTokenBytes.size).toEqual(128);
	});

	it("Should be in Hexadecimal", () => {
		const hexadecimalRegex = /^[0-9A-Fa-f]+$/;

		expect(hexadecimalRegex.test(newToken)).toEqual(true);
	});

	it("Should generate different tokens on each call", () => {
		const anotherToken: string = createToken();

		expect(newToken).not.toEqual(anotherToken);
	});
});