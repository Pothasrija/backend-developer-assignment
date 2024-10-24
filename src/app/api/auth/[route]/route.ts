import { getHandler } from "./handlers/get";
import { postHandler } from "./handlers/post";
export async function GET(request: Request) {
   return getHandler(request);
}
export async function POST(
   request: Request,
   { params }: { params: Promise<{ route: string }> }
) {
   return postHandler(request, { params });
}
