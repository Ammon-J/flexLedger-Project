import { spawn } from 'node:child_process';

let shuttingDown = false;

function shutdown(exitCode = 0) {
	if (shuttingDown) return;
	shuttingDown = true;
	process.exitCode = exitCode;

	for (const child of children) {
		if (child.exitCode === null && child.signalCode === null) {
			child.kill();
		}
	}
}

const children = [
	{
		name: 'API',
		args: ['--env-file-if-exists=.env', 'server/server.js'],
	},
	{
		name: 'WEB',
		args: ['node_modules/astro/bin/astro.mjs', 'dev'],
	},
].map(({ name, args }) => {
	const child = spawn(process.execPath, args, { stdio: 'inherit' });
	child.on('error', (error) => {
		console.error(`${name} process failed to start:`, error);
		shutdown(1);
	});
	child.on('exit', (code, signal) => {
		if (!shuttingDown) {
			console.error(`${name} process exited${signal ? ` from ${signal}` : ` with code ${code}`}.`);
			shutdown(code ?? 1);
		}
	});
	return child;
});

process.once('SIGINT', () => shutdown(0));
process.once('SIGTERM', () => shutdown(0));
