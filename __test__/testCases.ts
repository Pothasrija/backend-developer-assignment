export const testCasesRegister = [
   {
      description: "missing email and password",
      requestBody: { fullname: "Aditya" },
      expectedStatus: 400,
      expectedData: {
         type: "error.credentials",
      },
   },
   //    {
   //       description: "valid register credentials",
   //       requestBody: {
   //          fullname: "John Doe",
   //          email: "test@example.com",
   //          password: "password123",
   //       },
   //       expectedStatus: 200,
   //    },
   {
      description: "missing password",
      requestBody: { fullname: "John Doe", email: "test@example.com" },
      expectedStatus: 400,
      expectedData: {
         type: "error.credentials",
      },
   },
   {
      description: "invalid email format",
      requestBody: {
         fullname: "John Doe",
         email: "test@.com",
         password: "password123",
      },
      expectedStatus: 400,
      expectedData: {
         type: "error.credentials",
      },
   },
];
export const testCasesLogin = [
   {
      description: "missing email and password",
      requestBody: { fullname: "Aditya" },
      expectedStatus: 400,
      expectedData: {
         type: "error.credentials",
      },
   },
   {
      description: "invalid email format",
      requestBody: {
         fullname: "John Doe",
         email: "test@.com",
         password: "password123",
      },
      expectedStatus: 400,
      expectedData: {
         type: "error.credentials",
      },
   },
   //    {
   //       description: "no user found",
   //       requestBody: { fullname: "John Doe", email: "test@example.com" },
   //       expectedStatus: 401,
   //    },
   //    {
   //       description: "valid register credentials",
   //       requestBody: {
   //          fullname: "John Doe",
   //          email: "test@example.com",
   //          password: "password123",
   //       },
   //       expectedStatus: 200,
   //    },
];
