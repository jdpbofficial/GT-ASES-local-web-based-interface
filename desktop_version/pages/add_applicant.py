import tkinter as tk
from tkinter import messagebox
from theme import *
from data_manager import add_applicant

class AddApplicantPage:
    def __init__(self, parent, user, app):
        self.parent = parent
        self.user   = user
        self.app    = app
        self.vars   = {}
        self._build()

    def _build(self):
        container = tk.Frame(self.parent, bg=BG_MAIN, padx=36, pady=32)
        container.pack(fill="both", expand=True)

        # Header
        hdr = tk.Frame(container, bg=BG_MAIN)
        hdr.pack(fill="x", pady=(0, 24))
        tk.Label(hdr, text="Add New Applicant", font=FONT_TITLE,
                 bg=BG_MAIN, fg=TEXT_PRIMARY).pack(side="left")

        # Form with columns
        form_frame = tk.Frame(container, bg=BG_CARD, padx=30, pady=30, bd=1, relief="flat")
        form_frame.pack(fill="x")

        # ── Column 1 ────────────────
        col1 = tk.Frame(form_frame, bg=BG_CARD)
        col1.grid(row=0, column=0, sticky="nw", padx=(0, 40))
        
        self._create_field(col1, "First Name", "firstName")
        self._create_field(col1, "Last Name", "lastName")
        self._create_field(col1, "Email", "email")
        self._create_field(col1, "Contact No.", "contact")
        
        # ── Column 2 ────────────────
        col2 = tk.Frame(form_frame, bg=BG_CARD)
        col2.grid(row=0, column=1, sticky="nw")
        
        self._create_dropdown(col2, "Position", "position", POSITIONS)
        self._create_dropdown(col2, "Education", "education", EDUCATION_LEVELS)
        self._create_dropdown(col2, "Experience", "experience", EXPERIENCE_LEVELS)
        
        # ── Bottom Section (Skills & Certs) ───────────
        tk.Frame(container, bg=BORDER, height=1).pack(fill="x", pady=20)
        
        lists_frame = tk.Frame(container, bg=BG_MAIN)
        lists_frame.pack(fill="x")
        
        self.skills_vars = self._create_checklist(lists_frame, "Skills Selection", SKILLS_LIST, 0)
        self.certs_vars = self._create_checklist(lists_frame, "Certifications Selection", CERTS_LIST, 1)

        # ── Save Button ─────────────────
        tk.Button(container, text=" 💾  Save Applicant Record ", font=FONT_H2,
                  bg=ACCENT, fg=TEXT_DARK, relief="flat", padx=30, pady=12,
                  cursor="hand2", command=self._save).pack(pady=30)

    def _create_field(self, parent, label, key):
        tk.Label(parent, text=label.upper(), font=FONT_SMALL, bg=BG_CARD, fg=TEXT_MUTED).pack(anchor="w", pady=(10, 2))
        var = tk.StringVar()
        entry = tk.Entry(parent, textvariable=var, font=FONT_BODY, bg=BG_INPUT, fg=TEXT_PRIMARY,
                         insertbackground=TEXT_PRIMARY, relief="flat", width=30)
        entry.pack(pady=(0, 10), ipady=3)
        self.vars[key] = var

    def _create_dropdown(self, parent, label, key, options):
        tk.Label(parent, text=label.upper(), font=FONT_SMALL, bg=BG_CARD, fg=TEXT_MUTED).pack(anchor="w", pady=(10, 2))
        var = tk.StringVar(value=options[0])
        opt = tk.OptionMenu(parent, var, *options)
        opt.config(font=FONT_BODY, bg=BG_INPUT, fg=TEXT_PRIMARY, activebackground=BG_HOVER, relief="flat", width=25)
        opt["menu"].config(bg=BG_CARD, fg=TEXT_PRIMARY)
        opt.pack(pady=(0, 10))
        self.vars[key] = var

    def _create_checklist(self, parent, title, items, col):
        frame = tk.Frame(parent, bg=BG_CARD, padx=20, pady=20)
        frame.grid(row=0, column=col, sticky="nsew", padx=(0 if col==0 else 20, 20 if col==0 else 0))
        parent.columnconfigure(col, weight=1)
        
        tk.Label(frame, text=title, font=FONT_H2, bg=BG_CARD, fg=ACCENT).pack(anchor="w", pady=(0, 10))
        
        item_frame = tk.Frame(frame, bg=BG_CARD)
        item_frame.pack(fill="x")
        
        vars = {}
        for i, item in enumerate(items):
            v = tk.BooleanVar()
            cb = tk.Checkbutton(item_frame, text=item, variable=v, font=FONT_BODY,
                               bg=BG_CARD, fg=TEXT_SECONDARY, selectcolor=BG_SIDEBAR,
                               activebackground=BG_CARD, activeforeground=ACCENT)
            cb.grid(row=i//2, column=i%2, sticky="w", padx=5, pady=2)
            vars[item] = v
        return vars

    def _save(self):
        # Validate
        for k in ["firstName", "lastName", "email"]:
            if not self.vars[k].get().strip():
                messagebox.showerror("Error", f"{k} is required.")
                return

        payload = {
            "firstName":   self.vars["firstName"].get(),
            "lastName":    self.vars["lastName"].get(),
            "email":       self.vars["email"].get(),
            "contact":     self.vars["contact"].get(),
            "age":         25, # Default or add field
            "gender":      "Male",
            "position":    self.vars["position"].get(),
            "education":   self.vars["education"].get(),
            "experience":  self.vars["experience"].get(),
            "skills":      [item for item, var in self.skills_vars.items() if var.get()],
            "certifications": [item for item, var in self.certs_vars.items() if var.get()]
        }
        
        add_applicant(payload)
        messagebox.showinfo("Success", "Applicant saved and synced successfully!")
        self.app.navigate("Applicants")
