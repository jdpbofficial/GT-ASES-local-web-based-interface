import tkinter as tk
from theme import *

class ScreeningPage:
    def __init__(self, parent, user, app):
        container = tk.Frame(parent, bg=BG_MAIN, padx=36, pady=32)
        container.pack(fill="both", expand=True)

        tk.Label(container, text="Advanced Screening", font=FONT_TITLE,
                 bg=BG_MAIN, fg=TEXT_PRIMARY).pack(anchor="w", pady=(0, 20))
        
        card = tk.Frame(container, bg=BG_CARD, padx=40, pady=40)
        card.pack(fill="x")
        
        tk.Label(card, text="🔍", font=("Segoe UI", 48), bg=BG_CARD).pack(pady=20)
        tk.Label(card, text="AI Screening Module (Desktop Port)", font=FONT_H1, bg=BG_CARD, fg=ACCENT).pack()
        tk.Label(card, text="Note: Full automated screening logic is managed by the central server.\nResults are synced automatically with the web dashboard.", 
                 font=FONT_BODY, bg=BG_CARD, fg=TEXT_SECONDARY, pady=10).pack()

class ExportPage:
    def __init__(self, parent, user, app):
        container = tk.Frame(parent, bg=BG_MAIN, padx=36, pady=32)
        container.pack(fill="both", expand=True)

        tk.Label(container, text="Data Export & Reports", font=FONT_TITLE,
                 bg=BG_MAIN, fg=TEXT_PRIMARY).pack(anchor="w", pady=(0, 20))
        
        card = tk.Frame(container, bg=BG_CARD, padx=40, pady=40)
        card.pack(fill="x")
        
        tk.Label(card, text="📤", font=("Segoe UI", 48), bg=BG_CARD).pack(pady=20)
        tk.Label(card, text="Report Generation", font=FONT_H1, bg=BG_CARD, fg=ACCENT).pack()
        tk.Label(card, text="Export your synchronized data to CSV or Excel formats for external school reporting.", 
                 font=FONT_BODY, bg=BG_CARD, fg=TEXT_SECONDARY, pady=10).pack()
        
        tk.Button(card, text=" Generate Full Census Report (CSV) ", font=FONT_H2, bg=ACCENT, fg=TEXT_DARK,
                  relief="flat", padx=20, pady=12, cursor="hand2").pack(pady=20)
