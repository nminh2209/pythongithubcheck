# Trading Platform Frontend - Dependencies Setup

This document outlines the required dependencies for the Trading Platform application, covering frontend and development tools.

## 📂 Dependencies Overview

### Manually added dependencies:
```sh
cd ../frontend
npm install react@18.2.0
npm install react-dom@18.2.0
npm install react-router-dom@6.14.2
npm install ethers@5.7.2
npm install react-chartjs-2@5.2.0
npm install chart.js@4.3.0
```

### 📦 Core Dependencies
- `react`
- `react-dom`
- `react-scripts`
- `web-vitals`

### 🔹 Routing
- `react-router-dom@6`
  - For client-side routing and navigation
  - Includes: `useNavigate`, `useLocation`, `Routes`, `Route` components

### 📊 Data Visualization
- `chart.js`
- `react-chartjs-2`
  - Real-time chart rendering
  - Line charts for stock price history

### 🎨 UI Components & Styling
- `react-scroll`
  - Smooth scrolling to page sections
  - `ScrollLink` component for navigation
- `@mui/material`
- `@emotion/react`
- `@emotion/styled`

### 🔄 State Management
- `react` (`useState`, `useEffect`)
  - Local state management
  - Component lifecycle handling

## 🚀 Installation

Run the following command to install required dependencies:

```sh
npm install react-router-dom@6 chart.js react-chartjs-2 react-scroll
```

### 📌 Install Development Dependencies
```sh
npm install --save-dev @babel/plugin-proposal-private-property-in-object
```

### 🎨 Install UI Components
```sh
npm install @mui/material @emotion/react @emotion/styled
```

## 🔧 Development Dependencies
- `@babel/plugin-proposal-private-property-in-object`
  - Required for proper Babel compilation
  - Handles private property declarations in objects

## 📌 Usage
Ensure these imports are available in your components:

```javascript
// Routing
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';

// Charts
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

// Smooth Scrolling
import { Link as ScrollLink } from 'react-scroll';

// React Hooks
import { useState, useEffect } from 'react';
```

This document provides a comprehensive guide to setting up the necessary dependencies for the Trading Platform application.

