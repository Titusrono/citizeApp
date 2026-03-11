# Theme System Documentation

## Overview
The Citizen Connect application now features a complete theme switching system that allows users to choose between Light, Dark, and System modes.

## Features
- **Three theme modes**: Light, Dark, and System (auto-detects OS preference)
- **Default mode**: System (respects user's OS theme settings)
- **Persistence**: Theme preference is saved in localStorage
- **Auto-detection**: Automatically responds to OS theme changes in System mode
- **Smooth transitions**: Theme changes are instant and smooth

## Implementation

### Theme Service
Location: `ui/src/app/services/theme.service.ts`

The ThemeService provides:
- `theme$`: Observable stream of current theme
- `setTheme(theme)`: Set a specific theme (light/dark/system)
- `toggleTheme()`: Cycle through themes (system → light → dark → system)
- `getCurrentTheme()`: Get the currently selected theme
- `getEffectiveTheme()`: Get the actual applied theme (resolves 'system' to 'light' or 'dark')

### Theme Toggle Button
The theme toggle button is located in the top-right corner of the header, next to the user menu.

**Features:**
- Click to cycle through themes
- Icon shows current effective theme (☀️ for light, 🌙 for dark)
- Tooltip shows current mode (System Mode, Light Mode, or Dark Mode)
- Smooth hover animations

### Dark Mode Classes
Dark mode is implemented using Tailwind CSS v4 with the `dark:` utility classes:

```html
<!-- Example usage -->
<div class="bg-white dark:bg-gray-800">
  <p class="text-gray-900 dark:text-white">Content</p>
</div>
```

### Components with Dark Mode Support
The following components have been updated with dark mode styling:
- ✅ Main Layout (header, user menu)
- ✅ Sidebar (navigation, badges, footer)
- ✅ Theme toggle button
- ⚠️ Other components need manual dark mode classes added

## Usage

### For Users
1. Click the theme toggle button (☀️/🌙) in the top-right corner
2. Theme cycles through: System → Light → Dark → System
3. Your preference is automatically saved

### For Developers

#### Adding Dark Mode to Components
Add `dark:` variants to your Tailwind classes:

```html
<!-- Background colors -->
<div class="bg-white dark:bg-gray-800">

<!-- Text colors -->
<p class="text-gray-900 dark:text-white">

<!-- Borders -->
<div class="border-gray-200 dark:border-gray-700">

<!-- Hover states -->
<button class="hover:bg-gray-100 dark:hover:bg-gray-700">
```

#### Using Theme Service in Components
```typescript
import { ThemeService } from '../services/theme.service';

export class MyComponent {
  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      console.log('Current theme:', theme);
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  setDarkMode() {
    this.themeService.setTheme('dark');
  }
}
```

## Technical Details

### Storage
- **Key**: `app-theme`
- **Values**: `'light'`, `'dark'`, or `'system'`
- **Location**: Browser localStorage

### DOM Implementation
The service adds a class to `document.documentElement`:
- Light mode: `class="light"`
- Dark mode: `class="dark"`
- System mode: Dynamically applies `light` or `dark` based on OS preference

### Browser Compatibility
The theme system uses the `window.matchMedia('(prefers-color-scheme: dark)')` API, which is supported in:
- Chrome 76+
- Firefox 67+
- Safari 12.1+
- Edge 79+

## Future Enhancements
- [ ] Add custom color themes (not just light/dark)
- [ ] Add theme preview before applying
- [ ] Add more components with dark mode support
- [ ] Add theme-specific illustrations/images
- [ ] Add transition animations between themes

## Troubleshooting

### Theme not persisting
Check browser localStorage is enabled and not full.

### Dark mode not applying
Ensure components have `dark:` utility classes added.

### System mode not working
Check if browser supports `prefers-color-scheme` media query.

### Icons not changing
Verify `getThemeIcon()` method is called in template and ThemeService is properly injected.
