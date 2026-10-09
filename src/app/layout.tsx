import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diário Mágicko Thelêmico — O Método da Ciência, o Alvo da Religião",
  description: "Registro científico e hermético de rituais, oráculos de Thoth, visões astrais e sonhos lúcidos com banco de dados próprio, grafo de conexões e inteligência analítica.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" data-theme="medium" data-mode="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('magick_theme') || 'medium';
                  var m = localStorage.getItem('magick_mode') || 'dark';
                  document.documentElement.setAttribute('data-theme', t);
                  document.documentElement.setAttribute('data-mode', m);
                  if (m === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-medium-900 text-medium-100 antialiased min-h-screen selection:bg-white/20 selection:text-white flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
