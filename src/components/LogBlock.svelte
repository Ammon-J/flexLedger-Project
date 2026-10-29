<script>
	import '../styles/LogBlock.css';
	import { onMount } from 'svelte';
	import { getLocalDate } from '../js/LogBlock';

	let blockDate = getLocalDate();
	let startOdometer = undefined;
	let endOdometer = undefined;
	let earnings = undefined;
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

			const result = await response.json();
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

	async function saveBlock(event) {
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
			const result = await response.json();
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
			const result = await response.json();
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
