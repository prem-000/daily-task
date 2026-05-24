const sharp = require('sharp');

async function run() {
  console.log('Resizing icon-192.png to 192×192...');
  await sharp('public/icon-192.png')
    .resize(192, 192, { fit: 'cover' })
    .toFile('public/icon-192-new.png');
  console.log('✓ icon-192-new.png');

  console.log('Resizing icon-512.png to 512×512...');
  await sharp('public/icon-512.png')
    .resize(512, 512, { fit: 'cover' })
    .toFile('public/icon-512-new.png');
  console.log('✓ icon-512-new.png');

  console.log('Creating maskable icon (safe-zone padded)...');
  await sharp('public/icon-512.png')
    .resize(409, 409, { fit: 'cover' })
    .extend({
      top: 51, bottom: 52, left: 51, right: 52,
      background: { r: 15, g: 17, b: 23, alpha: 1 },
    })
    .resize(512, 512)
    .toFile('public/icon-maskable.png');
  console.log('✓ icon-maskable.png');

  console.log('Creating mobile screenshot (390×844)...');
  await sharp({
    create: {
      width: 390, height: 844, channels: 4,
      background: { r: 15, g: 17, b: 23, alpha: 1 },
    },
  })
    .png()
    .toFile('public/screenshot-mobile.png');
  console.log('✓ screenshot-mobile.png');

  console.log('Creating desktop screenshot (1280×720)...');
  await sharp({
    create: {
      width: 1280, height: 720, channels: 4,
      background: { r: 15, g: 17, b: 23, alpha: 1 },
    },
  })
    .png()
    .toFile('public/screenshot-desktop.png');
  console.log('✓ screenshot-desktop.png');

  console.log('\nAll assets generated successfully!');
}

run().catch(err => { console.error(err); process.exit(1); });
