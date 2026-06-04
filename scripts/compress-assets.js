const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const DIRECTORY = path.join(process.cwd(), 'public', 'models', 'update');

async function compressDirectory() {
  console.log('Starting compression in:', DIRECTORY);
  
  try {
    const files = await fs.readdir(DIRECTORY);
    let totalSaved = 0;
    
    for (const file of files) {
      if (!file.match(/\.(png|jpg|jpeg)$/i)) continue;
      
      const inputPath = path.join(DIRECTORY, file);
      const parsedPath = path.parse(inputPath);
      const outputPath = path.join(DIRECTORY, `${parsedPath.name}.webp`);
      
      console.log(`Processing: ${file}`);
      
      const statBefore = await fs.stat(inputPath);
      
      await sharp(inputPath)
        .webp({ quality: 80, effort: 6 })
        .resize({ width: 2560, withoutEnlargement: true })
        .toFile(outputPath);
        
      const statAfter = await fs.stat(outputPath);
      const savedBytes = statBefore.size - statAfter.size;
      totalSaved += savedBytes;
      
      console.log(` -> Compressed to WebP. Saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
      
      // Delete original
      await fs.unlink(inputPath);
    }
    
    console.log(`\n Compression complete! Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error('Error during compression:', error);
  }
}

compressDirectory();
