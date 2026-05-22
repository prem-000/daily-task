# 🎨 Branding Guide — StudyFlow Logo & Visual Identity

This guide covers the StudyFlow logo, app icons, and brand assets for the Aurora Glass UI design system.

## 🎯 Brand Identity

**StudyFlow** is a next-generation AI productivity assistant for students with a premium, futuristic aesthetic.

**Brand Personality:**
- 🚀 Futuristic & innovative
- ✨ Premium & polished
- 🎓 Student-focused
- 🤖 AI-powered
- 💫 Vibrant & energetic

## 🎨 Logo Design Specifications

### Main Concept

Combine these elements:
- **Graduation cap** OR **abstract brain** (education/intelligence)
- **Calendar/task system** (productivity)
- **AI spark/glow** (artificial intelligence)
- **Flowing motion effect** (productivity flow)

### Logo Style Requirements

```
✅ Futuristic and clean
✅ Vibrant with gradients
✅ Premium startup branding
✅ Modern SaaS + mobile app feel
✅ Rounded app icon style
✅ Soft glassmorphism
✅ Smooth curves
✅ High readability at small sizes
✅ Simple enough for favicon use

❌ No complicated details
❌ Avoid generic education logos
❌ Not recognizable at 16×16
```

### Color Palette

```css
/* Primary Gradient */
--logo-gradient-primary: linear-gradient(135deg, #7C3AED, #3B82F6);

/* Secondary Accents */
--logo-accent-cyan: #06B6D4;
--logo-accent-purple: #A855F7;

/* Backgrounds */
--logo-bg-dark: #081120;
--logo-bg-transparent: transparent;
```

### Logo Variations Required

| Variation | Size | Format | Usage |
|-----------|------|--------|-------|
| **Full Logo** | 512×512 | PNG, SVG | Marketing, splash screen |
| **App Icon** | 512×512 | PNG | PWA icon, app stores |
| **Favicon** | 16×16, 32×32 | ICO, PNG | Browser tabs |
| **Dark Mode** | 512×512 | PNG, SVG | Dark backgrounds |
| **Light Mode** | 512×512 | PNG, SVG | Light backgrounds |
| **Splash Icon** | 1024×1024 | PNG | PWA splash screen |
| **Transparent** | 512×512 | PNG | Overlays |

## 📐 Logo Construction

### Full Logo with Text

```
┌─────────────────────────────┐
│                             │
│    [ICON]  StudyFlow        │
│                             │
└─────────────────────────────┘

Icon: 64×64px
Text: Modern geometric sans-serif
Spacing: 16px between icon and text
```

### App Icon Only

```
┌──────────────┐
│              │
│   [SYMBOL]   │
│   + GLOW     │
│              │
└──────────────┘

Size: 512×512px
Padding: 64px all sides
Corner radius: 22% (iOS standard)
```

### Favicon Version

```
┌────┐
│ SF │  ← Simplified "SF" monogram
└────┘    OR minimal graduation cap

Size: 16×16px, 32×32px
Ultra minimal
High contrast
```

## 🎨 Logo Design Elements

### Icon Concept Options

#### Option 1: Gradient Graduation Cap + AI Spark

```
     ╱╲
    ╱  ╲     ← Graduation cap
   ╱────╲
  │  ✨  │   ← AI spark in center
  └──────┘
```

**Features:**
- Rounded cap edges
- Gradient fill (purple → blue)
- Glowing AI spark in center
- Subtle shadow depth

#### Option 2: Abstract Brain Flow

```
   ╭─╮ ╭─╮
   │ ╰─╯ │   ← Abstract brain shape
   ╰─────╯   ← Flowing lines
     ✨      ← AI glow
```

**Features:**
- Flowing curved lines
- Neural network aesthetic
- Gradient strokes
- Pulsing glow effect

#### Option 3: Calendar + AI Fusion

```
  ┌─────┐
  │ ✓ ✓ │   ← Calendar grid
  │ ✓ ✨ │   ← AI spark on task
  └─────┘
```

**Features:**
- Minimalist calendar
- Checkmarks for tasks
- AI spark highlighting
- Rounded corners

## 🎭 Visual Effects

### Glowing Edge Effect

```css
.logo-glow {
  filter: drop-shadow(0 0 20px rgba(124, 58, 237, 0.6))
          drop-shadow(0 0 40px rgba(59, 130, 246, 0.4));
}
```

### Neon Aura

```css
.logo-aura {
  box-shadow: 
    0 0 30px rgba(124, 58, 237, 0.5),
    0 0 60px rgba(59, 130, 246, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
}
```

### AI Pulse Effect

```css
@keyframes ai-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(124, 58, 237, 0.8));
  }
}

.logo-pulse {
  animation: ai-pulse 2s ease-in-out infinite;
}
```

### Soft Shadow Depth

```css
.logo-depth {
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 8px 40px rgba(124, 58, 237, 0.2);
}
```

## ✍️ Typography — "StudyFlow"

### Font Specifications

**Recommended Fonts:**
- **Primary:** Inter (Bold 700)
- **Alternative:** Satoshi (Bold 700)
- **Fallback:** SF Pro Display (Bold 700)

### Text Style

```css
.logo-text {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 48px;
  letter-spacing: -0.02em; /* Futuristic tight spacing */
  background: linear-gradient(135deg, #7C3AED, #3B82F6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Text Variations

| Context | Style |
|---------|-------|
| **Full Logo** | Gradient text with glow |
| **Dark Mode** | White text with purple glow |
| **Light Mode** | Dark navy with blue glow |
| **Monochrome** | Single color, no gradient |

## 📱 App Icon Specifications

### iOS App Icon

```
Size: 1024×1024px
Format: PNG (no transparency)
Corner radius: Applied by iOS
Safe area: 64px padding
```

### Android App Icon

```
Size: 512×512px
Format: PNG with transparency
Adaptive icon: 108×108dp canvas
Safe area: 66×66dp
```

### PWA Icon Sizes

```json
{
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72" },
    { "src": "/icons/icon-96x96.png", "sizes": "96x96" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512" }
  ]
}
```

## 🎨 Favicon Design

### Minimal Favicon Concept

**Ultra-clean design for 16×16 recognition:**

```
Option 1: "SF" Monogram
┌────┐
│ SF │  ← Bold letters with gradient
└────┘

Option 2: Minimal Cap
┌────┐
│ ╱╲ │  ← Simple graduation cap
└────┘

Option 3: AI Spark
┌────┐
│ ✨ │  ← Single spark icon
└────┘
```

### Favicon Specifications

```html
<!-- Favicon Links -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

### Favicon Colors

```css
/* High contrast for small sizes */
--favicon-primary: #7C3AED;
--favicon-secondary: #3B82F6;
--favicon-accent: #06B6D4;
--favicon-bg-dark: #081120;
--favicon-bg-light: #FFFFFF;
```

## 🖼️ Splash Screen Design

### PWA Splash Screen

```
┌─────────────────┐
│                 │
│                 │
│    [LOGO]       │  ← Large centered logo
│                 │     with glow effect
│   StudyFlow     │  ← App name below
│                 │
│                 │
└─────────────────┘

Background: Deep navy gradient
Logo size: 256×256px
Glow: Animated pulse
```

### Splash Screen Sizes

```json
{
  "splash_screens": [
    { "src": "/splash/splash-640x1136.png", "sizes": "640x1136" },
    { "src": "/splash/splash-750x1334.png", "sizes": "750x1334" },
    { "src": "/splash/splash-1242x2208.png", "sizes": "1242x2208" },
    { "src": "/splash/splash-1125x2436.png", "sizes": "1125x2436" },
    { "src": "/splash/splash-1242x2688.png", "sizes": "1242x2688" }
  ]
}
```

## 🎨 Logo Usage Guidelines

### Do's ✅

- Use official logo files
- Maintain aspect ratio
- Keep minimum clear space (equal to logo height)
- Use approved color variations
- Apply glow effects consistently
- Ensure readability at all sizes

### Don'ts ❌

- Don't stretch or distort
- Don't change colors outside palette
- Don't add drop shadows (use glow instead)
- Don't rotate or skew
- Don't place on busy backgrounds
- Don't use low-resolution versions

## 📦 Asset Delivery Checklist

### Required Files

```
branding/
├── logo/
│   ├── studyflow-logo-full.svg
│   ├── studyflow-logo-full.png (512×512)
│   ├── studyflow-logo-dark.svg
│   ├── studyflow-logo-light.svg
│   └── studyflow-logo-transparent.png
│
├── icon/
│   ├── app-icon.png (512×512)
│   ├── app-icon-rounded.png (512×512)
│   └── app-icon-ios.png (1024×1024)
│
├── favicon/
│   ├── favicon.ico (16×16, 32×32)
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   └── apple-touch-icon.png (180×180)
│
├── splash/
│   ├── splash-icon.png (1024×1024)
│   └── splash-screens/ (various sizes)
│
└── social/
    ├── og-image.png (1200×630)
    └── twitter-card.png (1200×600)
```

## 🎨 Implementation Examples

### React Component

```tsx
export function Logo({ variant = 'full', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 128,
  };

  return (
    <div className="logo-container">
      {variant === 'full' ? (
        <div className="flex items-center gap-3">
          <img 
            src="/logo/app-icon.png" 
            alt="StudyFlow" 
            width={sizes[size]}
            height={sizes[size]}
            className="logo-glow"
          />
          <span className="logo-text">StudyFlow</span>
        </div>
      ) : (
        <img 
          src="/logo/app-icon.png" 
          alt="StudyFlow" 
          width={sizes[size]}
          height={sizes[size]}
          className="logo-glow"
        />
      )}
    </div>
  );
}
```

### CSS Animations

```css
/* Logo entrance animation */
@keyframes logo-entrance {
  0% {
    opacity: 0;
    transform: scale(0.8);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

.logo-animate {
  animation: logo-entrance 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effect */
.logo-interactive:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 30px rgba(124, 58, 237, 0.8));
  transition: all 0.3s ease;
}
```

## 🎯 Brand Mood Board

**Visual References:**
- Arc Browser logo (clean, modern)
- Linear logo (geometric, premium)
- Notion logo (simple, memorable)
- Figma logo (colorful, friendly)
- Stripe logo (professional, tech)

**Avoid:**
- Generic graduation cap clipart
- Overused book icons
- Corporate blue logos
- Flat material design
- Skeuomorphic details

## 📚 Additional Resources

- [Logo Design Tools](https://www.figma.com/)
- [Icon Generators](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [App Icon Template](https://www.figma.com/community/file/857303226040719059)

## 🔗 Related Guides

- [UI Guide](./UI.md) — Aurora Glass design system
- [PWA Guide](./PWA.md) — App icon implementation
- [Frontend Guide](./FRONTEND.md) — Logo component usage

---

**Remember:** The logo should feel like a next-generation AI productivity assistant for students — premium, futuristic, and memorable! 🚀✨
