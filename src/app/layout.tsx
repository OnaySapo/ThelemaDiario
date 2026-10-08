import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diário Mágicko Thelêmico — O Método da Ciência, o Alvo da Religião",
  description: "Registro científico e hermético de rituais, oráculos de Thoth, visões astrais e sonhos lúcidos com banco de dados próprio, grafo de conexões e inteligência analítica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-forest-900 text-parchment-200 antialiased min-h-screen selection:bg-moss-500/30 selection:text-parchment-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
