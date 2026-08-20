import "./globals.css";
import type { Metadata } from "next";
import ProductGuide from "@/components/ProductGuide";

export const metadata: Metadata = {
  title: "Signal-to-Campaign Studio",
  description: "Project NEXT AI-native marketing operating model",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        
        {children}
        <ProductGuide />
      </body>
    </html>
  );
}
