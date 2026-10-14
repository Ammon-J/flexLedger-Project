<script lang="ts">
	import { onMount } from 'svelte';

	type User = {
		defaultVehicle?: string;
	};
	type ApiResult = {
		message?: string;
		user?: User;
	};

	function getLocalDate() {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	let blockDate = getLocalDate();
	let startOdometer: number | undefined = undefined;
	let endOdometer: number | undefined = undefined;
	let earnings: number | undefined = undefined;
	let routeNotes = '';
	let vehicle = 'Loading your vehicle...';
	let isLoading = true;
	let isSaving = false;
	let statusMessage = '';
	let statusIsError = false;

	$: hasOdometerValues =
		startOdometer !== undefined &&
		endOdometer !== undefined &&
		Number.isFinite(startOdometer) &&
		Number.isFinite(endOdometer) &&
		startOdometer >= 0 &&
		endOdometer >= startOdometer;
	$: milesDriven = hasOdometerValues ? (endOdometer ?? 0) - (startOdometer ?? 0) : null;
	$: formattedMiles =
		milesDriven === null
			? '—'
			: `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(milesDriven)} mi`;

	onMount(() => {
		void loadUser();
	});

	async function loadUser() {
		try {
			const response = await fetch('/api/me');
			if (response.status === 401) {
				window.location.replace('/login');
				return;
			}

			const result = (await response.json()) as ApiResult;
			if (!response.ok) throw new Error(result.message ?? 'Unable to load your vehicle.');
			vehicle = result.user?.defaultVehicle ?? 'No default vehicle set';
		} catch (error) {
			statusIsError = true;
			statusMessage =
				error instanceof Error ? error.message : 'Unable to load your account. Please try again.';
			vehicle = 'Vehicle information unavailable';
		} finally {
			isLoading = false;
		}
	}

	async function saveBlock(event: SubmitEvent) {
		event.preventDefault();
		statusMessage = '';
		statusIsError = false;

		if (!hasOdometerValues) {
			statusIsError = true;
			statusMessage = 'Enter valid odometer readings. The end reading must be at least the start reading.';
			return;
		}

		isSaving = true;
		try {
			const response = await fetch('/api/blocks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					date: blockDate,
					startOdometer,
					endOdometer,
					...(earnings !== undefined ? { earnings } : {}),
					...(routeNotes.trim() ? { routeNotes: routeNotes.trim() } : {}),
				}),
			});
			const result = (await response.json()) as ApiResult;
			if (response.status === 401) {
				window.location.replace('/login');
				return;
			}
			if (!response.ok) throw new Error(result.message ?? 'Unable to save this delivery block.');

			statusIsError = false;
			statusMessage = 'Block saved to your ledger.';
			startOdometer = undefined;
			endOdometer = undefined;
			earnings = undefined;
			routeNotes = '';
		} catch (error) {
			statusIsError = true;
			statusMessage =
				error instanceof Error ? error.message : 'Unable to save this block. Please try again.';
		} finally {
			isSaving = false;
		}
	}

	async function signOut() {
		try {
			const response = await fetch('/api/logout', { method: 'POST' });
			const result = (await response.json()) as ApiResult;
			if (!response.ok) throw new Error(result.message ?? 'Unable to sign out.');
			window.location.replace('/');
		} catch (error) {
			statusIsError = true;
			statusMessage = error instanceof Error ? error.message : 'Unable to sign out. Please try again.';
		}
	}
</script>

<main class="log-page">
	<header class="topbar">
		<a class="back-link" href="/blocks" aria-label="Back to delivery blocks">
			<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="m14.5 5-7 7 7 7M8 12h12" />
			</svg>
		</a>
		<div class="page-heading">
			<h1>Log delivery block</h1>
			<p>{vehicle}</p>
		</div>
		<a class="brand-mark" href="/blocks" aria-label="FlexLedger home">F</a>
	</header>

	<section class="form-content" aria-labelledby="form-title">
		<div class="form-intro">
			<p class="eyebrow">Delivery block</p>
			<h2 id="form-title">Add a block to your ledger.</h2>
			<p>Record your odometer readings and earnings from this delivery block.</p>
		</div>

		<form class="block-form" onsubmit={saveBlock}>
			<div class="field">
				<label for="block-date">Block date</label>
				<input id="block-date" name="date" type="date" bind:value={blockDate} required />
			</div>

			<div class="odometer-fields">
				<div class="field">
					<label for="start-odometer">Start odometer</label>
					<div class="input-with-unit">
						<input
							id="start-odometer"
							name="startOdometer"
							type="number"
							min="0"
							step="any"
							inputmode="decimal"
							placeholder="42,180"
							bind:value={startOdometer}
							required
						/>
						<span>mi</span>
					</div>
				</div>
				<div class="field">
					<label for="end-odometer">End odometer</label>
					<div class="input-with-unit">
						<input
							id="end-odometer"
							name="endOdometer"
							type="number"
							min={startOdometer ?? 0}
							step="any"
							inputmode="decimal"
							placeholder="42,304"
							bind:value={endOdometer}
							required
						/>
						<span>mi</span>
					</div>
				</div>
			</div>

			<div class="miles-summary" aria-live="polite">
				<div>
					<span class="summary-label">Miles driven</span>
					<small>Calculated from your odometer readings</small>
				</div>
				<strong>{formattedMiles}</strong>
			</div>

			<div class="field">
				<label for="earnings">Earnings <span class="optional">- optional</span></label>
				<div class="input-with-unit currency">
					<span aria-hidden="true">$</span>
					<input
						id="earnings"
						name="earnings"
						type="number"
						min="0"
						step="0.01"
						inputmode="decimal"
						placeholder="102.00"
						bind:value={earnings}
					/>
					<span>USD</span>
				</div>
			</div>

			<div class="field">
				<label for="route-notes">Route notes <span class="optional">- optional</span></label>
				<textarea
					id="route-notes"
					name="routeNotes"
					rows="3"
					maxlength="1000"
					placeholder="West loop - light traffic."
					bind:value={routeNotes}
				></textarea>
				<small class="field-hint">Add a short note about this block.</small>
			</div>

			{#if statusMessage}
				<p
					class:error-message={statusIsError}
					class:success-message={!statusIsError}
					role="status"
					aria-live="polite"
				>
					{statusMessage}
				</p>
			{/if}

			<button class="save-button" type="submit" disabled={isLoading || isSaving}>
				{isSaving ? 'Saving block...' : 'Save block'}
			</button>
			<a class="view-blocks-button" href="/blocks">View delivery blocks</a>
		</form>
	</section>

	<nav class="bottom-nav" aria-label="Main navigation">
		<a class="nav-item" href="/blocks">
			<span aria-hidden="true">⌂</span><small>Home</small>
		</a>
		<a class="nav-item is-active" href="/blocks/new" aria-current="page">
			<span aria-hidden="true">▤</span><small>Blocks</small>
		</a>
		<span class="nav-item is-disabled" aria-disabled="true"><span aria-hidden="true">$</span><small>Expenses</small></span>
		<span class="nav-item is-disabled" aria-disabled="true"><span aria-hidden="true">▥</span><small>Tax</small></span>
		<button class="nav-item account-nav" type="button" onclick={signOut}>
			<span aria-hidden="true">○</span><small>Account</small>
		</button>
	</nav>
</main>

<style>
	.log-page {
		--green: #23764f;
		--green-dark: #185c3c;
		--green-soft: #edf5f0;
		--ink: #202925;
		--muted: #77817b;
		--line: #e1e7e2;
		min-height: 100vh;
		box-sizing: border-box;
		padding-bottom: 82px;
		background: #f6f8f6;
		color: var(--ink);
		font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	}

	.topbar {
		min-height: 66px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 10px max(28px, calc((100% - 700px) / 2));
		border-bottom: 1px solid #edf0ed;
		background: #fff;
	}

	.back-link {
		width: 34px;
		height: 34px;
		flex: 0 0 34px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		color: #5e6b63;
	}

	.back-link:hover {
		background: #f1f5f2;
	}

	.back-link svg {
		width: 20px;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}

	.page-heading {
		min-width: 0;
		flex: 1;
	}

	.page-heading h1 {
		margin: 0;
		font-size: 16px;
		font-weight: 750;
		letter-spacing: -0.025em;
	}

	.page-heading p {
		overflow: hidden;
		margin: 3px 0 0;
		color: var(--muted);
		font-size: 11px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.brand-mark {
		width: 30px;
		height: 30px;
		display: grid;
		place-items: center;
		border-radius: 7px;
		background: var(--green);
		color: white;
		font-size: 14px;
		font-weight: 800;
		text-decoration: none;
	}

	.form-content {
		width: min(100% - 40px, 540px);
		margin: 0 auto;
		padding: 38px 0 44px;
	}

	.form-intro {
		margin-bottom: 23px;
	}

	.eyebrow {
		margin: 0 0 9px;
		color: var(--green);
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.form-intro h2 {
		margin: 0;
		font-size: clamp(22px, 4vw, 27px);
		letter-spacing: -0.045em;
	}

	.form-intro > p:last-child {
		margin: 8px 0 0;
		color: var(--muted);
		font-size: 12px;
		line-height: 1.55;
	}

	.block-form {
		display: grid;
		gap: 17px;
		padding: 24px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: #fff;
		box-shadow: 0 12px 32px rgba(25, 55, 38, 0.05);
	}

	.field {
		min-width: 0;
	}

	.field label {
		display: block;
		margin-bottom: 7px;
		font-size: 11px;
		font-weight: 750;
	}

	.optional {
		color: #89928d;
		font-size: 10px;
		font-weight: 500;
	}

	.field input,
	.field textarea {
		width: 100%;
		min-height: 42px;
		box-sizing: border-box;
		padding: 0 11px;
		border: 1px solid #dce3de;
		border-radius: 7px;
		outline: none;
		background: #fff;
		color: var(--ink);
		font: inherit;
		font-size: 12px;
	}

	.field textarea {
		min-height: 75px;
		padding: 10px 11px;
		resize: vertical;
	}

	.field input::placeholder,
	.field textarea::placeholder {
		color: #929b95;
		opacity: 1;
	}

	.field input:focus,
	.field textarea:focus {
		border-color: var(--green);
		box-shadow: 0 0 0 3px rgba(35, 118, 79, 0.12);
	}

	.odometer-fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.input-with-unit {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-with-unit input {
		padding-right: 38px;
	}

	.input-with-unit > span {
		position: absolute;
		right: 11px;
		color: #89928d;
		font-size: 10px;
		pointer-events: none;
	}

	.input-with-unit.currency > span:first-child {
		right: auto;
		left: 11px;
	}

	.input-with-unit.currency > span:last-child {
		right: 11px;
	}

	.input-with-unit.currency input {
		padding-right: 42px;
		padding-left: 27px;
	}

	.miles-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 13px 14px;
		border: 1px solid #e0eee5;
		border-radius: 8px;
		background: var(--green-soft);
	}

	.miles-summary > div {
		display: grid;
		gap: 4px;
	}

	.summary-label {
		font-size: 11px;
		font-weight: 750;
	}

	.miles-summary small,
	.field-hint {
		color: #77847b;
		font-size: 9px;
	}

	.miles-summary strong {
		color: var(--green);
		font-size: 21px;
		letter-spacing: -0.04em;
		white-space: nowrap;
	}

	.field-hint {
		display: block;
		margin: 6px 0 0;
	}

	.error-message,
	.success-message {
		margin: 0;
		padding: 10px 12px;
		border-radius: 7px;
		font-size: 11px;
		line-height: 1.5;
	}

	.error-message {
		background: #fff1ef;
		color: #a43e39;
	}

	.success-message {
		background: var(--green-soft);
		color: var(--green-dark);
	}

	.save-button,
	.view-blocks-button {
		min-height: 42px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 7px;
		font: inherit;
		font-size: 12px;
		font-weight: 750;
		text-decoration: none;
	}

	.save-button {
		border: 0;
		background: var(--green);
		color: white;
		cursor: pointer;
	}

	.save-button:hover:not(:disabled) {
		background: var(--green-dark);
	}

	.save-button:disabled {
		cursor: wait;
		opacity: 0.7;
	}

	.view-blocks-button {
		margin-top: -8px;
		border: 1px solid #dce3de;
		background: white;
		color: #4f5c54;
	}

	.view-blocks-button:hover {
		background: #f7f9f7;
	}

	.bottom-nav {
		position: fixed;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 2;
		min-height: 65px;
		box-sizing: content-box;
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

	@media (max-width: 600px) {
		.log-page {
			background: #fff;
		}

		.topbar {
			min-height: 58px;
			gap: 10px;
			padding: 9px 14px;
		}

		.form-content {
			width: auto;
			padding: 25px 14px 30px;
		}

		.form-intro {
			margin-bottom: 18px;
		}

		.form-intro h2 {
			font-size: 22px;
		}

		.block-form {
			gap: 15px;
			padding: 17px 14px;
			border-radius: 10px;
			box-shadow: none;
		}

		.bottom-nav {
			justify-content: space-around;
			gap: 0;
			padding-right: 5px;
			padding-left: 5px;
		}
	}
</style>
