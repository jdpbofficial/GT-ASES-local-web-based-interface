# GT-ASES: Globe Telecom Applicant Screening & Evaluation System

**A Cross-Platform Synchronized Recruitment Ecosystem**

GT-ASES is a full-stack solution designed for high-efficiency HR operations. It bridges a modern **React/Vite Web Interface** with a powerful **Python/Tkinter Desktop Client**, ensuring consistent data across all devices via a shared synchronization layer.

## 🚀 The Integration Story
This project follows a "Master Compilation" development model. Logic modules were contributed by individual developers and integrated into a unified system by the Project Leader and UI Designer.

### The Team
- **Jobert Dexz P. Bautista**: Project Leader & Master Compiler
- **Christine Joy Galope Adsuara**: Lead UI/UX Designer
- **Anne Chel Marie**: Module Developer (Dashboard & Stats)
- **Jan Jerox Agustin**: Module Developer (Records & Search)
- **Sam**: Module Developer (Security & Auth)

---

## 🛠️ System Architecture

### 1. Web Platform (Cloud/Remote Access)
- **Frontend**: React 18, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js Express Server.
- **Sync**: Real-time read/write to the central data store.

### 2. Desktop Client (Local/Offline Access)
- **Language**: Python 3.x.
- **GUI**: Custom dark-mode Tkinter.
- **Role**: High-fidelity records management for heavy office use.

### 3. Shared Data Hub (`/server_data`)
- **JSON Engine**: Storage for applicants, users, and server-side scoring configurations.
- **Collision Logic**: Implemented retry-on-lock mechanisms to allow simultaneous access from Web and Desktop clients.

---

## 📁 Repository Structure
- `/src`: Web frontend components.
- `server.ts`: Backend API and sync logic.
- `/desktop_version`: The Python application source code.
- `/desktop_version/pages`: Modular logic files for each system feature.
- `/desktop_version/code_map.txt`: Detailed map of team contributions.

---

## 🚦 Getting Started

### To run the Web Version:
```bash
npm install
npm run dev
```

### To run the Desktop Version:
```bash
cd desktop_version
python main.py
```

### 🌍 Global Access for Presentation (Ngrok)
To allow your team or teachers to access the web version via their own devices over the internet:
1. Install [ngrok](https://ngrok.com/).
2. Run the web server using `npm run dev`.
3. In a new terminal, run: `ngrok http 3000`.
4. Share the generated "Forwarding" URL (e.g., `https://xxxx.ngrok-free.app`).

### Default Login
- **Username**: `admin`
- **Password**: `admin123`

---
Developed for **OLSHCO Information Technology** Project — April 2026.
