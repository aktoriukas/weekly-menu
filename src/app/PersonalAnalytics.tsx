"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";

type Choice = "yes" | "no" | null;

const cookieName = "aktoriukas_analytics";
const privacyUrl = "https://www.aktoriukas.com/privacy";

function onPersonalDomain(hostname: string) {
  return hostname === "aktoriukas.com" || hostname.endsWith(".aktoriukas.com");
}

function savedChoice(): Choice {
  const value = document.cookie.match(/(?:^|; )aktoriukas_analytics=(yes|no)(?:;|$)/)?.[1];
  return value === "yes" || value === "no" ? value : null;
}

function publicPage(pathname: string) {
  return pathname === "/";
}

export function PersonalAnalytics() {
  const [choice, setChoice] = useState<Choice | undefined>();

  useEffect(() => {
    const sync = () => setChoice(onPersonalDomain(location.hostname) ? savedChoice() : null);
    sync();
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  if (choice === undefined || !onPersonalDomain(location.hostname)) return null;

  function save(next: Exclude<Choice, null>) {
    document.cookie = `${cookieName}=${next}; Domain=aktoriukas.com; Path=/; Max-Age=15552000; SameSite=Lax; Secure`;
    setChoice(savedChoice());
  }

  return (
    <>
      {choice === "yes" && (
        <Analytics
          beforeSend={(event) => {
            if (savedChoice() !== "yes") return null;
            try {
              const url = new URL(event.url);
              if (!onPersonalDomain(url.hostname) || !publicPage(url.pathname)) return null;
              return { ...event, url: url.origin + url.pathname };
            } catch {
              return null;
            }
          }}
        />
      )}
      <aside
        aria-label="Analytics privacy choices"
        style={{ position: "fixed", right: 12, bottom: 12, zIndex: 1000, maxWidth: 390, padding: 12, background: "#fff", color: "#111", border: "1px solid #555", boxShadow: "0 2px 12px #0003", font: "13px/1.4 system-ui, sans-serif" }}
      >
        {choice === null && (
          <p style={{ margin: "0 0 8px" }}>
            May we use Vercel Web Analytics to count visits to public pages? It uses no analytics cookies. Your choice applies across aktoriukas.com sites. <a href={privacyUrl}>Privacy details</a>
          </p>
        )}
        {choice !== null && <a href={privacyUrl} style={{ marginRight: 12 }}>Privacy details</a>}
        {choice !== "yes" && <button type="button" onClick={() => save("yes")} style={{ marginRight: 8, padding: "5px 8px", color: "#111", background: "#fff", border: "1px solid #111", cursor: "pointer" }}>Allow analytics</button>}
        {choice !== "no" && <button type="button" onClick={() => save("no")} style={{ padding: "5px 8px", color: "#111", background: "#fff", border: "1px solid #111", cursor: "pointer" }}>Decline analytics</button>}
      </aside>
    </>
  );
}
