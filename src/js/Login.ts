export function initializeLogin() {
	const loginForm = document.querySelector<HTMLFormElement>('.login-form');

	loginForm?.addEventListener('submit', async (event) => {
		event.preventDefault();
		const button = loginForm.querySelector<HTMLButtonElement>('button[type="submit"]');
		const status = loginForm.querySelector<HTMLParagraphElement>('.form-message');
		if (!button || !status) return;

		button.disabled = true;
		button.textContent = 'Signing in...';
		status.textContent = '';
		status.removeAttribute('data-error');

		try {
			const response = await fetch(loginForm.action, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(Object.fromEntries(new FormData(loginForm))),
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.message ?? 'Unable to sign in.');
			window.location.assign('/blocks');
		} catch (error) {
			status.dataset.error = 'true';
			status.textContent = error instanceof Error ? error.message : 'Unable to sign in. Please try again.';
		} finally {
			button.disabled = false;
			button.textContent = 'Log in';
		}
	});
}
