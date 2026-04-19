import tkinter as tk
from tkinter import messagebox, filedialog
import os
from theme import *
from data_manager import export_to_csv, DATA_DIR

class ExportPage:
    def __init__(self, parent, user, app):
        self.parent = parent
        self.user   = user
        self.app    = app
        self._build()

    def _build(self):
        container = tk.Frame(self.parent, bg=BG_MAIN, padx=36, pady=32)
        container.pack(fill="both", expand=True)

        tk.Label(container, text="Data Export & Reports", font=FONT_TITLE,
                 bg=BG_MAIN, fg=TEXT_PRIMARY).pack(anchor="w", pady=(0, 24))
        
        # Action Cards
        self._action_card(container, "📤", "Qualified Applicants (CSV)", 
                          "Generates a list of all candidates who passed the 80-point threshold.",
                          lambda: self._export(True))
        
        self._action_card(container, "📊", "Full Database Backup", 
                          "Exports every record in the synchronized database to a master CSV file.",
                          lambda: self._export(False))

    def _action_card(self, parent, icon, title, desc, command):
        card = tk.Frame(parent, bg=BG_CARD, padx=30, pady=30, bd=1, relief="flat")
        card.pack(fill="x", pady=(0, 20))
        
        tk.Label(card, text=icon, font=("Segoe UI", 32), bg=BG_CARD).pack(side="left", padx=(0, 20))
        
        info = tk.Frame(card, bg=BG_CARD)
        info.pack(side="left", fill="both", expand=True)
        tk.Label(info, text=title, font=FONT_H1, bg=BG_CARD, fg=ACCENT).pack(anchor="w")
        tk.Label(info, text=desc, font=FONT_BODY, bg=BG_CARD, fg=TEXT_SECONDARY).pack(anchor="w")
        
        tk.Button(card, text=" Export Now ", font=FONT_H3, bg=SUCCESS, fg=TEXT_WHITE,
                  relief="flat", padx=15, pady=8, cursor="hand2", command=command).pack(side="right")

    def _export(self, qualified_only):
        filename = "applicants_export.csv" if not qualified_only else "qualified_applicants.csv"
        path = filedialog.asksaveasfilename(defaultextension=".csv", initialfile=filename)
        
        if path:
            try:
                count = export_to_csv(path, qualified_only=qualified_only)
                messagebox.showinfo("Export Success", f"Successfully exported {count} records to:\n{path}")
            except Exception as e:
                messagebox.showerror("Export Error", f"Failed to export data: {str(e)}")
