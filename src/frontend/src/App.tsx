import { type FormEvent, useEffect, useState } from "react";

const apiBase =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "https://api.localhost";

type ServiceState = "idle" | "ok" | "down";
let didIncrementDuringThisPageLoad = false;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function postJson<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`${res.status}`);
  }
  return res.json() as Promise<T>;
}

export default function App() {
  const [backend, setBackend] = useState<ServiceState>("idle");
  const [db, setDb] = useState<ServiceState>("idle");
  const [cache, setCache] = useState<ServiceState>("idle");
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const health = await fetchJson<{ status?: string }>("/health");
        if (!cancelled) {
          setBackend(health.status === "ok" ? "ok" : "down");
        }
      } catch {
        if (!cancelled) setBackend("down");
      }

      try {
        const dbRes = await fetchJson<{ status?: string }>("/db");
        if (!cancelled) {
          setDb(dbRes.status === "connected" ? "ok" : "down");
        }
      } catch {
        if (!cancelled) setDb("down");
      }

      try {
        const cacheRes = await fetchJson<{ status?: string; visits?: number }>("/cache");
        if (!cancelled) {
          const ok =
            cacheRes.status === "ok" && typeof cacheRes.visits === "number";
          setCache(ok ? "ok" : "down");
          if (ok) setVisits(cacheRes.visits ?? 0);
        }
      } catch {
        if (!cancelled) {
          setCache("down");
          setVisits(null);
        }
      }
    }

    async function incrementAndLoad() {
      if (didIncrementDuringThisPageLoad) {
        await load();
        return;
      }
      didIncrementDuringThisPageLoad = true;

      try {
        const incrementRes = await postJson<{ status?: string; visits?: number }>(
          "/cache/increment"
        );
        if (!cancelled) {
          const ok =
            incrementRes.status === "ok" &&
            typeof incrementRes.visits === "number";
          setCache(ok ? "ok" : "down");
          if (ok) setVisits(incrementRes.visits ?? 0);
        }
      } catch {
        if (!cancelled) {
          setCache("down");
          setVisits(null);
        }
      }

      await load();
    }

    void incrementAndLoad();
    const id = window.setInterval(load, 50_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <main className="page">
      <h1>Dashboard</h1>

      <section className="card" aria-label="Statut des services">
        <h2>Statut</h2>
        <ul className="status-list">
          <li>
            {labelIcon(backend)} Backend : {labelText(backend)}
          </li>
          <li>
            {labelIcon(db)} Base de données : {labelText(db)}
          </li>
          <li>
            {labelIcon(cache)} Cache : {labelText(cache)}
          </li>
        </ul>
        {visits !== null && (
          <p className="visits">
            Compteur de visites (Redis) : <strong>{visits}</strong>
          </p>
        )}
      </section>

      <section className="card" aria-label="Contact">
        <h2>Contact</h2>
        <ContactForm apiBase={apiBase} />
      </section>
    </main>
  );
}

function labelIcon(state: ServiceState): string {
  if (state === "ok") return "🟢";
  if (state === "down") return "🔴";
  return "⚪";
}

function labelText(state: ServiceState): string {
  if (state === "ok") return "OK";
  if (state === "down") return "DOWN";
  return "…";
}

function ContactForm({ apiBase }: { apiBase: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setPending(true);
    try {
      const res = await fetch(`${apiBase}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (res.ok && data.success) {
        setFeedback("Message envoyé (voir Mailpit).");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setFeedback(data.error ?? "Envoi impossible.");
      }
    } catch {
      setFeedback("Erreur réseau.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label>
        Nom
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>
      <label>
        Message
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
        />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer"}
      </button>
      {feedback && <p className="feedback">{feedback}</p>}
    </form>
  );
}
