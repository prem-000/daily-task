const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Input and Output configuration paths
const sourceIcon = path.join(__dirname, 'public', 'icon-512.png');
const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Android mipmap launcher icon sizes
const iconSizes = [
  { name: 'mipmap-mdpi', size: 48 },
  { name: 'mipmap-hdpi', size: 72 },
  { name: 'mipmap-xhdpi', size: 96 },
  { name: 'mipmap-xxhdpi', size: 144 },
  { name: 'mipmap-xxxhdpi', size: 192 }
];

async function generateAssets() {
  try {
    // 1. Verify that the source icon exists
    if (!fs.existsSync(sourceIcon)) {
      console.error(`Error: Source icon not found at "${sourceIcon}"`);
      process.exit(1);
    }
    console.log(`Source icon found at: "${sourceIcon}"`);

    // 2. Generate regular and circular launcher icons for all Android densities
    for (const { name, size } of iconSizes) {
      const folderPath = path.join(resDir, name);
      
      // Ensure target density directory exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Created directory: ${name}`);
      }

      const regularOut = path.join(folderPath, 'ic_launcher.png');
      const roundOut = path.join(folderPath, 'ic_launcher_round.png');

      // Generate regular ic_launcher.png (standard resize)
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(regularOut);
      console.log(`Generated regular icon: ${name}/ic_launcher.png (${size}x${size})`);

      // Generate circular ic_launcher_round.png
      // Create SVG circle mask to crop the icon circularly
      const radius = size / 2;
      const circleSvg = Buffer.from(
        `<svg width="${size}" height="${size}">
          <circle cx="${radius}" cy="${radius}" r="${radius}" fill="black"/>
        </svg>`
      );

      await sharp(sourceIcon)
        .resize(size, size)
        .composite([{
          input: circleSvg,
          blend: 'dest-in'
        }])
        .toFile(roundOut);
      console.log(`Generated circular icon: ${name}/ic_launcher_round.png (${size}x${size})`);
    }

    // 3. Generate Android splash screen
    const drawableDir = path.join(resDir, 'drawable');
    
    // Ensure drawable directory exists
    if (!fs.existsSync(drawableDir)) {
      fs.mkdirSync(drawableDir, { recursive: true });
      console.log('Created drawable directory');
    }
    
    const splashOut = path.join(drawableDir, 'splash.png');
    console.log('\nGenerating high-quality splash screen...');

    // Resize source icon to 512x512 and apply teal color (#00d4aa) tint
    const splashIconResized = await sharp(sourceIcon)
      .resize(512, 512)
      .tint({ r: 0, g: 212, b: 170 }) // Teal color: rgb(0, 212, 170)
      .toBuffer();

    // Create 2048x2048 background with dark theme color #0a0f1e (rgb(10, 15, 30))
    // Composite the centered StudyFlow logo/icon
    await sharp({
      create: {
        width: 2048,
        height: 2048,
        channels: 4,
        background: { r: 10, g: 15, b: 30, alpha: 1 }
      }
    })
      .composite([{
        input: splashIconResized,
        gravity: 'center'
      }])
      .toFile(splashOut);

    console.log(`Generated splash screen: drawable/splash.png (2048x2048)`);
    console.log('\nAsset generation completed successfully! All assets are in place.');
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

generateAssets();
