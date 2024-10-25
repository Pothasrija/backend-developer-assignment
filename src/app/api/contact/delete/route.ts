import { sql } from "@vercel/postgres";

export async function DELETE(request: Request) {
   const data = await request.json();

   if (!Array.isArray(data) || !data.every((id) => typeof id === "number")) {
      return new Response(
         JSON.stringify({
            error: "Invalid input data. Expected an array of IDs.",
         }),
         { status: 400 }
      );
   }

   try {
      const query = `UPDATE Contact SET deleted = true WHERE id = ANY($1::int[])`;
      await sql.query(query, [data]);

      return new Response(
         JSON.stringify({ message: "Contacts soft deleted successfully." }),
         { status: 200 }
      );
   } catch (error) {
      console.error("Error deleting contacts:", error);
      return new Response(
         JSON.stringify({ error: "Failed to delete contacts." }),
         { status: 500 }
      );
   }
}
