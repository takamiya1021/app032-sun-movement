import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "太陽の動き表示",
  description: "世界各地の太陽の動きを確認できるアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
