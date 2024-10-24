export function generateRandomString(length: number, str = true): string {
   const chars = str ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "0123456789";

   const randomString = Array.from(
      {
         length,
      },
      () => {
         const randomIndex = Math.floor(Math.random() * chars.length);
         return chars.charAt(randomIndex);
      }
   ).join("");

   return randomString;
}
