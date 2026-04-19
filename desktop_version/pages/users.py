import tkinter as tk
from tkinter import ttk, messagebox
from theme import *
from data_manager import load_users, delete_user, add_user

class UsersPage:
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
        tk.Label(hdr, text="User Management", font=FONT_TITLE,
                 bg=BG_MAIN, fg=TEXT_PRIMARY).pack(side="left")
        
        tk.Label(hdr, text=" (SYNCED WITH WEB) ", font=FONT_SMALL,
                 bg=BG_MAIN, fg=WARNING).pack(side="left", padx=10)

        # Content split
        content = tk.Frame(container, bg=BG_MAIN)
        content.pack(fill="both", expand=True)

        # ── LEFT: User List ────────────────
        left = tk.Frame(content, bg=BG_CARD, padx=20, pady=20)
        left.pack(side="left", fill="both", expand=True, marginRight=20)
        
        cols = ("ID", "Full Name", "Username", "Role")
        self.tree = ttk.Treeview(left, columns=cols, show="headings", style="GT.Treeview", height=12)
        for col in cols:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=100 if col != "Full Name" else 150)
        self.tree.pack(fill="both", expand=True)

        # ── RIGHT: Add User Form ───────────
        right = tk.Frame(content, bg=BG_CARD, width=300, padx=20, pady=20)
        right.pack(side="left", fill="y", padx=(20, 0))
        
        tk.Label(right, text="ADD NEW USER", font=FONT_H1, bg=BG_CARD, fg=ACCENT).pack(anchor="w", pady=(0, 20))
        
        self.name_var = self._field(right, "Full Name")
        self.user_var = self._field(right, "Username")
        self.pass_var = self._field(right, "Initial Password")
        
        tk.Label(right, text="ROLE", font=FONT_SMALL, bg=BG_CARD, fg=TEXT_MUTED).pack(anchor="w", pady=(10, 2))
        self.role_var = tk.StringVar(value="Staff")
        role_opt = tk.OptionMenu(right, self.role_var, "Admin", "Staff")
        role_opt.config(bg=BG_INPUT, fg=TEXT_PRIMARY, relief="flat")
        role_opt.pack(fill="x", pady=(0, 20))

        tk.Button(right, text="Create User Account", font=FONT_H3, bg=ACCENT, fg=TEXT_DARK,
                  relief="flat", pady=10, cursor="hand2", command=self._add_user).pack(fill="x")
        
        tk.Label(right, text="Note: Account created here can\nbe used to login to the web version.", 
                 font=FONT_SMALL, bg=BG_CARD, fg=TEXT_MUTED, justify="center").pack(pady=20)

        self._refresh()

    def _field(self, parent, label):
        tk.Label(parent, text=label.upper(), font=FONT_SMALL, bg=BG_CARD, fg=TEXT_MUTED).pack(anchor="w", pady=(10, 2))
        v = tk.StringVar()
        tk.Entry(parent, textvariable=v, bg=BG_INPUT, fg=TEXT_PRIMARY, relief="flat", insertbackground=TEXT_PRIMARY).pack(fill="x", ipady=3)
        return v

    def _refresh(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        for u in load_users():
            self.tree.insert("", "end", values=(u["userID"], u["fullName"], u["username"], u["role"]))

    def _add_user(self):
        if not all([self.name_var.get(), self.user_var.get(), self.pass_var.get()]):
            messagebox.showerror("Error", "All fields are required.")
            return
        
        success, msg = add_user(self.name_var.get(), self.user_var.get(), self.pass_var.get(), self.role_var.get())
        if success:
            messagebox.showinfo("Success", msg)
            self._refresh()
            self.name_var.set(""); self.user_var.set(""); self.pass_var.set("")
        else:
            messagebox.showerror("Error", msg)
