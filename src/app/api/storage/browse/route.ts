import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function GET(req: NextRequest) {
  try {
    const dirParam = req.nextUrl.searchParams.get("dir");
    const homeDir = os.homedir();
    const projectDataDir = path.join(process.cwd(), "data");

    const quickLocations = [
      { label: "Pasta Padrão do Diário (data)", path: projectDataDir },
      { label: "Documentos", path: path.join(homeDir, "Documents") },
      { label: "Área de Trabalho (Desktop)", path: path.join(homeDir, "Desktop") },
      { label: "Pasta do Usuário", path: homeDir },
    ].filter((loc) => {
      try {
        return fs.existsSync(loc.path) || loc.path === projectDataDir;
      } catch {
        return false;
      }
    });

    const targetDir = dirParam && dirParam.trim() ? path.resolve(dirParam.trim()) : homeDir;

    if (!fs.existsSync(targetDir)) {
      return NextResponse.json({
        success: true,
        currentDir: targetDir,
        exists: false,
        parentDir: path.dirname(targetDir),
        directories: [],
        dbFiles: [],
        quickLocations,
      });
    }

    const stat = fs.statSync(targetDir);
    const actualDir = stat.isDirectory() ? targetDir : path.dirname(targetDir);
    const parentDir = path.dirname(actualDir);

    const entries = fs.readdirSync(actualDir, { withFileTypes: true });
    const directories: { name: string; path: string }[] = [];
    const dbFiles: { name: string; path: string; sizeBytes: number; mtime: string }[] = [];

    for (const entry of entries) {
      if (entry.name.startsWith("$") || entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") {
        continue;
      }
      const fullPath = path.join(actualDir, entry.name);
      try {
        if (entry.isDirectory()) {
          directories.push({ name: entry.name, path: fullPath });
        } else if (entry.isFile() && /\.(db|sqlite|sqlite3)$/i.test(entry.name)) {
          const st = fs.statSync(fullPath);
          dbFiles.push({
            name: entry.name,
            path: fullPath,
            sizeBytes: st.size,
            mtime: st.mtime.toISOString(),
          });
        }
      } catch {
        // Ignora pastas sem permissão do sistema operacional
      }
    }

    directories.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    dbFiles.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    return NextResponse.json({
      success: true,
      currentDir: actualDir,
      exists: true,
      parentDir: parentDir !== actualDir ? parentDir : null,
      directories,
      dbFiles,
      quickLocations,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Falha ao listar diretório" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, parentDir, folderName } = body;

    if (mode === "mkdir") {
      if (!parentDir || !folderName) {
        return NextResponse.json(
          { success: false, error: "Informe o diretório pai e o nome da nova pasta." },
          { status: 400 }
        );
      }
      const cleanName = folderName.trim().replace(/[<>:"/\\|?*]/g, "_");
      const newFolderPath = path.join(path.resolve(parentDir), cleanName);
      if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath, { recursive: true });
      }
      return NextResponse.json({
        success: true,
        createdPath: newFolderPath,
      });
    }

    if (process.platform === "win32" && (mode === "native_folder" || mode === "native_file")) {
      const psScript =
        mode === "native_file"
          ? `
Add-Type -AssemblyName System.Windows.Forms
$f = New-Object System.Windows.Forms.OpenFileDialog
$f.Title = 'Selecione o Banco de Dados (.db) do Diário Mágicko Thelêmico'
$f.Filter = 'Banco de Dados SQLite (*.db;*.sqlite)|*.db;*.sqlite|Todos os arquivos (*.*)|*.*'
$form = New-Object System.Windows.Forms.Form
$form.TopMost = $true
if ($f.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {
  Write-Output $f.FileName
}
`
          : `
Add-Type -AssemblyName System.Windows.Forms
$d = New-Object System.Windows.Forms.FolderBrowserDialog
$d.Description = 'Escolha a pasta onde ficarão salvas as notas do Diário Mágicko Thelêmico'
$d.ShowNewFolderButton = $true
$form = New-Object System.Windows.Forms.Form
$form.TopMost = $true
if ($d.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {
  Write-Output $d.SelectedPath
}
`;

      const { stdout } = await execFileAsync(
        "powershell.exe",
        ["-NoProfile", "-STA", "-Command", psScript],
        { timeout: 120000 }
      );
      const selected = (stdout || "").trim();
      if (!selected) {
        return NextResponse.json({ success: false, cancelled: true });
      }
      return NextResponse.json({
        success: true,
        selectedPath: selected,
      });
    }

    return NextResponse.json(
      { success: false, error: "Modo de seleção não suportado neste ambiente." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Falha ao abrir seletor nativo" },
      { status: 500 }
    );
  }
}
