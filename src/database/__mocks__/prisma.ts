import { PrismaClient } from "@prisma/client";
import { beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

beforeEach(() => {
	mockReset(mockPrisma);
});

const mockPrisma = mockDeep<PrismaClient>();
export default mockPrisma;

// import { PrismaClient } from "@prisma/client-test";
// import { beforeEach } from "vitest";
// import { mockDeep, mockReset } from "vitest-mock-extended";
//
// beforeEach(() => {
// 	mockReset(mockPrisma);
// });
//
// class MockExtern {
// 	async findFirst(params: { where: { id: string } }) {
// 		if (params.where.id === "expectedExternId") {
// 			return {
// 				class: {
// 					numberOfStudent: 0, // Mocked value for numberOfStudent
// 				}
// 			};
// 		} else {
// 			return null;
// 		}
// 	}
// }
//
// class MockPrismaClient extends PrismaClient {
// 	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// 	// @ts-ignore
// 	extern: MockExtern = new MockExtern(); // Initialize with MockExtern instance
// }
//
// const mockPrisma = mockDeep(MockPrismaClient);
// export default mockPrisma;