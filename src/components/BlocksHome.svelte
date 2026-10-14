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

<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
	type User = { firstName: string; lastName: string; email: string };
	type Block = { id: string; milesDriven: number; fuelCost: number; date: string };

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
	const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
	const currencyFormatter = new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'USD',
	});

	const longDate = document.querySelector<HTMLElement>('[data-long-date]');
	const todayDate = document.querySelector<HTMLElement>('[data-today]');
	const firstNameElement = document.querySelector<HTMLElement>('[data-first-name]');
	const initialsElement = document.querySelector<HTMLElement>('[data-initials]');
	const syncTitle = document.querySelector<HTMLElement>('[data-sync-title]');
	const syncDetail = document.querySelector<HTMLElement>('[data-sync-detail]');
	const totalMilesElement = document.querySelector<HTMLElement>('[data-total-miles]');
	const totalFuelElement = document.querySelector<HTMLElement>('[data-total-fuel]');
	const blockCountElement = document.querySelector<HTMLElement>('[data-block-count]');
	const periodSelect = document.querySelector<HTMLSelectElement>('[data-period]');
	const loadingElement = document.querySelector<HTMLElement>('[data-loading]');
	const emptyElement = document.querySelector<HTMLElement>('[data-empty]');
	const listElement = document.querySelector<HTMLDivElement>('[data-block-list]');
	const errorElement = document.querySelector<HTMLElement>('[data-error]');
	const errorMessageElement = document.querySelector<HTMLElement>('[data-error-message]');
	const viewAllButton = document.querySelector<HTMLButtonElement>('[data-view-all]');
	const retryButton = document.querySelector<HTMLButtonElement>('[data-retry]');

	const now = new Date();
	if (longDate) longDate.textContent = dateFormatter.format(now);
	if (todayDate) todayDate.textContent = dateFormatter.format(now);

	let blocks: Block[] = [];
	let showAll = false;

	function getSelectedBlocks() {
		if (!periodSelect || periodSelect.value === 'all') return blocks;
		return blocks.filter((block) => {
			const date = new Date(block.date);
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === periodSelect.value;
		});
	}

	function renderBlocks() {
		if (!listElement || !emptyElement || !viewAllButton) return;
		const selected = getSelectedBlocks();
		const shown = showAll ? selected : selected.slice(0, 3);
		const totalMiles = selected.reduce((sum, block) => sum + block.milesDriven, 0);
		const totalFuel = selected.reduce((sum, block) => sum + block.fuelCost, 0);

		if (totalMilesElement) totalMilesElement.textContent = `${new Intl.NumberFormat().format(totalMiles)} mi`;
		if (totalFuelElement) totalFuelElement.textContent = currencyFormatter.format(totalFuel);
		if (blockCountElement) {
			blockCountElement.textContent = `${selected.length} ${selected.length === 1 ? 'delivery block' : 'delivery blocks'}`;
		}
		if (viewAllButton) {
			viewAllButton.hidden = selected.length <= 3;
			viewAllButton.textContent = showAll ? 'Show less' : 'View all';
		}

		listElement.replaceChildren();
		if (selected.length === 0) {
			listElement.hidden = true;
			emptyElement.hidden = false;
			return;
		}
		emptyElement.hidden = true;
		listElement.hidden = false;

		for (const block of shown) {
			const row = document.createElement('article');
			row.className = 'block-row';

			const dateText = document.createElement('span');
			dateText.className = 'block-date';
			dateText.textContent = dateFormatter.format(new Date(block.date));

			const metrics = document.createElement('span');
			metrics.className = 'block-metrics';
			metrics.textContent = `${new Intl.NumberFormat().format(block.milesDriven)} mi`;

			const fuel = document.createElement('span');
			fuel.className = 'block-fuel';
			fuel.textContent = currencyFormatter.format(block.fuelCost);

			const synced = document.createElement('small');
			synced.className = 'block-status';
			synced.textContent = '✓ Synced';

			row.append(dateText, metrics, fuel, synced);
			listElement.append(row);
		}
	}

	async function loadDashboard() {
		if (!loadingElement || !errorElement || !errorMessageElement || !emptyElement || !listElement) return;
		loadingElement.hidden = false;
		errorElement.hidden = true;
		emptyElement.hidden = true;
		listElement.hidden = true;

		try {
			const [userResponse, blocksResponse] = await Promise.all([
				fetch('/api/me'),
				fetch('/api/blocks'),
			]);
			if (userResponse.status === 401 || blocksResponse.status === 401) {
				window.location.replace('/login');
				return;
			}
			const userResult = await userResponse.json();
			const blocksResult = await blocksResponse.json();
			if (!userResponse.ok) throw new Error(userResult.message ?? 'Unable to load your account.');
			if (!blocksResponse.ok) throw new Error(blocksResult.message ?? 'Unable to load your delivery blocks.');

			const user = userResult.user as User;
			const receivedBlocks = blocksResult.blocks as Block[];
			if (!Array.isArray(receivedBlocks)) throw new Error('The blocks API returned an invalid response.');
			blocks = receivedBlocks;

			if (firstNameElement) firstNameElement.textContent = `, ${user.firstName}`;
			if (initialsElement) {
				initialsElement.textContent = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
			}
			if (syncTitle) syncTitle.textContent = 'Online · ledger synced';
			if (syncDetail) syncDetail.textContent = 'Your account and delivery blocks are up to date.';

			if (periodSelect) {
				const months = [...new Set(blocks.map((block) => {
					const date = new Date(block.date);
					return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
				}))];
				for (const month of months) {
					const option = document.createElement('option');
					option.value = month;
					option.textContent = monthFormatter.format(new Date(`${month}-01T12:00:00`));
					periodSelect.append(option);
				}
				const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
				if (months.includes(currentMonth)) periodSelect.value = currentMonth;
			}
			renderBlocks();
		} catch (error) {
			errorMessageElement.textContent =
				error instanceof Error ? error.message : 'Please check your connection and try again.';
			errorElement.hidden = false;
		} finally {
			loadingElement.hidden = true;
		}
	}

	periodSelect?.addEventListener('change', () => {
		showAll = false;
		renderBlocks();
	});
	viewAllButton?.addEventListener('click', () => {
		showAll = !showAll;
		renderBlocks();
	});
	retryButton?.addEventListener('click', loadDashboard);

	document.querySelectorAll<HTMLButtonElement>('[data-logout]').forEach((button) => {
		button.addEventListener('click', async () => {
			button.disabled = true;
			try {
				const response = await fetch('/api/logout', { method: 'POST' });
				if (!response.ok) throw new Error('Unable to sign out. Please try again.');
				window.location.replace('/');
			} catch (error) {
				if (errorElement && errorMessageElement) {
					errorMessageElement.textContent = error instanceof Error ? error.message : 'Unable to sign out.';
					errorElement.hidden = false;
				}
				button.disabled = false;
			}
		});
	});

	void loadDashboard();
	});
</script>

<style>
	:global {
	.dashboard {
		--green: #23764f;
		--green-dark: #185c3c;
		--green-soft: #edf5f0;
		--ink: #202925;
		--muted: #77817b;
		--line: #e7ece8;
		min-height: 100vh;
		box-sizing: border-box;
		padding-bottom: 82px;
		background: #f6f8f6;
		color: var(--ink);
		font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	}

	.topbar {
		height: 66px;
		padding: 0 max(28px, calc((100% - 1080px) / 2));
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: white;
		border-bottom: 1px solid #edf0ed;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		color: var(--ink);
		font-size: 16px;
		font-weight: 750;
		text-decoration: none;
	}

	.brand-mark {
		width: 29px;
		height: 29px;
		display: grid;
		place-items: center;
		border-radius: 7px;
		background: var(--green);
		color: white;
		font-size: 14px;
		font-weight: 800;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 17px;
	}

	.today-date {
		margin: 0;
		color: var(--muted);
		font-size: 12px;
	}

	.avatar {
		width: 34px;
		height: 34px;
		border: 0;
		border-radius: 50%;
		background: var(--green-soft);
		color: var(--green);
		font: inherit;
		font-size: 11px;
		font-weight: 800;
		cursor: pointer;
	}

	.dashboard-content {
		width: min(100% - 40px, 850px);
		margin: 0 auto;
		padding: 36px 0 52px;
	}

	.welcome-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 18px;
		margin-bottom: 23px;
	}

	.date-caption {
		margin: 0 0 8px;
		color: var(--muted);
		font-size: 11px;
	}

	h1 {
		margin: 0;
		font-size: clamp(24px, 4vw, 31px);
		font-weight: 740;
		letter-spacing: -0.05em;
	}

	.welcome-copy {
		margin: 8px 0 0;
		color: var(--muted);
		font-size: 13px;
	}

	.period-picker {
		display: grid;
		gap: 6px;
		color: #58645d;
		font-size: 11px;
		font-weight: 700;
	}

	select {
		min-width: 135px;
		height: 38px;
		padding: 0 30px 0 10px;
		border: 1px solid #dfe5e0;
		border-radius: 7px;
		background: white;
		color: var(--ink);
		font: inherit;
		font-size: 12px;
	}

	.sync-banner {
		display: flex;
		align-items: flex-start;
		gap: 11px;
		margin-bottom: 18px;
		padding: 13px 15px;
		border: 1px solid #e2eee6;
		border-radius: 9px;
		background: #edf5f0;
	}

	.sync-icon {
		width: 19px;
		height: 19px;
		flex: 0 0 19px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: #d9eddf;
		color: var(--green);
		font-size: 12px;
		font-weight: 800;
	}

	.sync-banner strong,
	.sync-banner div span {
		display: block;
	}

	.sync-banner strong {
		margin-bottom: 3px;
		font-size: 11px;
	}

	.sync-banner div span {
		color: #68766e;
		font-size: 10px;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 13px;
		margin-bottom: 30px;
	}

	.summary-card {
		min-height: 97px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 15px 17px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: white;
	}

	.summary-card > span {
		color: #758079;
		font-size: 11px;
	}

	.summary-card strong {
		margin-top: 5px;
		font-size: 25px;
		line-height: 1.1;
		letter-spacing: -0.04em;
	}

	.summary-card small {
		margin-top: 4px;
		color: #8a948e;
		font-size: 10px;
	}

	.section-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.log-block-button {
		min-height: 43px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin: -14px 0 28px;
		border-radius: 7px;
		background: var(--green);
		color: white;
		font-size: 12px;
		font-weight: 750;
		text-decoration: none;
		transition: background 150ms ease;
	}

	.log-block-button:hover {
		background: var(--green-dark);
	}

	.log-block-button span {
		font-size: 18px;
		line-height: 1;
	}

	.section-heading h2 {
		margin: 0;
		font-size: 16px;
		letter-spacing: -0.025em;
	}

	.section-heading p {
		margin: 4px 0 0;
		color: var(--muted);
		font-size: 11px;
	}

	.text-button {
		border: 0;
		background: none;
		color: var(--green);
		font: inherit;
		font-size: 11px;
		font-weight: 750;
		cursor: pointer;
	}

	.blocks-card {
		overflow: hidden;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: white;
	}

	.block-row {
		min-height: 66px;
		box-sizing: border-box;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 115px 105px 80px;
		align-items: center;
		gap: 12px;
		padding: 12px 17px;
		border-bottom: 1px solid #edf0ed;
	}

	.block-row:last-child {
		border-bottom: 0;
	}

	.block-date {
		font-size: 12px;
		font-weight: 700;
	}

	.block-metrics,
	.block-fuel {
		font-size: 12px;
		font-weight: 700;
		text-align: right;
	}

	.block-fuel {
		color: #59655e;
		font-weight: 550;
	}

	.block-status {
		color: var(--green);
		font-size: 10px;
		text-align: right;
	}

	.loading-state,
	.empty-state,
	.error-state {
		min-height: 170px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 24px;
		color: var(--muted);
		text-align: center;
	}

	.loading-state {
		flex-direction: row;
		gap: 10px;
		font-size: 12px;
	}

	.spinner {
		width: 17px;
		height: 17px;
		border: 2px solid #d9e7de;
		border-top-color: var(--green);
		border-radius: 50%;
		animation: spin 800ms linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.empty-icon {
		width: 38px;
		height: 38px;
		display: grid;
		place-items: center;
		margin-bottom: 12px;
		border-radius: 11px;
		background: var(--green-soft);
		color: var(--green);
		font-size: 20px;
	}

	.empty-state strong,
	.error-state strong {
		color: var(--ink);
		font-size: 13px;
	}

	.empty-state p,
	.error-state p {
		margin: 6px 0 0;
		font-size: 11px;
	}

	.error-state p {
		max-width: 350px;
	}

	.secondary-button {
		margin-top: 14px;
		padding: 8px 14px;
		border: 1px solid #dfe5e0;
		border-radius: 6px;
		background: white;
		color: var(--ink);
		font: inherit;
		font-size: 11px;
		font-weight: 700;
		cursor: pointer;
	}

	.bottom-nav {
		position: fixed;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 2;
		min-height: 65px;
		display: flex;
		justify-content: center;
		gap: clamp(20px, 8vw, 90px);
		padding: 7px 20px max(7px, env(safe-area-inset-bottom));
		border-top: 1px solid #e8ede9;
		background: rgba(255, 255, 255, 0.97);
	}

	.nav-item {
		min-width: 48px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		border: 0;
		background: none;
		color: #8b958f;
		font: inherit;
		text-decoration: none;
	}

	.nav-item > span {
		font-size: 19px;
		line-height: 1;
	}

	.nav-item small {
		font-size: 9px;
	}

	.nav-item.is-active {
		color: var(--green);
	}

	.nav-item.is-disabled {
		opacity: 0.62;
	}

	.account-nav {
		cursor: pointer;
	}

	[hidden] {
		display: none !important;
	}

	@media (max-width: 600px) {
		.dashboard {
			background: #fff;
		}

		.topbar {
			height: 56px;
			padding: 0 16px;
		}

		.today-date {
			display: none;
		}

		.dashboard-content {
			width: auto;
			padding: 25px 16px 36px;
		}

		.welcome-row {
			align-items: flex-start;
			gap: 12px;
		}

		h1 {
			font-size: 24px;
		}

		.welcome-copy {
			max-width: 245px;
			font-size: 12px;
			line-height: 1.5;
		}

		.period-picker {
			font-size: 10px;
		}

		select {
			min-width: 108px;
			max-width: 120px;
			height: 35px;
			font-size: 11px;
		}

		.sync-banner {
			padding: 11px;
		}

		.summary-card {
			min-height: 87px;
			padding: 12px;
		}

		.summary-card strong {
			font-size: 22px;
		}

		.block-row {
			grid-template-columns: minmax(0, 1fr) auto auto;
			gap: 9px;
			padding: 13px 12px;
		}

		.block-date {
			font-size: 11px;
		}

		.block-metrics,
		.block-fuel {
			font-size: 11px;
		}

		.block-status {
			grid-column: 1 / -1;
			margin-top: -4px;
			text-align: left;
		}

		.bottom-nav {
			justify-content: space-around;
			gap: 0;
			padding-right: 5px;
			padding-left: 5px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation-duration: 2s;
		}
	}
	}
</style>
