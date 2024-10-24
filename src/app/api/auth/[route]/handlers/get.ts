import { NextResponse } from "next/server";

export const getHandler = async (request: Request) => {
   // Your GET logic here
   const data = { message: "GET request successful" };
   return NextResponse.json(data, { status: 200 });
};
