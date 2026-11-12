import { useState } from "preact/hooks";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = event.currentTarget as HTMLFormElement;
    setSubmitting(true);
    try {
      const response = await fetch(
        isSignup ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(
            Object.fromEntries(new FormData(form).entries()),
          ),
        },
      );
      const result = await response.json() as { message?: string };
      if (!response.ok) {
        setError(result.message ?? "The request could not be completed.");
        return;
      }
      setMessage(result.message ?? "Success.");
      globalThis.location.assign("/");
    } catch {
      setError("The server could not be reached. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form class="auth-form" onSubmit={handleSubmit}>
      {isSignup && (
        <div class="name-fields">
          <label>
            First name<input
              name="firstName"
              type="text"
              placeholder="Alex"
              required
            />
          </label>
          <label>
            Last name<input
              name="lastName"
              type="text"
              placeholder="Morgan"
              required
            />
          </label>
        </div>
      )}
      <label>
        Email address<span class="input-wrap">
          <input
            name="email"
            type="email"
            placeholder="alex.morgan@example.com"
            required
          />
          <span aria-hidden="true">✉</span>
        </span>
      </label>
      <label>
        Password<span class="input-wrap">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            minLength={8}
            required
          />
          <button
            class="input-action"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "◉" : "◌"}
          </button>
        </span>
      </label>
      {isSignup && (
        <>
          <p class="field-help">Use at least 8 characters and one number.</p>
          <label>
            Confirm password<span class="input-wrap">
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••••••"
                minLength={8}
                required
              />
              <span aria-hidden="true">◌</span>
            </span>
          </label>
          <label>
            Default vehicle <span class="optional">(optional)</span>
            <input
              name="defaultVehicle"
              type="text"
              placeholder="2017 Ford Fusion SE 2.0L AWD"
            />
          </label>
          <p class="field-help">You can add or change your vehicle later.</p>
        </>
      )}
      {!isSignup && <a class="forgot-link" href="/login">Forgot password?</a>}
      <button class="primary-button" type="submit" disabled={submitting}>
        {submitting
          ? "Please wait..."
          : isSignup
          ? "Create account"
          : "→  Log in"}
      </button>
      {message && <p class="form-message" role="status">{message}</p>}
      {error && <p class="form-error" role="alert">{error}</p>}
    </form>
  );
}
