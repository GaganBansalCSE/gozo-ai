import "./globals.css";

export const metadata = {
  title: "GOZO AI Dashboard",
  description: "Personal AI-powered job hunting dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
