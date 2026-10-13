import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getAllEntries } from "@/lib/db";
import { normalizeCategory } from "@/lib/types";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const entries = getAllEntries();
    const zip = new JSZip();

    // Mapeamento de categorias para pastas canônicas do Obsidian
    const categoryFolders: Record<string, string> = {
      "Diário": "Diário",
      "Prática": "Práticas & Rituais",
      "Oráculo": "Consultas Oraculares",
      "Sonho": "Diário de Sonhos",
      "Visão Astral": "Visões Astrais",
      "Estudo": "Estudos & Correspondências",
    };

    // 1. Adicionar cada nota com Frontmatter YAML e formatação Obsidian
    for (const entry of entries) {
      const category = normalizeCategory(entry.type);
      const folderName = categoryFolders[category] || "Outros";

      const sanitizedTitle = entry.title
        .replace(/[/\\?%*:|"<>]/g, "_")
        .trim()
        .slice(0, 60);
      const fileName = `${entry.date.slice(0, 10)} - ${sanitizedTitle || "Nota"}.md`;

      const frontmatterLines = [
        "---",
        `title: "${entry.title.replace(/"/g, '\\"')}"`,
        `category: "${category}"`,
        `date: "${entry.date}"`,
        entry.thelemic_date ? `thelemic_date: "${entry.thelemic_date.replace(/"/g, '\\"')}"` : null,
        entry.success_rating !== undefined ? `success_rating: ${entry.success_rating}` : null,
        entry.sun_sign ? `sun_sign: "${entry.sun_sign}"` : null,
        entry.moon_sign ? `moon_sign: "${entry.moon_sign}"` : null,
        entry.moon_phase ? `moon_phase: "${entry.moon_phase}"` : null,
        entry.planetary_day ? `planetary_day: "${entry.planetary_day}"` : null,
        entry.planetary_hour ? `planetary_hour: "${entry.planetary_hour}"` : null,
        entry.influences && entry.influences.length > 0
          ? `influences:\n${entry.influences.map((inf) => `  - category: "${inf.category}"\n    name: "${inf.name}"`).join("\n")}`
          : null,
        "---",
        "",
        `# ${entry.title}`,
        "",
        entry.thelemic_date ? `> ☉ ${entry.thelemic_date}\n` : null,
        entry.content,
      ]
        .filter(Boolean)
        .join("\n");

      zip.folder(folderName)?.file(fileName, frontmatterLines);
    }

    // 2. Adicionar arquivos de mídia da pasta public/uploads (se existirem)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (fs.existsSync(uploadsDir)) {
      const files = await fs.promises.readdir(uploadsDir);
      const anexosFolder = zip.folder("anexos");
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stat = await fs.promises.stat(filePath);
        if (stat.isFile() && stat.size < 50 * 1024 * 1024) { // inclui arquivos até 50MB
          const fileData = await fs.promises.readFile(filePath);
          anexosFolder?.file(file, fileData);
        }
      }
    }

    // 3. Adicionar README com metadados do Vault Thelêmico
    const readmeContent = [
      "# Sanctum Thelêmico — Vault Obsidian",
      "",
      `Backup completo gerado em: ${new Date().toLocaleString("pt-BR")}`,
      `Total de registros: ${entries.length}`,
      "",
      "## Como utilizar:",
      "1. Extraia o conteúdo deste arquivo ZIP em uma pasta do seu computador.",
      "2. Abra o aplicativo Obsidian e escolha **'Open folder as vault'** selecionando a pasta extraída.",
      "3. Todas as notas, tags, metadados astronômicos e links entre operações estarão ativos nativamente.",
      "",
      "Amor é a lei, amor sob vontade.",
    ].join("\n");
    zip.file("README.md", readmeContent);

    // Gerar o arquivo ZIP em Uint8Array (compatível com BodyInit)
    const zipBytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });

    const nowStr = new Date().toISOString().slice(0, 10);
    return new NextResponse(zipBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="diario_magicko_vault_${nowStr}.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Erro ao gerar exportação do Vault:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno ao gerar backup" },
      { status: 500 }
    );
  }
}
