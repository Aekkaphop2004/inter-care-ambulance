/**
 * Utility to compress images in the browser using HTML5 Canvas.
 * This reduces image file size from several MBs to ~50-150KB,
 * preventing slow database operations and ensuring lightning-fast page load times.
 */
export function compressImage(file: File, maxWidth = 1000, quality = 0.75): Promise<{ dataUrl: string; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize proportionally if exceeds maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw image onto canvas (this compresses it automatically)
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export to JPEG with specified quality
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Calculate compressed size in bytes from base64 string
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const padding = (dataUrl.charAt(dataUrl.length - 2) === '=') ? 2 : ((dataUrl.charAt(dataUrl.length - 1) === '=') ? 1 : 0);
        const compressedSize = (base64Length * 0.75) - padding;

        resolve({
          dataUrl,
          originalSize,
          compressedSize
        });
      };
      
      img.onerror = (err) => reject(new Error('Failed to load image element'));
    };
    
    reader.onerror = (err) => reject(new Error('Failed to read file'));
  });
}

/**
 * Format bytes to human readable string (e.g. KB, MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
