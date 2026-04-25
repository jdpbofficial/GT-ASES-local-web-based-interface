================================================================================
          GT-ASES: GLOBE TELECOM APPLICANT SCREENING & EVALUATION SYSTEM
================================================================================
Integrated Project Ecosystem (Desktop & Web Synchronization)
================================================================================

PROJECT OVERVIEW:
GT-ASES is a robust, synchronized recruitment platform designed to modernize 
Globe Telecom's hiring workflow. This repository contains the "Master Integrated 
Desktop Version" which functions as a high-fidelity local client while 
remaining in perfect sync with the GT-ASES Web Interface.

KEY FEATURES:
- Shared Database: Unified candidates, users, and config across platforms.
- AI Scoring Engine: Automated weighting based on Position Relevance.
- Real-time Sync: Multi-platform access with file-locking collision protection.
- Master Integration: One application shell combining logic from multiple devs.

TEAM ROLES & CONTRIBUTIONS:
--------------------------------------------------------------------------------
• JOBERT DEXZ P. BAUTISTA (Lead & Master Compiler)
  Integrated raw modular logic into the unified system shell. Engineered the 
  data synchronization layer and backend collision protection.

• CHRISTINE JOY GALOPE ADSUARA (Lead UI/UX Designer)
  Developed the "Design System" and theme.py framework. Standardized the 
  professional Globe Telecom branding across all windows.

• ANNE CHEL MARIE (Development - Dashboard Logic)
  Engineered the raw data-fetching and statistical aggregation algorithms.

• JAN JEROX AGUSTIN (Development - Records Logic)
  Developed the raw search/filtering engine and records management logic.

• SAM (Development - Security Logic)
  Engineered the raw authentication flow and security masking protocols.

SYSTEM DOCUMENTATION (Inside this folder):
--------------------------------------------------------------------------------
• code_map.txt              — Guide to member contributions in the source code.
• presentation_outline.txt  — Slide-by-slide guide for the final presentation.
• team_reviewer.txt        — Technical Q&A for judges and examiners.
• video_walkthrough_script.txt — Scene-by-scene script for the system demo.

HOW TO RUN (DESKTOP):
---------------------
1. Ensure Python 3.x is installed.
2. Navigate to this folder: cd desktop_version
3. Start the application: python main.py

PRESENTATION ACCESS (GLOBAL):
-----------------------------
To show the system to others on their own devices:
1. Run the Web Server (npm run dev).
2. Open a terminal and run: ngrok http 3000
3. Share the Ngrok link.

DEFAULT CREDENTIALS:
- Admin Account:  admin    / admin123
- Staff Account:  hrstaff  / staff123

TECHNICAL REQUIREMENTS:
- Python 3.x (Standard library only - Tkinter)
- Shared Data Store: Located at "../server_data/"

Developed for OLSHCO IT Project — April 2026
================================================================================
