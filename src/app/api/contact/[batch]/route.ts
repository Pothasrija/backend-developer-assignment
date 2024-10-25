import { sql } from "@vercel/postgres";
export async function POST(
   request: Request,
   { params }: { params: Promise<{ batch: string }> }
) {
   const batch = (await params)?.batch;
   const data = await request.json();
   if (!Array.isArray(data)) {
      return new Response(
         JSON.stringify({
            error: "Invalid input data. Expected an array.",
         }),
         { status: 400 }
      );
   }
   switch (batch) {
      case "add": {
         try {
            const query = `INSERT INTO Contact (name, email, timezone, address, phone) VALUES `;
            const values = data
               .map(
                  (contact, index) =>
                     `($${index * 5 + 1}, $${index * 5 + 2}, $${
                        index * 5 + 3
                     }, $${index * 5 + 4}, $${index * 5 + 5})`
               )
               .join(", ");

            const params = data.flatMap((contact) => [
               contact.name,
               contact.email,
               contact.timezone,
               contact.address,
               contact.phone,
            ]);

            await sql.query(query + values, params);

            return new Response(
               JSON.stringify({ message: "Contacts added successfully." }),
               { status: 200 }
            );
         } catch (error) {
            console.error("Error adding contacts:", error);
            return new Response(
               JSON.stringify({ error: "Failed to add contacts." }),
               { status: 500 }
            );
         }
      }
      case "update": {
         try {
            for (const contact of data) {
               if (!contact.id) {
                  return new Response(
                     JSON.stringify({
                        error: "ID is required for updating contacts.",
                     }),
                     { status: 400 }
                  );
               }

               let query;
               const params = [];

               if (contact.id) {
                  // Update existing contact
                  const fields = [];
                  if (contact.name) {
                     fields.push(`name = $${params.length + 1}`);
                     params.push(contact.name);
                  }
                  if (contact.email) {
                     fields.push(`email = $${params.length + 1}`);
                     params.push(contact.email);
                  }
                  if (contact.timezone) {
                     fields.push(`timezone = $${params.length + 1}`);
                     params.push(contact.timezone);
                  }
                  if (contact.address) {
                     fields.push(`address = $${params.length + 1}`);
                     params.push(contact.address);
                  }
                  if (contact.phone) {
                     fields.push(`phone = $${params.length + 1}`);
                     params.push(contact.phone);
                  }

                  if (fields.length > 0) {
                     query = `UPDATE Contact SET ${fields.join(
                        ", "
                     )} WHERE id = $${params.length + 1}`;
                     params.push(contact.id);
                  }
               }

               if (!query) {
                  return new Response(
                     JSON.stringify({
                        error: "No valid fields provided for update.",
                     }),
                     { status: 400 }
                  );
               }

               await sql.query(query, params);
            }

            return new Response(
               JSON.stringify({ message: "Contacts updated successfully." }),
               { status: 200 }
            );
         } catch (error) {
            console.error("Error updating contacts:", error);
            return new Response(
               JSON.stringify({ error: "Failed to update contacts." }),
               { status: 500 }
            );
         }
      }
   }
}
