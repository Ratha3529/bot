import "./globals.css";

export const metadata = {
  title: "Telegram Bot ",
  description: "Monitor and manage Telegram bot problems",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-800">
        {children}
      </body>
    </html>
  );
}
