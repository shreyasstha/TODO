import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo App",
  description: "A full-stack todo application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
            },
            success: { iconTheme: { primary: "#16a34a", secondary: "#ffffff" } },
            error: { iconTheme: { primary: "#dc2626", secondary: "#ffffff" } },
          }}
        />
      </body>
    </html>
  );
}
