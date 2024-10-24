"use client";

import { newUser } from "../actions/newUser";
import { verifyUser } from "../actions/verifyUser";

export default function Home() {
   return (
      //       <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      //          <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      //             <Image
      //                className="dark:invert"
      //                src="https://nextjs.org/icons/next.svg"
      //                alt="Next.js logo"
      //                width={180}
      //                height={38}
      //                priority
      //             />
      //             <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
      //                <li className="mb-2">
      //                   Get started by editing{" "}
      //                   <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
      //                      src/app/page.tsx
      //                   </code>
      //                   .
      //                </li>
      //                <li>Save and see your changes instantly.</li>
      //             </ol>
      //
      //             <div className="flex gap-4 items-center flex-col sm:flex-row">
      //                <a
      //                   className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      //                   href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
      //                   target="_blank"
      //                   rel="noopener noreferrer"
      //                >
      //                   <Image
      //                      className="dark:invert"
      //                      src="https://nextjs.org/icons/vercel.svg"
      //                      alt="Vercel logomark"
      //                      width={20}
      //                      height={20}
      //                   />
      //                   Deploy now
      //                </a>
      //                <a
      //                   className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
      //                   href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
      //                   target="_blank"
      //                   rel="noopener noreferrer"
      //                >
      //                   Read our docs
      //                </a>
      //             </div>
      //          </main>
      //          <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      //             <a
      //                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      //                href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
      //                target="_blank"
      //                rel="noopener noreferrer"
      //             >
      //                <Image
      //                   aria-hidden
      //                   src="https://nextjs.org/icons/file.svg"
      //                   alt="File icon"
      //                   width={16}
      //                   height={16}
      //                />
      //                Learn
      //             </a>
      //             <a
      //                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      //                href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
      //                target="_blank"
      //                rel="noopener noreferrer"
      //             >
      //                <Image
      //                   aria-hidden
      //                   src="https://nextjs.org/icons/window.svg"
      //                   alt="Window icon"
      //                   width={16}
      //                   height={16}
      //                />
      //                Examples
      //             </a>
      //             <a
      //                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      //                href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
      //                target="_blank"
      //                rel="noopener noreferrer"
      //             >
      //                <Image
      //                   aria-hidden
      //                   src="https://nextjs.org/icons/globe.svg"
      //                   alt="Globe icon"
      //                   width={16}
      //                   height={16}
      //                />
      //                Go to nextjs.org →
      //             </a>
      //          </footer>
      //       </div>
      <>
         <form
            // action={newUser}
            // action={verifyUser}
            className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md space-y-6"
         >
            <div>
               <label
                  htmlFor="fullname"
                  className="block text-gray-700 text-sm font-bold mb-2"
               >
                  Full Name:
               </label>
               <input
                  type="text"
                  name="fullname"
                  id="fullname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
               />
            </div>
            <div>
               <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
               >
                  Email:
               </label>
               <input
                  type="email"
                  name="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
               />
            </div>
            <div>
               <label
                  htmlFor="password"
                  className="block text-gray-700 text-sm font-bold mb-2"
               >
                  Password:
               </label>
               <input
                  type="text"
                  name="password"
                  id="password"
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
               />
            </div>
            <button
               type="submit"
               className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
               Click
            </button>
         </form>
      </>
   );
}
