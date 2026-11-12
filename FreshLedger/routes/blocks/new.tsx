import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import { BrandMark } from "../../components/BrandMark.tsx";
import BlockForm from "../../islands/BlockForm.tsx";

export default define.page(function NewBlock() {
  return (
    <div class="app-shell auth-page">
      <Head>
        <title>Add delivery block | FlexLedger</title>
      </Head>
      <main class="phone-page">
        <header class="auth-header">
          <a class="back-link" href="/">‹</a>
          <BrandMark />
          <span class="step-label">DELIVERY BLOCK</span>
        </header>
        <section class="auth-content login-card block-form-card">
          <div class="eyebrow">NEW DELIVERY BLOCK</div>
          <h1>Log your delivery work.</h1>
          <p class="intro">
            Add the mileage and earnings for a completed block.
          </p>
          <BlockForm />
        </section>
      </main>
    </div>
  );
});
