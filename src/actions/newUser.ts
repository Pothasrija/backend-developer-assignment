"use server";

import { sql } from "@vercel/postgres";

import * as Joi from "joi";
import bcrypt from "bcrypt";
export async function newUser(formData: FormData) {
   const schema = Joi.object({
      fullName: Joi.string().min(3).max(30).required(),
      email: Joi.string()
         .email({ tlds: { allow: false } })
         .required(),
      password: Joi.string().min(6).required(),
   });

   const data = {
      fullName: formData.get("fullname") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
   };

   const { error, value } = schema.validate(data);

   if (error) {
      return {
         type: "error",
         message: "invalid.input",
         data: null,
      };
   }

   // check email already exists or not
   const added = await addUser(value.email, value.password, value.fullName);

   if (added.exist) {
      return {
         type: "error",
         message: "email.exist",
         data: null,
      };
   }
   const otp = Math.floor(100000 + Math.random() * 900000).toString();
   console.log(otp);
   const creationTime = Date.now();
   const sessionIdString = `${otp}_${added.id}_${creationTime}`;
   const [sessionId, otpSend] = await Promise.all([
      bcrypt.hash(sessionIdString, 10),
      requestOtp(data.email),
   ]);
   if (sessionId && otpSend) {
      return {
         type: "success",
         message: "otp.send",
         data: {
            session: sessionId,
            id: added.id,
            creationTime: creationTime,
         },
      };
   }
   return {
      type: "error",
      message: "unexpected",
      data: null,
   };
}
async function addUser(
   email: string,
   password: string,
   fullName: string
): Promise<{ exist: boolean; id: string }> {
   // Check if email exists
   const { rows } =
      await sql`SELECT email, email_verified, uuid FROM Users WHERE email = ${email} LIMIT 1;`;
   if (rows.length > 0) {
      const user = rows[0];
      if (user.email_verified) {
         return { exist: true, id: user.uuid }; // Email exists and is verified
      } else {
         // Email exists but is not verified - update user info
         const hashedPassword = await bcrypt.hash(password, 10);
         await sql`UPDATE Users SET full_name = ${fullName}, password = ${hashedPassword}, user_signed_time = CURRENT_TIMESTAMP WHERE email = ${email};`;
         return { exist: false, id: user.uuid };
      }
   } else {
      // No email match - add new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const { rows: newUserRows } =
         await sql`INSERT INTO Users (email, password, full_name) VALUES (${email}, ${hashedPassword}, ${fullName}) RETURNING uuid;`;
      return { exist: false, id: newUserRows[0].uuid };
   }
}

const requestOtp = async (email: string) => {
   return true;
};
