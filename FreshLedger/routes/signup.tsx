import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import { BrandMark } from "../components/BrandMark.tsx";
import AuthForm from "../islands/AuthForm.tsx";
export default define.page(function Signup() {
  return (
    <div class="app-shell auth-page">
      <Head>
        <title>Create account | FlexLedger</title>
      </Head>
      <main class="phone-page">
        <header class="auth-header">
          <a class="back-link" href="/login">‹</a>
          <BrandMark />
          <span class="step-label">02 · REGISTER</span>
        </header>
        <section class="signup-layout">
          <div class="signup-intro">
            <div class="eyebrow">A CLEARER ROAD AHEAD</div>
            <h1>Start a clearer ledger.</h1>
            <p class="intro">
              Track your delivery blocks, fuel, and maintenance. Built for the
              road.
            </p>
            <div class="trust-note">
              <span>♢</span>
              <div>
                <strong>Your records stay yours.</strong>
                <p>
                  One simple place for the details that drive your business.
                </p>
              </div>
            </div>
          </div>
          <div class="signup-card">
            <div class="card-heading">
              <h2>Create your account</h2>
              <p>Get your ledger ready for the road.</p>
            </div>
            <AuthForm mode="signup" />
            <p class="privacy-note">
              An internet connection is required to create your account and log
              in for the first time.
            </p>
          </div>
          <p class="signup-login-link">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </section>
      </main>
    </div>
  );
});
