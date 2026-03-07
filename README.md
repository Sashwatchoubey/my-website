# AIILSG — West Bengal Centre Project Management System

**All India Institute of Local Self Government (AIILSG)**  
West Bengal / Kolkata Centre — Project Management System (PMS)

Built with **React 18 + Vite + Tailwind CSS + Recharts + Lucide React**.

---

## 🇮🇳 हिंदी में निर्देश (Hindi Setup Instructions)

### आवश्यकताएँ (Prerequisites)
- **Node.js** संस्करण 18 या उससे ऊपर  

### चरण-दर-चरण इंस्टॉलेशन

**चरण 1 — Node.js इंस्टॉल करें**  
Node.js की आधिकारिक वेबसाइट [https://nodejs.org](https://nodejs.org) पर जाएं और LTS संस्करण डाउनलोड करें।

**चरण 2 — रिपो क्लोन करें**
```bash
git clone https://github.com/Sashwatchoubey/my-website.git
cd my-website
```

**चरण 3 — निर्भरताएं इंस्टॉल करें**
```bash
npm install
```

**चरण 4 — डेवलपमेंट सर्वर चलाएं**
```bash
npm run dev
```

**चरण 5 — ब्राउज़र में खोलें**  
ब्राउज़र में `http://localhost:5173` खोलें।

**डेमो लॉगिन क्रेडेंशियल:**
| यूज़रनेम | पासवर्ड |
|----------|---------|
| `admin` | `admin123` |
| `director` | `dir123` |

---

## 🇬🇧 English Setup Instructions

### Prerequisites
- **Node.js** v18 or higher — download from [https://nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)

### Step-by-step Installation

**Step 1 — Install Node.js**  
Download and install Node.js LTS from [https://nodejs.org](https://nodejs.org).  
Verify installation:
```bash
node -v
npm -v
```

**Step 2 — Clone the repository**
```bash
git clone https://github.com/Sashwatchoubey/my-website.git
cd my-website
```

**Step 3 — Install dependencies**
```bash
npm install
```
This installs React, Vite, Tailwind CSS, Recharts, Lucide React, and React Router.

**Step 4 — Start the development server**
```bash
npm run dev
```

**Step 5 — Open in browser**  
Navigate to `http://localhost:5173` in your web browser.

**Demo Login Credentials:**
| Username  | Password   | Role               |
|-----------|------------|--------------------|
| `admin`   | `admin123` | Administrator      |
| `director`| `dir123`   | Centre Director    |

---

## 🏗️ Tech Stack

| Technology       | Version | Purpose                        |
|-----------------|---------|--------------------------------|
| React           | 18+     | UI framework                   |
| Vite            | 5+      | Build tool & dev server        |
| Tailwind CSS    | 3+      | Utility-first styling          |
| Recharts        | 2+      | Dashboard charts               |
| React Router    | 6+      | Client-side routing            |
| Lucide React    | 0.363+  | Modern icon set                |

---

## 📁 Project Structure

```
my-website/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx              # App entry point
    ├── App.jsx               # Router + layout wrapper
    ├── index.css             # Global styles + Tailwind
    ├── components/
    │   ├── Layout/
    │   │   ├── Sidebar.jsx   # Left navigation sidebar
    │   │   ├── Topbar.jsx    # Top navigation bar
    │   │   └── Layout.jsx    # Main layout wrapper
    │   ├── Dashboard/
    │   │   ├── SummaryCards.jsx    # Animated KPI cards
    │   │   ├── Charts.jsx          # Recharts components
    │   │   ├── RecentActivities.jsx
    │   │   └── QuickActions.jsx
    │   └── UI/
    │       ├── AnimatedCounter.jsx
    │       └── StatusBadge.jsx
    ├── pages/
    │   ├── LoginPage.jsx     # Login with glassmorphism
    │   ├── DashboardPage.jsx # Main dashboard
    │   └── ProjectsPage.jsx  # Projects listing + detail
    ├── data/
    │   └── sampleData.js     # Sample West Bengal projects
    ├── context/
    │   └── AuthContext.jsx   # Auth state management
    └── utils/
        └── helpers.js        # Currency, date formatters
```

---

## ✨ Features

- 🔐 **Login Page** — Glassmorphism design with animated gradient background
- 📊 **Dashboard** — Animated KPI counters, bar/line/pie charts
- 🏗️ **Projects** — Card grid with search, filter by status, and detail modal
- 🌙 **Dark/Light Mode** — Toggle from topbar
- 📱 **Fully Responsive** — Works on mobile, tablet, desktop
- 🎨 **Modern UI** — Glassmorphism, gradients, smooth transitions

---

## 🚀 Build for Production

```bash
npm run build
```
Output will be in the `dist/` folder.

---

*© 2025 AIILSG West Bengal Centre — Kolkata*