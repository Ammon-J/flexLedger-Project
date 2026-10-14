<main class="register-page">
	<header class="site-header">
		<a class="brand" href="/" aria-label="FlexLedger home">
			<span class="brand-mark" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none">
					<path d="M7 5.5h10M7 9.5h6M7 13.5h10M7 17.5h6" />
					<path d="M5 2.75h14A2.25 2.25 0 0 1 21.25 5v14A2.25 2.25 0 0 1 19 21.25H5A2.25 2.25 0 0 1 2.75 19V5A2.25 2.25 0 0 1 5 2.75Z" />
				</svg>
			</span>
			<span>FlexLedger</span>
		</a>
		<p class="header-prompt">Already have an account? <a href="/login">Log in</a></p>
	</header>

	<section class="register-layout" aria-labelledby="register-title">
		<div class="intro">
			<p class="eyebrow">A clearer road ahead</p>
			<h1 id="register-title">Start a clearer ledger.</h1>
			<p class="intro-copy">
				Track your delivery blocks, fuel, and maintenance. Built for the road.
			</p>
			<div class="trust-note">
				<span class="trust-icon" aria-hidden="true">
					<svg viewBox="0 0 24 24" fill="none">
						<path d="M12 3 19 6v5c0 4.5-2.9 8-7 10-4.1-2-7-5.5-7-10V6l7-3Z" />
						<path d="m9 12 2 2 4-4" />
					</svg>
				</span>
				<div>
					<strong>Your records stay yours.</strong>
					<span>One simple place for the details that drive your business.</span>
				</div>
			</div>
		</div>

		<div class="form-card">
			<div class="mobile-heading">
				<a class="back-link" href="/" aria-label="Back to home">
					<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="m14.5 5-7 7 7 7M8 12h12" />
					</svg>
				</a>
				<span>Create account</span>
			</div>

			<div class="form-heading">
				<h2>Create your account</h2>
				<p>Get your ledger ready for the road.</p>
			</div>

			<form action="/api/register" method="post" class="register-form">
				<div class="name-fields">
					<div class="field">
						<label for="first-name">First name</label>
						<input
							id="first-name"
							name="firstName"
							type="text"
							autocomplete="given-name"
							maxlength="100"
							placeholder="Alex"
							required
						/>
					</div>

					<div class="field">
						<label for="last-name">Last name</label>
						<input
							id="last-name"
							name="lastName"
							type="text"
							autocomplete="family-name"
							maxlength="100"
							placeholder="Morgan"
							required
						/>
					</div>
				</div>

				<div class="field">
					<label for="email">Email address</label>
					<div class="input-wrap">
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							placeholder="alex.morgan@example.com"
							required
						/>
						<svg class="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<rect x="3.5" y="5.5" width="17" height="13" rx="2" />
							<path d="m4.5 7 7.5 5.5L19.5 7" />
						</svg>
					</div>
				</div>

				<div class="field">
					<label for="password">Password</label>
					<div class="input-wrap">
						<input
							id="password"
							name="password"
							type="password"
							autocomplete="new-password"
							minlength="8"
							maxlength="128"
							placeholder="Create a strong password"
							required
						/>
						<button class="password-toggle" type="button" data-password-toggle="password" aria-label="Show password">
							<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
								<circle cx="12" cy="12" r="2.5" />
							</svg>
						</button>
					</div>
					<p class="field-hint">Use at least 8 characters, including a number.</p>
				</div>

				<div class="field">
					<label for="confirm-password">Confirm password</label>
					<div class="input-wrap">
						<input
							id="confirm-password"
							name="confirmPassword"
							type="password"
							autocomplete="new-password"
							maxlength="128"
							placeholder="Enter your password again"
							required
						/>
						<button class="password-toggle" type="button" data-password-toggle="confirm-password" aria-label="Show password">
							<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
								<circle cx="12" cy="12" r="2.5" />
							</svg>
						</button>
					</div>
				</div>

				<div class="field">
					<label for="default-vehicle">
						Default vehicle
						<span class="optional">(optional)</span>
					</label>
					<input
						id="default-vehicle"
						name="defaultVehicle"
						type="text"
						autocomplete="off"
						maxlength="120"
						placeholder="2017 Ford Fusion SE 2.0L AWD"
					/>
					<p class="field-hint">You can add or change your vehicle later.</p>
				</div>

				<button class="submit-button" type="submit">Create account</button>
				<p class="form-message" role="status" aria-live="polite"></p>
				<p class="form-footnote">
					An internet connection is required to create your account and sign in for the first time.
				</p>
				<p class="mobile-login">Already have an account? <a href="/login">Log in</a></p>
			</form>
		</div>
	</section>

	<footer class="page-footer">Your miles. Your records. Your business.</footer>
</main>

<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
	const registrationForm = document.querySelector<HTMLFormElement>('.register-form');
	const passwordField = document.querySelector<HTMLInputElement>('#password');
	const confirmPasswordField = document.querySelector<HTMLInputElement>('#confirm-password');

	if (registrationForm && passwordField && confirmPasswordField) {
		const statusMessage = registrationForm.querySelector<HTMLParagraphElement>('.form-message');
		const submitButton = registrationForm.querySelector<HTMLButtonElement>('.submit-button');

		const validatePasswordMatch = () => {
			confirmPasswordField.setCustomValidity(
				confirmPasswordField.value && confirmPasswordField.value !== passwordField.value
					? 'Passwords do not match.'
					: '',
			);
		};

		passwordField.addEventListener('input', validatePasswordMatch);
		confirmPasswordField.addEventListener('input', validatePasswordMatch);

		registrationForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			if (!statusMessage || !submitButton) return;

			statusMessage.textContent = '';
			statusMessage.removeAttribute('data-error');
			submitButton.disabled = true;
			submitButton.textContent = 'Creating account...';

			try {
				const response = await fetch(registrationForm.action, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(Object.fromEntries(new FormData(registrationForm))),
				});
				const result = await response.json();
				if (!response.ok) {
					throw new Error(result.message ?? 'Unable to create your account.');
				}
				statusMessage.textContent = result.message;
				window.location.assign('/blocks');
			} catch (error) {
				statusMessage.dataset.error = 'true';
				statusMessage.textContent =
					error instanceof Error ? error.message : 'Unable to create your account. Please try again.';
			} finally {
				submitButton.disabled = false;
				submitButton.textContent = 'Create account';
			}
		});

		registrationForm.querySelectorAll<HTMLButtonElement>('[data-password-toggle]').forEach((toggle) => {
			toggle.addEventListener('click', () => {
				const targetId = toggle.dataset.passwordToggle;
				const target = targetId ? document.getElementById(targetId) : null;
				if (!(target instanceof HTMLInputElement)) return;

				const shouldShow = target.type === 'password';
				target.type = shouldShow ? 'text' : 'password';
				toggle.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
			});
		});
	}
	});
</script>

<style>
	.register-page {
		--green: #23764f;
		--green-dark: #185c3c;
		--green-soft: #edf5f0;
		--ink: #202925;
		--muted: #68736d;
		--line: #dce3de;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		color: var(--ink);
		background:
			radial-gradient(ellipse at 13% 45%, rgba(226, 239, 230, 0.65), transparent 38%),
			#f7f9f7;
		font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	}

	.site-header {
		width: min(1160px, calc(100% - 64px));
		min-height: 88px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid rgba(31, 67, 48, 0.09);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		color: var(--ink);
		font-size: 17px;
		font-weight: 750;
		letter-spacing: -0.04em;
		text-decoration: none;
	}

	.brand-mark {
		width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
		border-radius: 8px;
		background: var(--green);
	}

	.brand-mark svg {
		width: 19px;
		stroke: white;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.6;
	}

	.header-prompt,
	.mobile-login {
		margin: 0;
		color: var(--muted);
		font-size: 13px;
	}

	.header-prompt a,
	.mobile-login a {
		margin-left: 5px;
		color: var(--green);
		font-weight: 700;
		text-decoration: none;
	}

	.header-prompt a:hover,
	.mobile-login a:hover {
		color: var(--green-dark);
		text-decoration: underline;
	}

	.register-layout {
		width: min(1000px, calc(100% - 64px));
		flex: 1;
		margin: 0 auto;
		padding: 54px 0 48px;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(390px, 460px);
		align-items: center;
		gap: clamp(56px, 9vw, 120px);
	}

	.intro {
		max-width: 400px;
		padding-bottom: 12px;
	}

	.eyebrow {
		margin: 0 0 18px;
		color: var(--green);
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}

	.intro h1 {
		margin: 0;
		font-size: clamp(38px, 4.5vw, 54px);
		font-weight: 740;
		letter-spacing: -0.065em;
		line-height: 1.06;
	}

	.intro-copy {
		max-width: 340px;
		margin: 20px 0 0;
		color: var(--muted);
		font-size: 16px;
		line-height: 1.7;
	}

	.trust-note {
		display: flex;
		align-items: flex-start;
		gap: 13px;
		margin-top: 42px;
		padding-top: 22px;
		border-top: 1px solid rgba(31, 67, 48, 0.12);
	}

	.trust-icon {
		width: 36px;
		height: 36px;
		flex: 0 0 36px;
		display: grid;
		place-items: center;
		border-radius: 10px;
		background: var(--green-soft);
	}

	.trust-icon svg {
		width: 20px;
		stroke: var(--green);
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.6;
	}

	.trust-note strong,
	.trust-note span:last-child {
		display: block;
	}

	.trust-note strong {
		margin: 1px 0 5px;
		font-size: 13px;
	}

	.trust-note div > span {
		max-width: 280px;
		color: var(--muted);
		font-size: 12px;
		line-height: 1.5;
	}

	.form-card {
		padding: 36px 38px 30px;
		border: 1px solid #e6ebe7;
		border-radius: 16px;
		background: #fff;
		box-shadow: 0 18px 48px rgba(25, 55, 38, 0.08);
	}

	.mobile-heading {
		display: none;
	}

	.form-heading {
		margin-bottom: 25px;
	}

	.form-heading h2 {
		margin: 0 0 7px;
		font-size: 23px;
		font-weight: 730;
		letter-spacing: -0.045em;
	}

	.form-heading p {
		margin: 0;
		color: var(--muted);
		font-size: 13px;
	}

	.register-form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.name-fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.field {
		min-width: 0;
	}

	.field label {
		display: block;
		margin-bottom: 7px;
		font-size: 12px;
		font-weight: 700;
	}

	.optional {
		margin-left: 3px;
		color: #89928d;
		font-size: 11px;
		font-weight: 450;
	}

	.input-wrap {
		position: relative;
	}

	.field input {
		width: 100%;
		height: 43px;
		box-sizing: border-box;
		padding: 0 40px 0 12px;
		border: 1px solid var(--line);
		border-radius: 7px;
		outline: none;
		background: #fff;
		color: var(--ink);
		font: inherit;
		font-size: 12px;
		transition: border-color 150ms ease, box-shadow 150ms ease;
	}

	.field > input {
		padding-right: 12px;
	}

	.field input::placeholder {
		color: #919a95;
		opacity: 1;
	}

	.field input:focus {
		border-color: var(--green);
		box-shadow: 0 0 0 3px rgba(35, 118, 79, 0.12);
	}

	.field-icon,
	.password-toggle {
		position: absolute;
		top: 50%;
		right: 11px;
		width: 16px;
		height: 16px;
		transform: translateY(-50%);
		color: #89928d;
	}

	.field-icon {
		pointer-events: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.5;
	}

	.password-toggle {
		display: grid;
		place-items: center;
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
	}

	.password-toggle:hover {
		color: var(--green);
	}

	.password-toggle svg {
		width: 17px;
		height: 17px;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.5;
	}

	.field-hint {
		margin: 6px 0 0;
		color: #818b85;
		font-size: 10px;
		line-height: 1.45;
	}

	.submit-button {
		min-height: 44px;
		margin-top: 1px;
		border: 0;
		border-radius: 7px;
		background: var(--green);
		color: #fff;
		font: inherit;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: background 150ms ease, transform 150ms ease;
	}

	.submit-button:hover {
		background: var(--green-dark);
	}

	.submit-button:active {
		transform: translateY(1px);
	}

	.submit-button:focus-visible,
	.password-toggle:focus-visible,
	.brand:focus-visible,
	a:focus-visible {
		outline: 3px solid rgba(35, 118, 79, 0.35);
		outline-offset: 3px;
	}

	.form-footnote {
		margin: -7px 0 0;
		color: #7c8781;
		font-size: 10px;
		line-height: 1.55;
		text-align: center;
	}

	.form-message {
		margin: -8px 0 0;
		color: var(--green);
		font-size: 12px;
		line-height: 1.5;
		text-align: center;
	}

	.form-message[data-error] {
		color: #a43e39;
	}

	.submit-button:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.mobile-login {
		display: none;
	}

	.page-footer {
		padding: 0 24px 24px;
		color: #8a948e;
		font-size: 11px;
		text-align: center;
	}

	@media (max-width: 760px) {
		.register-page {
			background: #fff;
		}

		.site-header {
			width: 100%;
			min-height: 62px;
			box-sizing: border-box;
			padding: 0 20px;
			border-bottom: 1px solid #edf0ed;
		}

		.brand {
			gap: 8px;
			font-size: 15px;
		}

		.brand-mark {
			width: 28px;
			height: 28px;
			border-radius: 7px;
		}

		.header-prompt,
		.intro,
		.page-footer {
			display: none;
		}

		.register-layout {
			width: 100%;
			display: block;
			margin: 0;
			padding: 0;
		}

		.form-card {
			max-width: 520px;
			margin: 0 auto;
			padding: 0 24px 32px;
			border: 0;
			border-radius: 0;
			box-shadow: none;
		}

		.mobile-heading {
			min-height: 55px;
			display: flex;
			align-items: center;
			gap: 12px;
			margin: 0 -24px 22px;
			padding: 0 20px;
			border-bottom: 1px solid #f0f2f0;
			font-size: 13px;
			font-weight: 650;
		}

		.back-link {
			width: 28px;
			height: 28px;
			display: grid;
			place-items: center;
			color: var(--ink);
		}

		.back-link svg {
			width: 18px;
			height: 18px;
			stroke: currentColor;
			stroke-linecap: round;
			stroke-linejoin: round;
			stroke-width: 1.6;
		}

		.form-heading {
			margin-bottom: 23px;
		}

		.form-heading h2 {
			font-size: 23px;
		}

		.register-form {
			gap: 17px;
		}

		.field label {
			font-size: 11px;
		}

		.field input {
			height: 42px;
			font-size: 12px;
		}

		.submit-button {
			min-height: 44px;
			margin-top: 2px;
		}

		.mobile-login {
			display: block;
			margin-top: 2px;
			text-align: center;
			font-size: 12px;
		}
	}

	@media (max-width: 360px) {
		.name-fields {
			grid-template-columns: 1fr;
			gap: 17px;
		}

		.form-card {
			padding-right: 18px;
			padding-left: 18px;
		}

		.mobile-heading {
			margin-right: -18px;
			margin-left: -18px;
			padding-right: 16px;
			padding-left: 16px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		* {
			scroll-behavior: auto !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
