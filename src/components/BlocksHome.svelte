<main class="dashboard">
	<header class="topbar">
		<a class="brand" href="/blocks" aria-label="FlexLedger home">
			<span class="brand-mark" aria-hidden="true">F</span>
			<span>FlexLedger</span>
		</a>
		<div class="header-actions">
			<p class="today-date" data-today></p>
			<button class="avatar" type="button" aria-label="Sign out" title="Sign out" data-logout>
				<span data-initials>FL</span>
			</button>
		</div>
	</header>

	<section class="dashboard-content" aria-labelledby="welcome-title">
		<div class="welcome-row">
			<div>
				<p class="date-caption" data-long-date></p>
				<h1 id="welcome-title">Welcome back<span data-first-name></span>.</h1>
				<p class="welcome-copy">Here's how your delivery work is adding up.</p>
			</div>
			<label class="period-picker">
				<span>Period</span>
				<select data-period aria-label="Choose a month">
					<option value="all">All time</option>
				</select>
			</label>
		</div>

		<div class="sync-banner" role="status">
			<span class="sync-icon" aria-hidden="true">✓</span>
			<div>
				<strong data-sync-title>Connecting to your ledger...</strong>
				<span data-sync-detail>Your account and delivery blocks are loading.</span>
			</div>
		</div>

		<div class="summary-grid" aria-live="polite">
			<article class="summary-card mileage-card">
				<span>Miles driven</span>
				<strong data-total-miles>—</strong>
				<small data-mileage-caption>For selected period</small>
			</article>
			<article class="summary-card fuel-card">
				<span>Fuel costs</span>
				<strong data-total-fuel>—</strong>
				<small data-block-count>No delivery blocks yet</small>
			</article>
		</div>

		<a class="log-block-button" href="/blocks/new">
			<span aria-hidden="true">+</span>
			Log delivery block
		</a>

		<div class="section-heading" id="recent-blocks">
			<div>
				<h2>Recent blocks</h2>
				<p>Your delivery history, newest first.</p>
			</div>
			<button class="text-button" type="button" data-view-all hidden>View all</button>
		</div>

		<section class="blocks-card" aria-label="Your delivery blocks">
			<div class="loading-state" data-loading>
				<span class="spinner" aria-hidden="true"></span>
				<span>Loading your delivery blocks...</span>
			</div>
			<div class="error-state" data-error hidden>
				<strong>We couldn't load your ledger.</strong>
				<p data-error-message></p>
				<button type="button" class="secondary-button" data-retry>Try again</button>
			</div>
			<div class="empty-state" data-empty hidden>
				<span class="empty-icon" aria-hidden="true">↗</span>
				<strong>No delivery blocks for this period</strong>
				<p>When you log a delivery block, it will appear here.</p>
			</div>
			<div class="block-list" data-block-list hidden></div>
		</section>
	</section>

	<nav class="bottom-nav" aria-label="Main navigation">
		<a class="nav-item is-active" href="/blocks" aria-current="page">
			<span aria-hidden="true">⌂</span><small>Home</small>
		</a>
		<a class="nav-item" href="#recent-blocks">
			<span aria-hidden="true">▤</span><small>Blocks</small>
		</a>
		<span class="nav-item is-disabled" aria-disabled="true"><span aria-hidden="true">$</span><small>Expenses</small></span>
		<span class="nav-item is-disabled" aria-disabled="true"><span aria-hidden="true">▥</span><small>Tax</small></span>
		<button class="nav-item account-nav" type="button" data-logout>
			<span aria-hidden="true">○</span><small>Account</small>
		</button>
	</nav>
</main>

<script>
	import { initializeBlocksHome } from '../js/BlocksHome';
	import { onMount } from 'svelte';
	import '../styles/BlocksHome.css';

	onMount(() => {
		initializeBlocksHome();
	});
</script>
