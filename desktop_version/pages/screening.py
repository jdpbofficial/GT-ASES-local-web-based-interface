import tkinter as tk
from tkinter import ttk, messagebox
from theme import *
from data_manager import load_applicants, compute_score, save_applicants

class ScreeningPage:
    def __init__(self, parent, user, app):
        self.parent = parent
        self.user   = user
        self.app    = app
        self._build()

    def _build(self):
        container = tk.Frame(self.parent, bg=BG_MAIN, padx=36, pady=32)
        container.pack(fill="both", expand=True)

        # Header
        hdr = tk.Frame(container, bg=BG_MAIN)
        hdr.pack(fill="x", pady=(0, 24))
        tk.Label(hdr, text="Automated AI Screening", font=FONT_TITLE,
                 bg=BG_MAIN, fg=TEXT_PRIMARY).pack(side="left")
        
        tk.Button(hdr, text=" ⚡  Run Full Re-Score ", font=FONT_H3,
                  bg=ACCENT, fg=TEXT_DARK, relief="flat", padx=15, pady=8,
                  cursor="hand2", command=self._run_screening).pack(side="right")

        # Info Card
        card = tk.Frame(container, bg=BG_CARD, padx=30, pady=24)
        card.pack(fill="x", pady=(0, 20))
        
        tk.Label(card, text="This module recalculates the scores for all applicants based on the latest Position Relevance Matrix from the cloud server.", 
                 font=FONT_BODY, bg=BG_CARD, fg=TEXT_SECONDARY, wraplength=800, justify="left").pack(anchor="w")

        # Table
        table_container = tk.Frame(container, bg=BG_CARD)
        table_container.pack(fill="both", expand=True)

        cols = ("ID", "Name", "Position", "Old Status", "New Score", "New Status")
        self.tree = ttk.Treeview(table_container, columns=cols, show="headings", style="GT.Treeview")
        
        for col in cols:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=120, anchor="center")

        self.tree.pack(side="left", fill="both", expand=True)
        self._refresh()

    def _refresh(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        for a in load_applicants()[:15]:
            self.tree.insert("", "end", values=(f"#{a['applicantID']}", f"{a['firstName']} {a['lastName']}", a['position'], a['status'], "-", "-"))

    def _run_screening(self):
        apps = load_applicants()
        if not apps:
            messagebox.showwarning("Empty", "No applicants to screen.")
            return

        for i in self.tree.get_children(): self.tree.delete(i)

        count = 0
        for a in apps:
            old_status = a["status"]
            a["score"], a["status"] = compute_score(a)
            if old_status != a["status"]: count += 1
            
            # Show first 15 in UI for feedback
            if len(self.tree.get_children()) < 15:
                status_symbol = {"Qualified":"✅","For Review":"⚠️","Disqualified":"❌"}.get(a["status"],"")
                self.tree.insert("", "end", values=(f"#{a['applicantID']}", f"{a['firstName']} {a['lastName']}", a['position'], old_status, f"{a['score']} pts", f"{status_symbol} {a['status']}"))

        save_applicants(apps)
        messagebox.showinfo("Screening Complete", f"AI Screening finished.\n{len(apps)} applicants evaluated.\n{count} status changes detected and synced.")
