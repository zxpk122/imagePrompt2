import { i18n } from "~/config/i18n-config";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Root layout should not redirect - let middleware handle routing
  // This layout is only for providing html/body structure
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
