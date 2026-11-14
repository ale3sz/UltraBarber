/**
 * Compresor automático de imágenes en el cliente (Browser Canvas Pipeline)
 * Transforma fotos pesadas de celulares (5-15 MB) en WebP ultraligeros (<90 KB)
 * antes de enviarlas al servidor.
 */

export async function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('El archivo seleccionado no es una imagen válida.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al procesar la imagen en el navegador.'));

      img.onload = () => {
        try {
          let { width, height } = img;

          // Redimensionamiento proporcional si excede los límites máximos para retina display
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(e.target.result); // Fallback a imagen original si no hay canvas
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Intentar exportar a WebP de última generación
          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            // Fallback a JPEG optimizado si el navegador no soporta exportación WebP
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          // Cálculo informativo de ahorro
          const origSizeKb = Math.round(file.size / 1024);
          const newSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

          resolve({
            dataUrl,
            width,
            height,
            origSizeKb,
            newSizeKb,
            format: dataUrl.startsWith('data:image/webp') ? 'webp' : 'jpeg'
          });
        } catch (err) {
          console.warn('Fallo en compresión de canvas, usando fallback:', err);
          resolve({
            dataUrl: e.target.result,
            width: img.width,
            height: img.height,
            origSizeKb: Math.round(file.size / 1024),
            newSizeKb: Math.round(file.size / 1024),
            format: file.type.split('/')[1] || 'jpeg'
          });
        }
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}
