import { sql } from "@vercel/postgres";

import * as Joi from "joi";
import bcrypt from "bcrypt";
import { requestOtp, addUser } from "./helpers";
import createJwtSession from "./createJwtSession";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { JwtPayload } from "jsonwebtoken";
import { generateRandomString } from "@/helpers/functions/generateRandomString";
export async function postHandler(
   request: Request,
   { params }: { params: Promise<{ route: string }> }
) {
   const route = (await params)?.route;
   const res = await request.json();

   let schema;
   let data;

   switch (route) {
      case "register": {
         // generating schema
         schema = Joi.object({
            fullname: Joi.string().min(3).max(30).required(),
            email: Joi.string()
               .email({ tlds: { allow: false } })
               .required(),
            password: Joi.string().min(6).required(),
         });
         data = {
            fullname: res?.fullname as string,
            email: res?.email as string,
            password: res?.password as string,
         };
         const { error, value } = schema.validate(data);
         if (error) {
            return NextResponse.json(
               {
                  type: "error.credentials",
                  message: "Required credentials are missing.",
                  data: null,
               },
               {
                  status: 400,
               }
            );
         }

         // check email already exists or not
         let added;
         try {
            added = await addUser(value.email, value.password, value.fullName);
         } catch (err) {
            return NextResponse.json(
               {
                  type: "error.server",
                  message: "Internal server error.",
                  data: null,
               },
               {
                  status: 500,
               }
            );
         }

         // email already exists
         if (added.exist) {
            return NextResponse.json(
               {
                  type: "error.email.exist",
                  message: "Email already exist.",
                  data: null,
               },
               {
                  status: 200,
               }
            );
         }

         // send otp
         const otp = Math.floor(100000 + Math.random() * 900000).toString();
         // console.log(otp);
         const creationTime = Date.now();
         const sessionIdString = `${otp}_${added.id}_${creationTime}`;
         const [sessionId, otpSend] = await Promise.all([
            bcrypt.hash(sessionIdString, 10),
            requestOtp(data.email),
         ]);
         if (sessionId && otpSend) {
            return NextResponse.json(
               {
                  type: "success.otp.send",
                  message: "Otp send successfully.",
                  data: {
                     session: sessionId,
                     id: added.id,
                     creationTime: creationTime,
                  },
               },
               {
                  status: 200,
               }
            );
         } else {
            return NextResponse.json(
               {
                  type: "error.server",
                  message: "Internal server error.",
                  data: null,
               },
               {
                  status: 500,
               }
            );
         }
      }
      case "login": {
         schema = Joi.object({
            email: Joi.string()
               .email({ tlds: { allow: false } })
               .required(),
            password: Joi.string().min(6).required(),
         });
         data = {
            email: res?.email as string,
            password: res?.password as string,
         };
         const { error, value } = schema.validate(data);
         if (error) {
            return NextResponse.json(
               {
                  type: "error.credentials",
                  message: "Required credentials are missing.",
                  data: null,
               },
               {
                  status: 400,
               }
            );
         }

         let row;
         try {
            const { rows } =
               await sql`SELECT email, email_verified, uuid, password FROM Users WHERE email = ${value.email} LIMIT 1;`;
            row = rows;
         } catch (err) {
            return NextResponse.json(
               {
                  type: "error.server",
                  message: "Internal server error.",
                  data: null,
               },
               {
                  status: 500,
               }
            );
         }

         if (row.length === 0 || !row[0].email_verified) {
            return NextResponse.json(
               {
                  type: "error.credentials.user",
                  message: "No user found.",
                  data: null,
               },
               {
                  status: 401,
               }
            );
         }

         const user = row[0];
         const passwordMatch = await bcrypt.compare(
            data.password,
            user.password
         );

         if (!passwordMatch) {
            return NextResponse.json(
               {
                  type: "error.credentials.password",
                  message: "Invalid password.",
                  data: null,
               },
               {
                  status: 401,
               }
            );
         }

         const accessToken = createJwtSession(user.uuid, "15m");
         const refreshToken = createJwtSession(user.uuid, "30d");
         const csrfToken = generateRandomString(15);

         const setCookies = generateCookie(
            accessToken,
            refreshToken,
            csrfToken
         );
         return NextResponse.json(
            {
               type: "success.login",
               message: "Login successful.",
               data: {
                  accessToken,
                  refreshToken,
                  csrfToken,
                  expireIn: 900,
               },
            },
            {
               status: 200,
               headers: {
                  "Set-Cookie": setCookies.join(", "),
               },
            }
         );
      }
      case "verify": {
         schema = Joi.object({
            session: Joi.string().required(),
            code: Joi.string().min(6).required(),
            time: Joi.number().required(),
            id: Joi.string().guid({ version: "uuidv4" }).required(),
         });
         data = {
            session: res?.session as string,
            code: res?.code as string,
            time: parseInt(res?.time as string, 10),
            id: res?.id as string,
         };
         const { error, value } = schema.validate(data);

         if (error) {
            return NextResponse.json(
               {
                  type: "error.credentials",
                  message: "Required credentials are missing.",
                  data: null,
               },
               {
                  status: 400,
               }
            );
         }
         const currentTime = Date.now();
         if (currentTime - value.time > 600000) {
            return NextResponse.json(
               {
                  type: "error.otp.expired",
                  message: "Otp is expired.",
                  data: null,
               },
               {
                  status: 401,
               }
            );
         }
         const sessionIdString = `${value.code}_${value.id}_${value.time}`;
         const isValidSession = await bcrypt.compare(
            sessionIdString,
            value.session
         );

         if (!isValidSession) {
            return NextResponse.json(
               {
                  type: "error.otp.invalid",
                  message: "Otp is invalid.",
                  data: null,
               },
               {
                  status: 401,
               }
            );
         }
         const accessToken = createJwtSession(value.id, "15m");
         const refreshToken = createJwtSession(value.id, "30d");
         const csrfToken = generateRandomString(15);

         const setCookies = generateCookie(
            accessToken,
            refreshToken,
            csrfToken
         );
         return NextResponse.json(
            {
               type: "success.login",
               message: "Login successful.",
               data: {
                  accessToken,
                  refreshToken,
                  csrfToken,
                  expireIn: 900,
               },
            },
            {
               status: 200,
               headers: {
                  "Set-Cookie": setCookies.join(", "),
               },
            }
         );
      }
      case "refresh": {
         const cookieStore = cookies();
         const accessToken = cookieStore?.get("access")?.value;
         const refreshToken = cookieStore?.get("refresh")?.value;
         const csrfTokenClient = cookieStore?.get("csrf")?.value;

         if (!accessToken || !refreshToken || !csrfTokenClient) {
            return NextResponse.json(
               { type: "error.token", message: "Required tokens are missing." },
               { status: 401 }
            );
         }
         const decodedAccessToken = verifyToken(accessToken);

         if (decodedAccessToken) {
            // If verified then response null
            return NextResponse.json(
               { accessToken: null, refreshToken: null },
               { status: 200 }
            );
         } else {
            // If not verified then check refresh token is valid or not
            const decodedRefreshToken = verifyToken(refreshToken);

            if (decodedRefreshToken) {
               // If valid then generate new access token as well as refresh token
               const accessToken = jwt.sign(
                  { id: (decodedRefreshToken as JwtPayload).id },
                  process.env.JWT_SECRET!,
                  { expiresIn: "15m" }
               );
               const refreshToken = jwt.sign(
                  { id: (decodedRefreshToken as JwtPayload).id },
                  process.env.JWT_SECRET!,
                  { expiresIn: "30d" }
               );
               const csrfToken = generateRandomString(15);

               // Set new tokens in the cookies
               const setCookies = generateCookie(
                  accessToken,
                  refreshToken,
                  csrfToken
               );
               return NextResponse.json(
                  {
                     type: "success.login",
                     message: "Login successful.",
                     data: {
                        accessToken,
                        refreshToken,
                        csrfToken,
                        expireIn: 900,
                     },
                  },
                  {
                     status: 200,
                     headers: {
                        "Set-Cookie": setCookies.join(", "),
                     },
                  }
               );
            } else {
               return NextResponse.json(
                  {
                     type: "error.token",
                     message: "Required tokens are invalid.",
                  },
                  { status: 401 }
               );
            }
         }
      }
      case "logout": {
         // delete data from db the del ete cookies
      }
      default:
         return NextResponse.json(
            { type: "error", message: "credentials.error", data: null },
            {
               status: 400,
            }
         );
   }
}

const verifyToken = (token: string) => {
   try {
      return jwt.verify(token, process.env.JWT_SECRET!); // Replace 'your-secret-key' with your actual secret key
   } catch (error) {
      return null;
   }
};

const generateCookie = (
   accessToken: string,
   refreshToken: string,
   csrfToken: string
) => {
   const isProduction = process.env.NODE_ENV === "production";

   // expire time 15 * 60 * 1000 = 15min = 900000
   // expire time 30 * 24 * 60 * 60 * 1000 = 30days = 2592000000
   const setCookies = [
      `access=${accessToken}; HttpOnly; Path=/; Secure; SameSite=Strict; ${
         isProduction ? "Secure" : ""
      }; Expires=${new Date(Date.now() + 900000).toUTCString()}`,
      `refresh=${refreshToken}; HttpOnly; Path=/; Secure; SameSite=Strict; ${
         isProduction ? "Secure" : ""
      }; Expires=${new Date(Date.now() + 2592000000).toUTCString()}`,
      `csrf=${csrfToken}; HttpOnly; Path=/; Secure; SameSite=Strict; ${
         isProduction ? "Secure" : ""
      }; Expires=${new Date(Date.now() + 2592000000).toUTCString()}`,
   ];
   return setCookies;
};
