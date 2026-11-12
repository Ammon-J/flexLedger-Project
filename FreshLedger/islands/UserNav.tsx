import { useEffect, useState } from "preact/hooks";

interface User {
  firstName?: string;
}

export default function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async (response) => response.ok ? await response.json() : null)
      .then((result: { user?: User } | null) => setUser(result?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) {
        throw new Error("Logout request failed.");
      }
      globalThis.location.assign("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  }

  return (
    <nav class="desktop-nav">
      <a class="active" href="/">Dashboard</a>
      <button
        class="logout-button"
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
      <span class="user-greeting">
        Hello, {user?.firstName ?? "there"}
      </span>
    </nav>
  );
}
