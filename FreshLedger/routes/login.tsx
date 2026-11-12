import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import { BrandMark } from "../components/BrandMark.tsx";
import AuthForm from "../islands/AuthForm.tsx";
export default define.page(function Login() {
  return (
    <div class="app-shell auth-page">
      <Head>
        <title>Log in | FlexLedger</title>
      </Head>
      <main class="phone-page">
        <header class="auth-header">
          <BrandMark />
          <span class="step-label">01 · LOGIN</span>
        </header>
        <section class="auth-content login-card">
          <div class="eyebrow">WELCOME BACK</div>
          <h1>Welcome back.</h1>
          <p class="intro">
            Keep every delivery mile and vehicle expense in one place.
          </p>
          <AuthForm mode="login" />
          <p class="switch-prompt">
            New to FlexLedger? <a href="/signup">Create an account</a>
          </p>
          <p class="privacy-note">
            ☑ &nbsp; Login is safe. Once signed in, your ledger is available
            offline on this device.
          </p>
        </section>
        <p class="screen-footer">Your miles. Your records. Your business.</p>
      </main>
    </div>
  );
});
