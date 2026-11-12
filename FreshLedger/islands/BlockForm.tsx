import { useState } from "preact/hooks";

export default function BlockForm() {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: Event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const form = event.currentTarget as HTMLFormElement;
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      if (!response.ok) {
        const result = await response.json() as { message?: string };
        setError(result.message ?? "The block could not be saved.");
        return;
      }
      globalThis.location.assign("/");
    } catch {
      setError("The server could not be reached. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form class="auth-form block-form" onSubmit={submit}>
      <label>
        Date<input name="date" type="date" required />
      </label>
      <div class="name-fields">
        <label>
          Start odometer<input
            name="startOdometer"
            type="number"
            min="0"
            step="1"
            required
          />
        </label>
        <label>
          End odometer<input
            name="endOdometer"
            type="number"
            min="0"
            step="1"
            required
          />
        </label>
      </div>
      <label>
        Earnings <span class="optional">(optional)</span>
        <input
          name="earnings"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
        />
      </label>
      <label>
        Route notes <span class="optional">(optional)</span>
        <textarea name="routeNotes" maxLength={1000} rows={3} />
      </label>
      <button class="primary-button" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save delivery block"}
      </button>
      {error && <p class="form-error" role="alert">{error}</p>}
    </form>
  );
}
