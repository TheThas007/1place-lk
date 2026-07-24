const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'admin', 'dashboard', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf-8');

// We will split the file by "/* ─── "
const parts = content.split('/* ─── ');

// The first part is the main AdminDashboard component + imports
const headerAndMain = parts[0];

const tabsDir = path.join(__dirname, 'src', 'components', 'admin', 'tabs');
if (!fs.existsSync(tabsDir)) fs.mkdirSync(tabsDir, { recursive: true });

// Extract tabs
for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  const tabNameMatch = part.match(/^(.*?) ─── \*\//);
  if (tabNameMatch) {
    const tabTitle = tabNameMatch[1].trim(); // e.g. "Overview Tab"
    const componentName = tabTitle.replace(/\s+/g, ''); // "OverviewTab"
    
    // We need to add the imports to the top of each tab file.
    // The imports are standard React/Lucide imports. We can just add a standard block.
    const fileContent = `"use client";\n\n` + 
      `import React, { useState } from "react";\n` +
      `import { formatPrice } from "@/lib/utils";\n` +
      `import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";\n` +
      `import { Activity, TrendingUp, TrendingDown, Eye, Plus, Search, Edit, Trash2, Package, FolderOpen, Image as ImageIcon, Star } from "lucide-react";\n\n` +
      `/* ─── ` + part;
      
    // Write to file
    const fileName = componentName + '.tsx';
    fs.writeFileSync(path.join(tabsDir, fileName), fileContent);
    console.log(`Extracted ${fileName}`);
  }
}
