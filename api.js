/* K-Connect API layer. Calls GET /api/guest?room={number}.
 * Falls back to embedded mock data when the endpoint isn't wired up. */
(function () {
    const CACHE_KEY = "kc_profile_cache";
    const CACHE_TTL_MS = 5 * 60 * 1000;

    function readCache(room) {
        try {
            const raw = localStorage.getItem(CACHE_KEY + ":" + room);
            if (!raw) return null;
            const { data, at } = JSON.parse(raw);
            if (Date.now() - at > CACHE_TTL_MS) return null;
            return data;
        } catch { return null; }
    }

    function writeCache(room, data) {
        try {
            localStorage.setItem(CACHE_KEY + ":" + room, JSON.stringify({ data, at: Date.now() }));
        } catch {}
    }

    async function fetchLive(room) {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        try {
            const res = await fetch(`/api/guest?room=${encodeURIComponent(room)}`, {
                signal: controller.signal,
                headers: { "Accept": "application/json" }
            });
            if (!res.ok) return { ok: false, status: res.status };
            return { ok: true, data: await res.json() };
        } catch {
            return { ok: false, status: 0 };
        } finally {
            clearTimeout(t);
        }
    }

    async function getGuest(room, { force = false } = {}) {
        if (!force) {
            const cached = readCache(room);
            if (cached) return { data: cached, source: "cache" };
        }

        const live = await fetchLive(room);
        if (live.ok && live.data) {
            writeCache(room, live.data);
            return { data: live.data, source: "live" };
        }

        const mock = (window.__MOCK_GUESTS__ || {})[String(room)];
        if (mock) {
            writeCache(room, mock);
            return { data: mock, source: "mock" };
        }

        return { data: null, source: "none" };
    }

    function saveLog(entry) {
        try {
            const key = "kc_logs";
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            list.push(entry);
            localStorage.setItem(key, JSON.stringify(list));
        } catch {}

        try {
            fetch("/api/kconnect-record", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry)
            }).catch(() => {});
        } catch {}
    }

    function authenticate(email, pin) {
        const staff = (window.__MOCK_STAFF__ || {})[String(email || "").toLowerCase().trim()];
        if (!staff) return { ok: false, reason: "unknown" };
        if (staff.pin !== String(pin).trim()) return { ok: false, reason: "pin" };
        return { ok: true, user: { email, name: staff.name, role: staff.role } };
    }

    window.KCApi = { getGuest, saveLog, authenticate };
})();
