import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Junction — Find your next role",
    template: "%s · Junction",
  },
  description:
    "Junction is a simple job platform. Browse roles, apply in minutes, and track every application from first look to offer.",
};

const THEME_SCRIPT = `(function () {
  try {
    var saved = localStorage.getItem("theme");
    var theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();`;

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: the inline theme script sets data-theme on
    // <html> before React hydrates, so React must not diff that attribute
    // (browser extensions can add attributes here too — e.g. cz-shortcut-listen)
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/* Set data-theme before paint so there's no flash of the wrong mode */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
