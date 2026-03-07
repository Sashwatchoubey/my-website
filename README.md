# my-website — AIILSG West Bengal Centre PMS

## 🔍 प्रोजेक्ट को कैसे चेक करें / How to Check the Project

### Step 1 — PR #1 को मर्ज करें / Merge PR #1

PR #1 में पूरा React app बना हुआ है (Login, Dashboard, Projects)।
इसे `main` branch में merge करें:

1. GitHub पर जाएं: https://github.com/Sashwatchoubey/my-website/pull/1
2. **"Merge pull request"** बटन दबाएं
3. Confirm करें

### Step 2 — लोकल मशीन पर चलाएं / Run Locally

```bash
# रिपो क्लोन करें (अगर पहले से नहीं किया)
git clone https://github.com/Sashwatchoubey/my-website.git
cd my-website

# PR #1 का branch checkout करें (merge से पहले)
git checkout copilot/build-project-management-system

# Dependencies इंस्टॉल करें
npm install

# Dev server चालू करें
npm run dev
```

ब्राउज़र में `http://localhost:5173` खोलें।

### Step 3 — लॉगिन करें / Login

| Username   | Password   | Role          |
|------------|------------|---------------|
| `admin`    | `admin123` | Administrator |
| `director` | `dir123`   | Director      |

### Step 4 — Verification Checklist ✅

PR #1 को review करते समय ये सब चेक करें:

- [ ] **Login Page** — क्या खुल रहा है? Glassmorphism effect दिख रहा है?
- [ ] **Demo credentials** — `admin/admin123` से login हो रहा है?
- [ ] **Dashboard** — Login के बाद dashboard दिख रहा है?
- [ ] **Summary Cards** — 6 KPI cards (Projects, Staff, Income, Expenses, Receivables, Profit) दिख रहे हैं?
- [ ] **Charts** — Bar chart, Line chart, Pie chart सब दिख रहे हैं?
- [ ] **Recent Activities** — Activity feed दिख रहा है?
- [ ] **Projects Page** — Sidebar में "Projects" click करने पर project cards दिख रहे हैं?
- [ ] **Search & Filter** — Projects में search और status filter काम कर रहा है?
- [ ] **Project Detail** — किसी project card पर click करने पर detail modal खुल रहा है?
- [ ] **Dark/Light Mode** — Topbar में toggle काम कर रहा है?
- [ ] **Mobile Responsive** — Browser window छोटा करने पर layout सही दिख रहा है?
- [ ] **Sidebar** — सभी 13 module links दिख रहे हैं?
- [ ] **Build** — `npm run build` successfully complete हो रहा है?

---

## 🚀 आगे क्या करना है / Next Steps Roadmap

PR #1 (Step 1) में ये बन चुका है:
- ✅ Login Page
- ✅ Dashboard (Charts, KPI Cards, Activity Feed)
- ✅ Projects Listing (Search, Filter, Detail Modal)
- ✅ Sidebar Navigation
- ✅ Top Navbar (Search, Dark Mode, Notifications)

### Step 2 — Manpower & Staff Module
- [ ] Staff listing page (table/card view)
- [ ] Add/Edit/Delete staff
- [ ] Staff profile page with details
- [ ] Staff assignment to projects

### Step 3 — Salary & Attendance
- [ ] Salary management page
- [ ] Attendance tracking (daily/monthly)
- [ ] Payslip generation (PDF export)

### Step 4 — Financial Modules
- [ ] Invoicing system (create/send invoices)
- [ ] Income & Receivables tracking
- [ ] Expense management with categories
- [ ] Profit & Loss reports

### Step 5 — Activities & Events
- [ ] Activity calendar view
- [ ] Event management (create/edit events)
- [ ] Training programme tracking

### Step 6 — Settings & Admin
- [ ] User management (roles, permissions)
- [ ] Organization settings
- [ ] Backup & export data

### Step 7 — Production Deployment
- [ ] Backend API integration (Node.js/Express or similar)
- [ ] Database setup (PostgreSQL/MongoDB)
- [ ] Authentication with JWT
- [ ] Deploy to Vercel/Netlify/AWS
- [ ] Custom domain setup

---

## 🛠️ Quick Commands

```bash
npm run dev      # Development server चालू करें
npm run build    # Production build बनाएं
npm run preview  # Production build preview करें
```

---

*© 2025 AIILSG West Bengal Centre — Kolkata*