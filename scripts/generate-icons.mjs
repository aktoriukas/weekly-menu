import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple SVG icon with a fork and knife design for meal planning
const createSvgIcon = (size) => {
  const padding = Math.round(size * 0.15);
  const innerSize = size - (padding * 2);

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22c55e"/>
          <stop offset="100%" style="stop-color:#16a34a"/>
        </linearGradient>
      </defs>

      <!-- Background with rounded corners -->
      <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="url(#bgGradient)"/>

      <!-- Calendar/menu icon design -->
      <g transform="translate(${padding}, ${padding})">
        <!-- Calendar body -->
        <rect
          x="${innerSize * 0.15}"
          y="${innerSize * 0.2}"
          width="${innerSize * 0.7}"
          height="${innerSize * 0.65}"
          rx="${innerSize * 0.05}"
          fill="white"
          opacity="0.95"
        />

        <!-- Calendar header -->
        <rect
          x="${innerSize * 0.15}"
          y="${innerSize * 0.2}"
          width="${innerSize * 0.7}"
          height="${innerSize * 0.15}"
          rx="${innerSize * 0.05}"
          fill="white"
        />

        <!-- Calendar rings -->
        <rect x="${innerSize * 0.28}" y="${innerSize * 0.12}" width="${innerSize * 0.06}" height="${innerSize * 0.15}" rx="${innerSize * 0.03}" fill="white"/>
        <rect x="${innerSize * 0.47}" y="${innerSize * 0.12}" width="${innerSize * 0.06}" height="${innerSize * 0.15}" rx="${innerSize * 0.03}" fill="white"/>
        <rect x="${innerSize * 0.66}" y="${innerSize * 0.12}" width="${innerSize * 0.06}" height="${innerSize * 0.15}" rx="${innerSize * 0.03}" fill="white"/>

        <!-- Grid dots representing meal slots -->
        <circle cx="${innerSize * 0.32}" cy="${innerSize * 0.48}" r="${innerSize * 0.045}" fill="#16a34a"/>
        <circle cx="${innerSize * 0.50}" cy="${innerSize * 0.48}" r="${innerSize * 0.045}" fill="#16a34a"/>
        <circle cx="${innerSize * 0.68}" cy="${innerSize * 0.48}" r="${innerSize * 0.045}" fill="#16a34a"/>

        <circle cx="${innerSize * 0.32}" cy="${innerSize * 0.63}" r="${innerSize * 0.045}" fill="#16a34a"/>
        <circle cx="${innerSize * 0.50}" cy="${innerSize * 0.63}" r="${innerSize * 0.045}" fill="#16a34a"/>
        <circle cx="${innerSize * 0.68}" cy="${innerSize * 0.63}" r="${innerSize * 0.045}" fill="#16a34a"/>

        <circle cx="${innerSize * 0.32}" cy="${innerSize * 0.78}" r="${innerSize * 0.045}" fill="#16a34a"/>
        <circle cx="${innerSize * 0.50}" cy="${innerSize * 0.78}" r="${innerSize * 0.045}" fill="#16a34a"/>
        <circle cx="${innerSize * 0.68}" cy="${innerSize * 0.78}" r="${innerSize * 0.045}" fill="#16a34a" opacity="0.4"/>
      </g>
    </svg>
  `;
};

async function generateIcons() {
  // Ensure icons directory exists
  await mkdir(iconsDir, { recursive: true });

  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const svg = createSvgIcon(size);
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`  Created: icon-${size}x${size}.png`);
  }

  // Generate apple-touch-icon (180x180)
  const appleSvg = createSvgIcon(180);
  await sharp(Buffer.from(appleSvg))
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('  Created: apple-touch-icon.png');

  // Generate favicon-16x16 and favicon-32x32
  const favicon16Svg = createSvgIcon(16);
  await sharp(Buffer.from(favicon16Svg))
    .png()
    .toFile(join(publicDir, 'favicon-16x16.png'));
  console.log('  Created: favicon-16x16.png');

  const favicon32Svg = createSvgIcon(32);
  await sharp(Buffer.from(favicon32Svg))
    .png()
    .toFile(join(publicDir, 'favicon-32x32.png'));
  console.log('  Created: favicon-32x32.png');

  // Generate OG image (1200x630)
  const ogSvg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f0fdf4"/>
          <stop offset="100%" style="stop-color:#dcfce7"/>
        </linearGradient>
      </defs>

      <rect width="1200" height="630" fill="url(#bgGrad)"/>

      <!-- Icon -->
      <g transform="translate(100, 165)">
        ${createSvgIcon(300)}
      </g>

      <!-- Text -->
      <text x="480" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700" fill="#16a34a">
        Menu for a Week
      </text>
      <text x="480" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="#4b5563">
        Plan your weekly meals, organize recipes,
      </text>
      <text x="480" y="405" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="#4b5563">
        and automatically generate shopping lists.
      </text>
    </svg>
  `;

  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(join(publicDir, 'og-image.png'));
  console.log('  Created: og-image.png');

  // Generate favicon.ico from 32x32 PNG
  await sharp(Buffer.from(favicon32Svg))
    .resize(32, 32)
    .toFile(join(publicDir, 'favicon.ico'));
  console.log('  Created: favicon.ico');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
