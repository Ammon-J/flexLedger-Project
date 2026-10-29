<main class="login-page">
	<a class="brand" href="/">
		<span class="brand-mark" aria-hidden="true">F</span>
		<span>FlexLedger</span>
	</a>

	<section class="login-card" aria-labelledby="login-title">
		<p class="eyebrow">Welcome back</p>
		<h1 id="login-title">Sign in to your ledger.</h1>
		<p class="intro">Keep every delivery mile and vehicle expense in one place.</p>

		<form class="login-form" action="/api/login" method="post">
			<div class="field">
				<label for="email">Email address</label>
				<input id="email" name="email" type="email" autocomplete="email" required />
			</div>
			<div class="field">
				<label for="password">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					maxlength="128"
					required
				/>
			</div>
			<button type="submit">Log in</button>
			<p class="form-message" role="status" aria-live="polite"></p>
		</form>
		<p class="register-prompt">New to FlexLedger? <a href="/">Create an account</a></p>
	</section>
</main>

<script>
	import { initializeLogin } from '../js/Login';
	import { onMount } from 'svelte';
	import '../styles/Login.css';

	onMount(() => {
		initializeLogin();
	});
</script>
