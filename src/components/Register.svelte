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

<script>
	import { initializeRegister } from '../js/Register';
	import { onMount } from 'svelte';
	import '../styles/Register.css';

	onMount(() => {
		initializeRegister();
	});
</script>
