import { Gemunu_Libre, Hanken_Grotesk, Yaldevi } from "next/font/google";

/** Display: Sri Lankan condensed face with matching Sinhala and Latin. */
export const gemunu = Gemunu_Libre({
  subsets: ["latin", "sinhala"],
  variable: "--font-gemunu",
  display: "swap",
});

/** Latin text and figures. */
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

/** Sinhala text. */
export const yaldevi = Yaldevi({
  subsets: ["sinhala"],
  variable: "--font-yaldevi",
  display: "swap",
});

export const fontVariables = `${gemunu.variable} ${hanken.variable} ${yaldevi.variable}`;
