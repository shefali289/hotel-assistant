// Root layout: document language, global styles (system font stack) and page metadata (U1-U6 shell).
import type { Metadata } from "next";
import "./globals.css";

/** Page title and description shown in the browser tab and search results. */
export const metadata: Metadata = {
  title: "Hotel Assistant",
  description: "Ask for a hotel, review the assistant's recommendations and choose one.",
};

/**
 * Wraps every route in the html and body elements.
 * @param props - The route's rendered children.
 * @returns The document shell.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
