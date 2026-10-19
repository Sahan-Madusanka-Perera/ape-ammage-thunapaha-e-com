import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "../globals.css";
import { fontVariables } from "../fonts";

export const metadata: Metadata = {
  title: { default: "Admin · Ape Ammage Thunapaha", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#1c130e" };

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="si" className={fontVariables}>
      <body className="min-h-dvh bg-plaster antialiased">
        <Suspense
          fallback={
            <div className="grid min-h-dvh place-items-center">
              <span className="size-10 animate-spin rounded-full border-4 border-ink/15 border-t-vermilion" />
            </div>
          }
        >
          {children}
        </Suspense>
      </body>
    </html>
  );
}
