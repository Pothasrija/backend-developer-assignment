import { sql } from "@vercel/postgres";

interface Filter {
   name?: string;
   email?: string;
   timezone?: string;
}

interface Sort {
   field: string | undefined;
   order: string | undefined;
}
export async function GET(request: Request) {
   const url = new URL(request.url);
   const params = new URLSearchParams(url.search);

   const filter = {
      name: params.get("name") || undefined,
      email: params.get("email") || undefined,
      timezone: params.get("timezone") || undefined,
   };

   const sort = {
      field: params.get("field") || undefined,
      order: params.get("order") || undefined,
   };

   const data = await getContacts(filter, sort);

   return Response.json({ data });
}
export async function POST(request: Request) {
   return Response.json({ data: "DATA" });
}
export async function DELETE(request: Request) {
   return Response.json({ data: "DATA" });
}
async function getContacts(filter: Filter, sort: Sort): Promise<undefined> {
   // Build the SQL query
   let query = `SELECT * FROM Contact WHERE deleted = false`;
   const params: string[] = [];

   // Apply filters
   if (filter.name) {
      query += ` AND name ILIKE ${"$" + (params.length + 1)}`;
      params.push(`%${filter.name}%`);
   }
   if (filter.email) {
      query += ` AND email ILIKE ${"$" + (params.length + 1)}`;
      params.push(`%${filter.email}%`);
   }
   if (filter.timezone) {
      query += ` AND timezone = ${"$" + (params.length + 1)}`;
      params.push(filter.timezone);
   }

   // Apply sorting
   if (sort.field) {
      query += ` ORDER BY ${sort.field}`;
      if (
         sort.order &&
         (sort.order.toLowerCase() === "asc" ||
            sort.order.toLowerCase() === "desc")
      ) {
         query += ` ${sort.order.toUpperCase()}`;
      }
   }

   console.log(query);
   console.log(params);
   // Fetch contacts from the database
   //    const { rows } = await sql`${query}`;
   //    return rows;
}
