import { testApiHandler } from "next-test-api-route-handler"; // Must always be first

import * as appHandler from "@/app/api/auth/[route]/route";
import { testCasesRegister, testCasesLogin } from "./testCases";

describe("API POST /api/auth/:route", () => {
   testCasesRegister.forEach(
      ({ description, requestBody, expectedStatus, expectedData }) => {
         it(`POST /api/auth/register returns ${expectedStatus} when ${description}`, async () => {
            await testApiHandler({
               appHandler,
               paramsPatcher(params) {
                  params.route = "register";
               },
               test: async ({ fetch }) => {
                  const response = await fetch({
                     method: "POST",
                     body: JSON.stringify(requestBody),
                  });
                  const json = await response.json();
                  expect(response.status).toBe(expectedStatus);
                  expect(json).toMatchObject(expectedData);
               },
            });
         });
      }
   );
   testCasesLogin.forEach(
      ({ description, requestBody, expectedStatus, expectedData }) => {
         it(`POST /api/auth/login returns ${expectedStatus} when ${description}`, async () => {
            await testApiHandler({
               appHandler,
               paramsPatcher(params) {
                  params.route = "login";
               },
               test: async ({ fetch }) => {
                  const response = await fetch({
                     method: "POST",
                     body: JSON.stringify(requestBody),
                  });
                  const json = await response.json();
                  expect(response.status).toBe(expectedStatus);
                  expect(json).toMatchObject(expectedData);
               },
            });
         });
      }
   );
});

// describe("API POST /api/auth/[route]", () => {
//    it("handles POST request for login", async () => {
//       const { req, res } = createMocks({
//          method: "POST",
//          body: { email: "test@example.com", password: "password123" },
//          params: { route: "login" },
//       });
//       await POST(req, res);
//
//       expect(res._getStatusCode()).toBe(200);
//       // Add more assertions based on your response structure
//    });
//
//    it("handles POST request for register", async () => {
//       const { req, res } = createMocks({
//          method: "POST",
//          body: {
//             fullName: "John Doe",
//             email: "test@example.com",
//             password: "password123",
//          },
//          params: { route: "register" },
//       });
//       await POST(req, res);
//
//       expect(res._getStatusCode()).toBe(201);
//       // Add more assertions based on your response structure
//    });
//
//    it("handles POST request for verify", async () => {
//       const { req, res } = createMocks({
//          method: "POST",
//          body: {
//             session: "session-id",
//             code: "123456",
//             time: Date.now(),
//             id: "uuid-id",
//          },
//          params: { route: "verify" },
//       });
//       await POST(req, res);
//
//       expect(res._getStatusCode()).toBe(200);
//       // Add more assertions based on your response structure
//    });
// });
