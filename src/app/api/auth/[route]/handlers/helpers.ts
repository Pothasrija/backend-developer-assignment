import { sql } from "@vercel/postgres";
import bcrypt from "bcrypt";

export async function addUser(
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

         console.log;
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

export const requestOtp = async (email: string) => {
   return true;
};
