import "./globals.css";

export const metadata = {
  title: "TRAVIS PROMPT AI — Business Assistant",
  description: "Self-service multi-business AI chatbot platform (MVP demo).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
