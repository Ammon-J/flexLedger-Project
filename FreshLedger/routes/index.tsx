import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import { BrandMark } from "../components/BrandMark.tsx";
import { BottomNav } from "../components/BottomNav.tsx";
import UserNav from "../islands/UserNav.tsx";
import DashboardBlocks from "../islands/DashboardBlocks.tsx";

export default define.page(function Home() {
  return (
    <div class="app-shell dashboard-page">
      <Head>
        <title>FlexLedger | Delivery blocks</title>
      </Head>
      <main class="phone-page">
        <header class="app-header">
          <BrandMark />
          <UserNav />
          <button class="icon-button" aria-label="Settings" type="button">
            ⚙
          </button>
        </header>
        <section class="page-content dashboard-content">
          <div class="eyebrow">01 / DELIVERY BLOCKS</div>
          <div class="dashboard-title-row">
            <div>
              <h1>Your day, accounted for.</h1>
              <p class="muted">Your delivery blocks, stored in one place.</p>
            </div>
            <span class="sync-dot" aria-label="Ready">i</span>
          </div>
          <DashboardBlocks />
        </section>
        <BottomNav active="home" />
      </main>
    </div>
  );
});
