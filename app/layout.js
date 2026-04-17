import "./globals.css";

export const metadata = {
  title: "binge-d",
  description: "Neon social portal for discovering movies, series, docs, standups, and podcasts with your friends."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
