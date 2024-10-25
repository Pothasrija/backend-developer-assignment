import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import csv from "csv-parser";
import ExcelJS from "exceljs";

export async function POST(request: NextRequest) {
   const data = await request.formData();
   const file: File | null = data.get("file") as unknown as File;

   if (!file) {
      return NextResponse.json(
         { success: false, error: "No file uploaded." },
         { status: 400 }
      );
   }

   const buffer = Buffer.from(await file.arrayBuffer());
   let contacts = [];

   try {
      if (file.name.endsWith(".csv")) {
         contacts = await parseCSV(buffer);
      } else if (file.name.endsWith(".xlsx")) {
         contacts = await parseExcel(buffer);
      } else {
         return NextResponse.json(
            { success: false, error: "Unsupported file format." },
            { status: 400 }
         );
      }

      // Validate and insert data
      const validationErrors = validateContacts(contacts);
      if (validationErrors.length) {
         return NextResponse.json(
            { success: false, errors: validationErrors },
            { status: 400 }
         );
      }

      await insertContacts(contacts);

      return NextResponse.json(
         { success: true, message: "Contacts added successfully." },
         { status: 200 }
      );
   } catch (error) {
      console.error("Error processing file:", error);
      return NextResponse.json(
         { success: false, error: "Failed to process file." },
         { status: 500 }
      );
   }
}

async function parseCSV(buffer: Buffer): Promise<any[]> {
   return new Promise((resolve, reject) => {
      const contacts: any[] = [];
      const stream = csv();

      stream.on("data", (data) => contacts.push(data));
      stream.on("end", () => resolve(contacts));
      stream.on("error", (error) => reject(error));

      stream.write(buffer.toString("utf-8"));
      stream.end();
   });
}

async function parseExcel(buffer: Buffer): Promise<any[]> {
   const workbook = new ExcelJS.Workbook();
   await workbook.xlsx.load(buffer);
   const worksheet = workbook.worksheets[0];
   const contacts: any[] = [];

   worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const contact = {
         name: row.getCell(1).value?.toString() || "", // Ensure value is a string
         email: row.getCell(2).value?.toString() || "",
         timezone: row.getCell(3).value?.toString() || "",
         address: row.getCell(4).value?.toString() || "",
         phone: row.getCell(5).value?.toString() || "",
      };

      contacts.push(contact);
   });

   return contacts;
}
interface Contact {
   name: string;
   email: string;
   timezone: string;
   address?: string;
   phone?: string;
}

function validateContacts(contacts: Contact[]): string[] {
   const errors: string[] = [];
   const emailSet = new Set<string>();

   contacts.forEach((contact, index) => {
      if (!contact.name) errors.push(`Row ${index + 2}: Name is required.`);
      if (!contact.email) errors.push(`Row ${index + 2}: Email is required.`);
      if (!contact.timezone)
         errors.push(`Row ${index + 2}: Timezone is required.`);
      if (emailSet.has(contact.email))
         errors.push(`Row ${index + 2}: Duplicate email.`);
      emailSet.add(contact.email);
   });

   return errors;
}

async function insertContacts(contacts: any[]) {
   const query = `INSERT INTO Contact (name, email, timezone, address, phone) VALUES `;
   const values = contacts
      .map(
         (contact, index) =>
            `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${
               index * 5 + 4
            }, $${index * 5 + 5})`
      )
      .join(", ");

   const params = contacts.flatMap((contact) => [
      contact.name,
      contact.email,
      contact.timezone,
      contact.address,
      contact.phone,
   ]);

   await sql.query(query + values, params);
}

// import { mkdir, writeFile } from "fs/promises";
// import { NextRequest, NextResponse } from "next/server";
// import { join } from "path";
//
// export async function POST(request: NextRequest) {
//    const data = await request.formData();
//    const file: File | null = data.get("file") as unknown as File;
//    if (!file) {
//       return NextResponse.json({ success: false });
//    }
//
//    const bytes = await file.arrayBuffer();
//    const buffer = Buffer.from(bytes);
//
//    // Ensure the directory exists
//    const directory = join(process.cwd(), "public", "uploads"); // Change 'uploads' to your desired folder name
//    await mkdir(directory, { recursive: true });
//
//    // Path to the new file
//    const path = join(directory, file.name);
//    await writeFile(path, buffer);
//
//    console.log(`open ${path} to see the uploaded file`);
//    return NextResponse.json({ success: true });
// }
