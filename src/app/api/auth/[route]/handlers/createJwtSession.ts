import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET!;

export default function createJwtSession(uuid: string, time: string): string {
   const token = jwt.sign({ uuid }, secretKey, { expiresIn: time });
   return token;
}
