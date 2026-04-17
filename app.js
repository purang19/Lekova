/* K-Connect — app controller */
(function () {
    const root = document.getElementById("app");

    const state = {
        user: null,
        room: "",
        profile: null,
        log: {
            connected: false,
            mood: null,
            actions: new Set(),
            note: ""
        },
        toastTimer: null
    };

    // ---------- Persistence ----------
    const SESSION_KEY = "kc_session";

    function loadSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch { return null; }
    }

    function saveSession(user) {
        try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch {}
    }

    function clearSession() {
        try { localStorage.removeItem(SESSION_KEY); } catch {}
    }

    // ---------- Helpers ----------
    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

    function mount(id) {
        const tmpl = document.getElementById(id);
        root.innerHTML = "";
        root.appendChild(tmpl.content.cloneNode(true));
    }

    function fmtDate(iso) {
        if (!iso) return "—";
        const d = new Date(iso + "T00:00:00");
        if (isNaN(d)) return iso;
        return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    }

    function nightsText(n) {
        if (n == null) return "—";
        if (n === 0) return "Checks out today";
        if (n === 1) return "1 night left";
        return `${n} nights left`;
    }

    function toast(msg) {
        const el = $("#toast");
        if (!el) return;
        el.textContent = msg;
        el.classList.add("show");
        clearTimeout(state.toastTimer);
        state.toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
    }

    function esc(s) {
        return String(s ?? "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    // ---------- Router ----------
    const routes = {
        login: renderLogin,
        home: renderHome,
        loading: renderLoading,
        profile: renderProfile,
        notfound: renderNotFound
    };

    function go(name, opts) {
        const hash = name + (opts && opts.room ? `?room=${opts.room}` : "");
        if (location.hash !== "#" + hash) {
            location.hash = hash;
        } else {
            handleRoute();
        }
    }

    function handleRoute() {
        const h = location.hash.replace(/^#/, "") || "login";
        const [name, query] = h.split("?");
        const params = {};
        if (query) query.split("&").forEach(kv => {
            const [k, v] = kv.split("=");
            params[k] = decodeURIComponent(v || "");
        });

        if (!state.user && name !== "login") {
            location.hash = "login";
            return;
        }
        if (state.user && name === "login") {
            location.hash = "home";
            return;
        }

        (routes[name] || routes.login)(params);
    }

    window.addEventListener("hashchange", handleRoute);

    // ---------- Login ----------
    function renderLogin() {
        mount("tmpl-login");

        const form = $("#loginForm");
        const emailInput = $("#loginEmail");
        const pinInput = $("#loginPin");
        const rememberInput = $("#loginRemember");

        const remembered = localStorage.getItem("kc_last_email");
        if (remembered) emailInput.value = remembered;

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = emailInput.value.trim().toLowerCase();
            const pin = pinInput.value.trim();

            if (!email || !pin) {
                toast("Enter email and PIN");
                return;
            }

            const res = window.KCApi.authenticate(email, pin);
            if (!res.ok) {
                toast(res.reason === "pin" ? "Incorrect PIN" : "Unknown staff email");
                pinInput.value = "";
                pinInput.focus();
                return;
            }

            state.user = res.user;
            if (rememberInput.checked) {
                saveSession(res.user);
                localStorage.setItem("kc_last_email", email);
            }
            go("home");
        });
    }

    // ---------- Home / Keypad ----------
    function renderHome() {
        mount("tmpl-home");

        // greeting by time-of-day
        const h = new Date().getHours();
        const tod = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
        $("#tod").textContent = tod;
        $("#staffName").textContent = state.user?.name || "Colleague";

        $("#signOutBtn").addEventListener("click", () => {
            clearSession();
            state.user = null;
            go("login");
        });

        state.room = "";
        const digitsEl = $("#roomDigits");
        const findBtn = $("#findBtn");

        function updateDisplay() {
            if (!state.room) {
                digitsEl.textContent = "—";
                digitsEl.classList.add("is-empty");
                findBtn.disabled = true;
            } else {
                digitsEl.textContent = state.room;
                digitsEl.classList.remove("is-empty");
                findBtn.disabled = state.room.length < 2;
            }
        }

        $$(".key").forEach(btn => {
            btn.addEventListener("click", () => {
                const k = btn.dataset.k;
                if (k === "clear") state.room = "";
                else if (k === "back") state.room = state.room.slice(0, -1);
                else if (/^\d$/.test(k) && state.room.length < 4) state.room += k;
                updateDisplay();
            });
        });

        document.addEventListener("keydown", onKeyDownHome);

        findBtn.addEventListener("click", () => {
            if (!state.room) return;
            go("loading", { room: state.room });
        });

        updateDisplay();
    }

    function onKeyDownHome(e) {
        if (!location.hash.startsWith("#home")) {
            document.removeEventListener("keydown", onKeyDownHome);
            return;
        }
        if (/^\d$/.test(e.key) && state.room.length < 4) {
            state.room += e.key;
        } else if (e.key === "Backspace") {
            state.room = state.room.slice(0, -1);
        } else if (e.key === "Enter" && state.room.length >= 2) {
            go("loading", { room: state.room });
            return;
        } else {
            return;
        }
        const digitsEl = $("#roomDigits");
        const findBtn = $("#findBtn");
        if (!digitsEl) return;
        if (state.room) {
            digitsEl.textContent = state.room;
            digitsEl.classList.remove("is-empty");
            findBtn.disabled = state.room.length < 2;
        } else {
            digitsEl.textContent = "—";
            digitsEl.classList.add("is-empty");
            findBtn.disabled = true;
        }
    }

    // ---------- Loading ----------
    async function renderLoading(params) {
        mount("tmpl-loading");
        const room = params.room || state.room;
        if (!room) { go("home"); return; }

        const res = await window.KCApi.getGuest(room);
        if (!res.data) {
            state.profile = null;
            go("notfound", { room });
            return;
        }
        state.profile = res.data;
        state.log = { connected: false, mood: null, actions: new Set(), note: "" };
        go("profile", { room });
    }

    // ---------- Not found ----------
    function renderNotFound(params) {
        mount("tmpl-notfound");
        $("#notfoundRoom").textContent = `Room ${params.room || state.room || "—"}`;
        $$("[data-nav='home']").forEach(b => b.addEventListener("click", () => go("home")));
    }

    // ---------- Profile ----------
    function renderProfile(params) {
        if (!state.profile) { go("home"); return; }
        mount("tmpl-profile");

        const g = state.profile;
        const canSeeXFile = state.user?.role === "gr" || state.user?.role === "management";

        $("#roomChip").textContent = `Room ${g.room}`;
        $$("[data-nav='home']").forEach(b => b.addEventListener("click", () => go("home")));
        $("#refreshBtn").addEventListener("click", async () => {
            toast("Refreshing…");
            const res = await window.KCApi.getGuest(g.room, { force: true });
            if (res.data) {
                state.profile = res.data;
                renderProfile(params);
            }
        });

        renderProfileBody(g, canSeeXFile);
        wireQuickLog(g);
    }

    function renderProfileBody(g, canSeeXFile) {
        const body = $("#profileBody");
        const primary = g.guests[0] || {};
        const names = g.guests.map(p => `${p.firstName} ${p.lastName}`).join(" & ");

        const vipClass = /vvip|owner/i.test(g.vipTier) ? "vip-badge--elite" : "";
        const vipBadge = g.vipTier && g.vipTier !== "Standard"
            ? `<span class="vip-badge ${vipClass}">${esc(g.vipTier)}</span>` : "";

        const signals = (g.signals || []).map(s => {
            const cls = s.type === "good" ? "signal--good"
                : s.critical ? "signal--risk signal--critical" : "signal--risk";
            return `<span class="signal ${cls}"><span class="dot-ind"></span>${esc(s.label)}</span>`;
        }).join("");

        const occasions = (g.occasions || []).length
            ? `<div class="signals">${g.occasions.map(o => `<span class="signal signal--good"><span class="dot-ind"></span>${esc(o)}</span>`).join("")}</div>`
            : "";

        const approach = (g.approachChips || []).map(c =>
            `<button class="approach-chip" type="button">${approachIcon(c.icon)}${esc(c.label)}</button>`
        ).join("");

        const prefs = (g.preferences || []).map(p => `<li>${esc(p)}</li>`).join("");

        const notes = (g.previousNotes || []).length
            ? (g.previousNotes || []).map(n => `
                <div class="note-item">
                    <div class="note-meta">${esc(fmtDate(n.date))} · ${esc(n.by)}</div>
                    <div>${esc(n.text)}</div>
                </div>`).join("")
            : `<div class="note-item muted">No previous notes on file.</div>`;

        const requests = (g.specialRequests || []).length
            ? `<ul class="pref-list">${g.specialRequests.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`
            : `<p class="muted" style="margin:0;">No special requests.</p>`;

        const xfileHtml = (g.xfile && canSeeXFile) ? `
            <div class="xfile">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 3 6v6c0 5 4 9 9 10 5-1 9-5 9-10V6l-9-4z"/><path d="M12 8v5"/><circle cx="12" cy="16" r="0.6" fill="currentColor"/></svg>
                <div>
                    <div class="xfile-title">X-file · GR &amp; Management only</div>
                    <div>${esc(g.xfile.text)}</div>
                </div>
            </div>` : "";

        body.innerHTML = `
            <div class="card card--hero">
                <div class="hero-head">
                    <h2 class="hero-title"><span class="title-prefix">${esc(primary.title || "")}</span>${esc(names)}</h2>
                    ${vipBadge}
                </div>
                <div class="hero-meta">
                    <span>${esc(g.nationality || "—")}</span>
                    <span class="sep">·</span>
                    <span>${esc(g.language || "—")}</span>
                    <span class="sep">·</span>
                    <span>${esc(primary.age || "—")}</span>
                </div>
                ${occasions}
                ${signals ? `<div class="signals">${signals}</div>` : ""}
            </div>

            <div class="card">
                <div class="section-title">Stay <span class="th">การเข้าพัก</span></div>
                <div class="stay-grid">
                    <div class="stay-item">
                        <span class="stay-label">Room type</span>
                        <span class="stay-value">${esc(g.roomType || "—")}</span>
                    </div>
                    <div class="stay-item">
                        <span class="stay-label">Booking source</span>
                        <span class="stay-value">${esc(g.bookingSource || "—")}</span>
                    </div>
                    <div class="stay-item">
                        <span class="stay-label">Arrival</span>
                        <span class="stay-value">${esc(fmtDate(g.arrival))}</span>
                    </div>
                    <div class="stay-item">
                        <span class="stay-label">Departure</span>
                        <span class="stay-value">${esc(fmtDate(g.departure))}</span>
                    </div>
                    <div class="stay-item" style="grid-column: span 2;">
                        <span class="stay-label">Status</span>
                        <span class="stay-value"><span class="accent">${esc(nightsText(g.nightsRemaining))}</span>${g.loyaltyYears ? ` · ${g.loyaltyYears} yr loyalty` : ""}</span>
                    </div>
                </div>
            </div>

            ${xfileHtml}

            ${approach ? `
            <div class="card">
                <div class="section-title">Suggested approach <span class="th">แนวทาง</span></div>
                <div class="approach-list">${approach}</div>
            </div>` : ""}

            <div class="card">
                <div class="section-title">Special requests <span class="th">คำขอพิเศษ</span></div>
                ${requests}
            </div>

            ${prefs ? `
            <div class="card">
                <div class="section-title">Preferences <span class="th">ความชอบ</span></div>
                <ul class="pref-list">${prefs}</ul>
            </div>` : ""}

            <div class="card">
                <div class="section-title">Previous notes <span class="th">บันทึกก่อนหน้า</span></div>
                ${notes}
            </div>
        `;

        $$(".approach-chip", body).forEach(chip => {
            chip.addEventListener("click", () => {
                chip.classList.toggle("is-selected");
                // feed into the quick-log note suggestion
                const txt = chip.textContent.trim();
                const note = $("#noteInput");
                if (note && chip.classList.contains("is-selected")) {
                    note.value = (note.value ? note.value + " · " : "") + txt;
                }
            });
        });
    }

    function approachIcon(kind) {
        const ic = {
            heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
            sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
            glass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l-2 9a4 4 0 0 1-8 0L6 3z"/><path d="M12 16v5"/><path d="M8 21h8"/></svg>',
            sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z"/></svg>',
            leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20c8 0 16-6 16-16-8 0-16 6-16 16z"/><path d="M4 20l10-10"/></svg>',
            cake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16v-8H4v8z"/><path d="M4 16h16"/><path d="M8 12V9M12 12V9M16 12V9"/><path d="M12 5c0-1 1-2 0-3-1 1 0 2 0 3z"/></svg>',
            clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
            shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 3 6v6c0 5 4 9 9 10 5-1 9-5 9-10V6l-9-4z"/></svg>'
        };
        return ic[kind] || ic.sparkle;
    }

    // ---------- Quick log ----------
    function wireQuickLog(g) {
        const connectBtn = $("#btnConnect");
        const moodRow = $("#moodRow");
        const actionRow = $("#actionRow");
        const noteInput = $("#noteInput");
        const saveBtn = $("#saveLogBtn");
        const micBtn = $("#micBtn");

        connectBtn.addEventListener("click", () => {
            state.log.connected = !state.log.connected;
            connectBtn.classList.toggle("is-logged", state.log.connected);
            connectBtn.innerHTML = state.log.connected
                ? `<span class="check-ring" aria-hidden="true"></span> Connected · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} <span class="th">บันทึกแล้ว</span>`
                : `<span class="check-ring" aria-hidden="true"></span> Connection made <span class="th">เชื่อมต่อแล้ว</span>`;
            if (state.log.connected) toast("Connection logged");
        });

        moodRow.addEventListener("click", (e) => {
            const btn = e.target.closest(".chip");
            if (!btn) return;
            $$(".chip", moodRow).forEach(c => c.classList.remove("is-selected"));
            btn.classList.add("is-selected");
            state.log.mood = btn.dataset.mood;
        });

        actionRow.addEventListener("click", (e) => {
            const btn = e.target.closest(".chip");
            if (!btn) return;
            const k = btn.dataset.action;
            if (state.log.actions.has(k)) {
                state.log.actions.delete(k);
                btn.classList.remove("is-selected");
            } else {
                state.log.actions.add(k);
                btn.classList.add("is-selected");
            }
        });

        noteInput.addEventListener("input", (e) => {
            state.log.note = e.target.value;
        });

        // Voice-to-text (Web Speech API, where supported)
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        let rec = null;
        let recTimer = null;
        micBtn.addEventListener("click", () => {
            if (!SR) {
                toast("Voice not supported on this device");
                return;
            }
            if (rec) {
                rec.stop();
                return;
            }
            rec = new SR();
            rec.continuous = false;
            rec.interimResults = true;
            rec.lang = (state.profile?.language || "").toLowerCase().includes("thai") ? "th-TH" : "en-US";
            rec.onresult = (e) => {
                let txt = "";
                for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
                noteInput.value = txt;
                state.log.note = txt;
            };
            rec.onend = () => {
                micBtn.classList.remove("is-recording");
                clearTimeout(recTimer);
                rec = null;
            };
            rec.onerror = () => {
                micBtn.classList.remove("is-recording");
                toast("Couldn't capture voice");
                rec = null;
            };
            rec.start();
            micBtn.classList.add("is-recording");
            recTimer = setTimeout(() => { if (rec) rec.stop(); }, 30000);
        });

        saveBtn.addEventListener("click", () => {
            const entry = {
                id: "kc_" + Date.now(),
                at: new Date().toISOString(),
                staff: state.user?.email,
                staffName: state.user?.name,
                room: g.room,
                guest: g.guests.map(p => `${p.firstName} ${p.lastName}`).join(" & "),
                connected: state.log.connected,
                mood: state.log.mood,
                actions: Array.from(state.log.actions),
                note: state.log.note
            };
            window.KCApi.saveLog(entry);
            toast("Saved to K-Connect Record");
        });
    }

    // ---------- Boot ----------
    function boot() {
        state.user = loadSession();
        if (!location.hash) {
            location.hash = state.user ? "home" : "login";
        }
        handleRoute();

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("sw.js").catch(() => {});
        }
    }

    boot();
})();
