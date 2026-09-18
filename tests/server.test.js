import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

async function waitForServer(port) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }
    await sleep(200);
  }

  throw new Error(`Server did not start in time on port ${port}.`);
}

test('booking in a past date is rejected', async () => {
  const port = 4011;
  const server = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForServer(port);

    const response = await fetch(`http://localhost:${port}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceId: 1,
        date: '2020-01-01',
        startTime: '09:00',
        endTime: '10:00',
        name: 'Alice',
        purpose: 'Testing'
      })
    });

    const body = await response.json();

    assert.equal(response.status, 400, `Expected 400 but got ${response.status}: ${JSON.stringify(body)}`);
    assert.match(body.message, /current date|today/i, `Unexpected message: ${body.message}`);
  } finally {
    server.kill('SIGTERM');
    await sleep(200);
  }
});

test('adjacent bookings on the same resource are allowed', async () => {
  const port = 4012;
  const server = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let firstId;
  let secondId;

  try {
    await waitForServer(port);

    // Use a random day far in the future so repeated test runs don't
    // collide with bookings created by a previous run.
    const randomDaysOut = 1825 + Math.floor(Math.random() * 5000);
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * randomDaysOut)
      .toISOString()
      .slice(0, 10);

    const firstResponse = await fetch(`http://localhost:${port}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceId: 2,
        date: futureDate,
        startTime: '10:00',
        endTime: '11:00',
        name: 'Alice',
        purpose: 'Testing first slot'
      })
    });

    const firstBody = await firstResponse.json();
    assert.equal(firstResponse.status, 201, `Expected 201 but got ${firstResponse.status}: ${JSON.stringify(firstBody)}`);
    firstId = firstBody.id;

    const secondResponse = await fetch(`http://localhost:${port}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceId: 2,
        date: futureDate,
        startTime: '11:00',
        endTime: '12:00',
        name: 'Bob',
        purpose: 'Testing adjacent slot'
      })
    });

    const secondBody = await secondResponse.json();
    assert.equal(secondResponse.status, 201, `Expected 201 but got ${secondResponse.status}: ${JSON.stringify(secondBody)}`);
    secondId = secondBody.id;
  } finally {
    // Clean up the bookings this test created so the real bookings.json
    // file doesn't accumulate leftover test data.
    if (firstId) {
      await fetch(`http://localhost:${port}/api/bookings/${firstId}/cancel`, { method: 'PATCH' }).catch(() => {});
    }
    if (secondId) {
      await fetch(`http://localhost:${port}/api/bookings/${secondId}/cancel`, { method: 'PATCH' }).catch(() => {});
    }
    server.kill('SIGTERM');
    await sleep(200);
  }
});