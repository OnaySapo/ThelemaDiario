/**
 * Utilitário de Otimização e Compressão Inteligente de Imagens no Navegador
 * Reduz drasticamente o peso de fotos, ilustrações e sigilos sem perda perceptível de qualidade,
 * convertendo para WebP de alta eficiência antes do upload.
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // Porcentagem de economia (ex: 78%)
  format: string;
}

export async function compressImageFile(
  file: File,
  maxDimension = 1920,
  quality = 0.82
): Promise<CompressionResult> {
  const originalSize = file.size;

  // Ignorar vetores (SVG) e GIFs animados para preservar animação e nitidez vetorial
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      format: file.type,
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionar proporcionalmente se exceder dimensão máxima (Full HD / 1920px)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          return resolve({
            file,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 0,
            format: file.type,
          });
        }

        // Suavização bilinear de alta qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como WebP de alta fidelidade
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= originalSize) {
              // Se a compressão não reduzir o arquivo (ex: imagem já ultracompactada), mantém original
              return resolve({
                file,
                originalSize,
                compressedSize: originalSize,
                compressionRatio: 0,
                format: file.type,
              });
            }

            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const optimizedFile = new File([blob], `${baseName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            const ratio = Math.round(((originalSize - optimizedFile.size) / originalSize) * 100);

            resolve({
              file: optimizedFile,
              originalSize,
              compressedSize: optimizedFile.size,
              compressionRatio: Math.max(0, ratio),
              format: "image/webp",
            });
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => {
        resolve({
          file,
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 0,
          format: file.type,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 0,
        format: file.type,
      });
    };

    reader.readAsDataURL(file);
  });
}
