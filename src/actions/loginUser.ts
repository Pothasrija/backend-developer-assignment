"use server";
import * as Joi from "joi";
import { sql } from "@vercel/postgres";
import createJwtSession from "../app/api/auth/[route]/handlers/createJwtSession";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

export async function loginUser(formData: FormData) {
   const schema = Joi.object({
      email: Joi.string()
         .email({ tlds: { allow: false } })
         .required(),
      password: Joi.string().min(6).required(),
   });

   const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
   };

   const { error, value } = schema.validate(data);
   if (error) {
      console.log(error);
      return { type: "error", message: "Invalid input" };
   }

   const { rows } =
      await sql`SELECT email, email_verified, uuid, password FROM Users WHERE email = ${value.email} LIMIT 1;`;

   if (rows.length === 0 || !rows[0].email_verified) {
      return {
         type: "error",
         message: "Email not verified or does not exist",
      };
   }

   const user = rows[0];
   const passwordMatch = await bcrypt.compare(data.password, user.password);

   if (!passwordMatch) {
      return { type: "error", message: "Invalid password" };
   }

   const session = createJwtSession(user.uuid, "7m");
   const refreshSession = createJwtSession(user.uuid, "30d");

   const isProduction = process.env.NODE_ENV === "production";
   cookies().set("session", session, {
      httpOnly: isProduction,
      sameSite: "strict",
      secure: isProduction,
   });
   cookies().set("refreshSession", refreshSession, {
      httpOnly: isProduction,
      sameSite: "strict",
      secure: isProduction,
   });
}
