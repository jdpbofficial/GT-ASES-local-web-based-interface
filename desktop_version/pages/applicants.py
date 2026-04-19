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
        # Simple alert for now as full detail view is complex
        app_id_str = self.tree.item(sel[0])["values"][0].replace("#","")
        messagebox.showinfo("Applicant Detail", f"Viewing details for Applicant #{app_id_str}\n(Detailed view coming soon)")

    def _delete_record(self):
        sel = self.tree.selection()
        if not sel: return
        app_id_str = self.tree.item(sel[0])["values"][0].replace("#","")
        app_id = int(app_id_str)
        
        if messagebox.askyesno("Confirm Delete", f"Are you sure you want to delete Applicant #{app_id}?\nThis action will sync across all platforms."):
            delete_applicant(app_id)
            self._refresh_table()
            messagebox.showinfo("Success", "Record deleted successfully.")
