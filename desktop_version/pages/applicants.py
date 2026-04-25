import tkinter as tk
from tkinter import ttk, messagebox
from theme import *
from data_manager import load_applicants, delete_applicant, search_applicants

class ApplicantsPage:
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
        tk.Label(hdr, text="Applicants Directory", font=FONT_TITLE,
                 bg=BG_MAIN, fg=TEXT_PRIMARY).pack(side="left")
        
        btn_frame = tk.Frame(hdr, bg=BG_MAIN)
        btn_frame.pack(side="right")
        
        tk.Button(btn_frame, text=" ➕  Add New ", font=FONT_H3,
                  bg=SUCCESS, fg=TEXT_WHITE, relief="flat", padx=15, pady=8,
                  cursor="hand2", command=lambda: self.app.navigate("Add Applicant")).pack(side="right")

        # Search bar
        search_frame = tk.Frame(container, bg=BG_CARD, padx=16, pady=12)
        search_frame.pack(fill="x", pady=(0, 20))
        
        tk.Label(search_frame, text="🔍", font=("Segoe UI", 12), bg=BG_CARD, fg=ACCENT).pack(side="left", padx=(0, 8))
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", self._on_search)
        search_entry = tk.Entry(search_frame, textvariable=self.search_var, font=FONT_BODY,
                                bg=BG_INPUT, fg=TEXT_PRIMARY, insertbackground=TEXT_PRIMARY,
                                relief="flat", borderwidth=0)
        search_entry.pack(side="left", fill="x", expand=True)
        tk.Label(search_frame, text="Search by name, ID, or position", font=FONT_SMALL,
                 bg=BG_CARD, fg=TEXT_MUTED).pack(side="right", padx=10)

        # Table
        table_container = tk.Frame(container, bg=BG_CARD)
        table_container.pack(fill="both", expand=True)

        style = ttk.Style()
        style.configure("GT.Treeview", background=BG_CARD, foreground=TEXT_PRIMARY, 
                        fieldbackground=BG_CARD, rowheight=40, font=FONT_BODY)
        style.configure("GT.Treeview.Heading", background=BG_SIDEBAR, foreground=ACCENT, 
                        font=FONT_H2, relief="flat")

        cols = ("ID", "Name", "Position", "Score", "Status", "Email")
        self.tree = ttk.Treeview(table_container, columns=cols, show="headings", style="GT.Treeview")
        
        widths = [80, 180, 220, 80, 120, 220]
        for col, w in zip(cols, widths):
            self.tree.heading(col, text=col)
            self.tree.column(col, width=w, anchor="center" if col in ("ID", "Score", "Status") else "w")

        self.tree.pack(side="left", fill="both", expand=True)
        
        vsb = ttk.Scrollbar(table_container, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=vsb.set)
        vsb.pack(side="right", fill="y")

        # Context Menu
        self.menu = tk.Menu(self.parent, tearoff=0, bg=BG_CARD, fg=TEXT_PRIMARY, 
                            activebackground=ACCENT, font=FONT_BODY)
        self.menu.add_command(label="View Details", command=self._view_details)
        self.menu.add_command(label="Delete Record", command=self._delete_record)
        self.tree.bind("<Button-3>", self._show_context_menu)

        self._refresh_table()

    def _on_search(self, *args):
        query = self.search_var.get()
        if len(query) > 1:
            data = search_applicants(query)
            self._fill_table(data)
        elif not query:
            self._refresh_table()

    def _refresh_table(self):
        data = load_applicants()
        self._fill_table(data)

    def _fill_table(self, data):
        for i in self.tree.get_children():
            self.tree.delete(i)
        
        for a in sorted(data, key=lambda x: x["applicantID"], reverse=True):
            status_symbol = {"Qualified":"✅","For Review":"⚠️","Disqualified":"❌"}.get(a["status"],"")
            self.tree.insert("", "end", values=(
                f"#{a['applicantID']}",
                f"{a['firstName']} {a['lastName']}",
                a["position"],
                f"{a['score']} pts",
                f"{status_symbol} {a['status']}",
                a["email"]
            ))

    def _show_context_menu(self, event):
        item = self.tree.identify_row(event.y)
        if item:
            self.tree.selection_set(item)
            self.menu.post(event.x_root, event.y_root)

    def _view_details(self):
        sel = self.tree.selection()
        if not sel: return
        
        # Extract ID from string like "#1001"
        app_id_str = self.tree.item(sel[0])["values"][0].replace("#","")
        app_id = int(app_id_str)
        
        # Load full data to get the latest details
        data = load_applicants()
        applicant = next((a for a in data if a["applicantID"] == app_id), None)
        
        if applicant:
            ApplicantDetailWindow(self.parent, applicant)
        else:
            messagebox.showerror("Error", "Could not find applicant record.")

    def _delete_record(self):
        sel = self.tree.selection()
        if not sel: return
        app_id_str = self.tree.item(sel[0])["values"][0].replace("#","")
        app_id = int(app_id_str)
        
        if messagebox.askyesno("Confirm Delete", f"Are you sure you want to delete Applicant #{app_id}?\nThis action will sync across all platforms."):
            delete_applicant(app_id)
            self._refresh_table()
            messagebox.showinfo("Success", "Record deleted successfully.")

class ApplicantDetailWindow:
    def __init__(self, parent, applicant):
        # Create a top-level window
        self.window = tk.Toplevel(parent)
        self.window.title(f"Applicant Details - #{applicant['applicantID']}")
        self.window.geometry("700x680")
        self.window.configure(bg=BG_MAIN)
        self.window.resizable(False, False)
        self.window.grab_set() # Make it modal

        self.app = applicant
        self._build()

    def _build(self):
        # ── HEADER ──────────────────────────────────────────────────────────
        header = tk.Frame(self.window, bg=BG_SIDEBAR, padx=30, pady=20)
        header.pack(fill="x")
        
        status_color = STATUS_COLORS.get(self.app["status"], ACCENT)
        
        title_frame = tk.Frame(header, bg=BG_SIDEBAR)
        title_frame.pack(side="left")
        
        tk.Label(title_frame, text=f"{self.app['firstName']} {self.app['lastName']}", 
                 font=FONT_TITLE, bg=BG_SIDEBAR, fg=TEXT_PRIMARY).pack(anchor="w")
        tk.Label(title_frame, text=f"Applicant ID: #{self.app['applicantID']}  |  Applied: {self.app['dateApplied']}", 
                 font=FONT_BODY, bg=BG_SIDEBAR, fg=TEXT_MUTED).pack(anchor="w")

        tk.Label(header, text=self.app["status"].upper(), font=FONT_H2,
                 bg=status_color, fg=TEXT_WHITE, padx=12, pady=6).pack(side="right")

        # ── MAIN CONTAINER ──────────────────────────────────────────────────
        container = tk.Frame(self.window, bg=BG_MAIN, padx=30, pady=25)
        container.pack(fill="both", expand=True)

        # 1. Personal & Contact
        sec1 = tk.Frame(container, bg=BG_MAIN)
        sec1.pack(fill="x", pady=(0, 20))
        
        self._label_value(sec1, "Position Applied:", self.app["position"], 0, 0, col_span=2)
        self._label_value(sec1, "Email Address:", self.app["email"], 1, 0)
        self._label_value(sec1, "Contact Number:", self.app["contact"], 1, 1)
        self._label_value(sec1, "Age:", str(self.app["age"]), 2, 0)
        self._label_value(sec1, "Gender:", self.app["gender"], 2, 1)

        tk.Frame(container, height=1, bg=BORDER).pack(fill="x", pady=10)

        # 2. Qualifications
        sec2 = tk.Frame(container, bg=BG_MAIN)
        sec2.pack(fill="x", pady=10)
        
        self._label_value(sec2, "Education Level:", self.app["education"], 0, 0)
        self._label_value(sec2, "Years of Experience:", self.app["experience"], 0, 1)
        
        # Skills Tags
        tk.Label(sec2, text="Technical Skills:", font=FONT_H2, bg=BG_MAIN, fg=ACCENT).grid(row=2, column=0, sticky="w", pady=(15, 5))
        skills_frame = tk.Frame(sec2, bg=BG_MAIN)
        skills_frame.grid(row=3, column=0, columnspan=2, sticky="w")
        
        skills = self.app.get("skills", [])
        if skills:
            for skill in skills:
                tk.Label(skills_frame, text=skill, font=FONT_SMALL, bg=BG_CARD, fg=TEXT_PRIMARY,
                         padx=8, pady=4).pack(side="left", padx=(0, 6), pady=2)
        else:
            tk.Label(skills_frame, text="No skills listed", font=FONT_BODY, bg=BG_MAIN, fg=TEXT_MUTED).pack(side="left")

        # Certifications Tags
        tk.Label(sec2, text="Certifications:", font=FONT_H2, bg=BG_MAIN, fg=ACCENT).grid(row=4, column=0, sticky="w", pady=(15, 5))
        certs_frame = tk.Frame(sec2, bg=BG_MAIN)
        certs_frame.grid(row=5, column=0, columnspan=2, sticky="w")
        
        certs = self.app.get("certifications", [])
        if certs:
            for cert in certs:
                tk.Label(certs_frame, text=cert, font=FONT_SMALL, bg=BG_INPUT, fg=SUCCESS,
                         padx=8, pady=4).pack(side="left", padx=(0, 6), pady=2)
        else:
            tk.Label(certs_frame, text="No certifications listed", font=FONT_BODY, bg=BG_MAIN, fg=TEXT_MUTED).pack(side="left")

        # 3. Final Scoring
        tk.Frame(container, height=1, bg=BORDER).pack(fill="x", pady=20)
        
        score_frame = tk.Frame(container, bg=BG_CARD, padx=25, pady=20)
        score_frame.pack(fill="x")
        
        tk.Label(score_frame, text="AI SCREENING EVALUATION RESULT", font=FONT_H3, bg=BG_CARD, fg=TEXT_SECONDARY).pack(anchor="w")
        
        inner_score = tk.Frame(score_frame, bg=BG_CARD)
        inner_score.pack(fill="x", pady=10)
        
        tk.Label(inner_score, text=str(self.app["score"]), font=FONT_STAT, bg=BG_CARD, fg=ACCENT).pack(side="left")
        tk.Label(inner_score, text="TOTAL PTS", font=FONT_H3, bg=BG_CARD, fg=TEXT_MUTED).pack(side="left", padx=10, pady=(12, 0))

        # ── FOOTER ──────────────────────────────────────────────────────────
        footer = tk.Frame(self.window, bg=BG_SIDEBAR, pady=15)
        footer.pack(fill="x", side="bottom")
        
        tk.Button(footer, text="  CLOSE DETAILS  ", font=FONT_NAV, bg=BG_HOVER, fg=TEXT_PRIMARY,
                  relief="flat", cursor="hand2", padx=20, pady=8, 
                  command=self.window.destroy).pack()

    def _label_value(self, parent, label, value, row, col, col_span=1):
        f = tk.Frame(parent, bg=BG_MAIN)
        f.grid(row=row, column=col, columnspan=col_span, sticky="w", padx=(0, 40), pady=10)
        tk.Label(f, text=label, font=FONT_SMALL, bg=BG_MAIN, fg=TEXT_MUTED).pack(anchor="w")
        tk.Label(f, text=value, font=FONT_H2, bg=BG_MAIN, fg=TEXT_PRIMARY).pack(anchor="w")
