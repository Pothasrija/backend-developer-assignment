"use server";

import * as Joi from "joi";
import bcrypt from "bcrypt";

interface Props {
   session: string;
   code: string;
   time: string;
   id: string;
}

export async function verifyUser(props: Props) {
   // session can also stored in cookies which is a good way to store session id
   const schema = Joi.object({
      session: Joi.string().required(),
      code: Joi.string().min(6).required(),
      time: Joi.string().required(),
      id: Joi.string().required(),
   });

   const { error, value } = schema.validate(props);

   if (error) {
      console.log(error);
   }

   // Check if time is expired (10 minutes = 600000 ms)
   const currentTime = Date.now();
   if (currentTime - value.time > 600000) {
      console.log("OTP expired");
      return;
   }

   // Verify session
   const sessionIdString = `${value.code}_${value.id}_${value.time}`;
   const isValidSession = await bcrypt.compare(sessionIdString, value.session);

   if (!isValidSession) {
      return {
         type: "error",
         message: "otp.invalid",
         data: null,
      };
   }

   // create new user jwt session and set it as cookie
}
