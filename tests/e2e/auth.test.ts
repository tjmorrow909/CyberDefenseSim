import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Simple E2E test using fetch API
// In a real project, you might use Playwright or Cypress

const BASE_URL = 'http://localhost:5000';

describe('Authentication E2E Tests', () => {
  let server: any;

  beforeAll(async () => {
    // In a real E2E setup, you would start your server here
    // For now, we assume the server is running
  });

  afterAll(async () => {
    // Clean up server if needed
  });

  it('should register a new user successfully', async () => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPass123!',
    };

    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe(userData.email);
    expect(data.data.accessToken).toBeDefined();
    expect(data.data.refreshToken).toBeDefined();
  });

  it('should login with valid credentials', async () => {
    // First register a user
    const userData = {
      firstName: 'Login',
      lastName: 'Test',
      email: `login-test-${Date.now()}@example.com`,
      password: 'LoginTest123!',
    };

    await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    // Then login
    const loginData = {
      email: userData.email,
      password: userData.password,
    };

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe(userData.email);
    expect(data.data.accessToken).toBeDefined();
    expect(data.data.refreshToken).toBeDefined();
  });

  it('should reject login with invalid credentials', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    };

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Invalid email or password');
  });

  it('should access protected route with valid token', async () => {
    // Register and login to get token
    const userData = {
      firstName: 'Protected',
      lastName: 'Test',
      email: `protected-test-${Date.now()}@example.com`,
      password: 'ProtectedTest123!',
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const registerData = await registerResponse.json();
    const accessToken = registerData.data.accessToken;
    const userId = registerData.data.user.id;

    // Access protected route
    const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe(userData.email);
  });

  it('should reject access to protected route without token', async () => {
    const response = await fetch(`${BASE_URL}/api/users/test-user-id`);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Access token required');
  });

  it('should refresh tokens successfully', async () => {
    // Register and login to get tokens
    const userData = {
      firstName: 'Refresh',
      lastName: 'Test',
      email: `refresh-test-${Date.now()}@example.com`,
      password: 'RefreshTest123!',
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const registerData = await registerResponse.json();
    const refreshToken = registerData.data.refreshToken;

    // Refresh tokens
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.accessToken).toBeDefined();
    expect(data.data.refreshToken).toBeDefined();
    expect(data.data.accessToken).not.toBe(registerData.data.accessToken);
    expect(data.data.refreshToken).not.toBe(refreshToken);
  });

  it('should logout successfully', async () => {
    // Register and login to get tokens
    const userData = {
      firstName: 'Logout',
      lastName: 'Test',
      email: `logout-test-${Date.now()}@example.com`,
      password: 'LogoutTest123!',
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const registerData = await registerResponse.json();
    const refreshToken = registerData.data.refreshToken;

    // Logout
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('Logout successful');

    // Try to use the refresh token again (should fail)
    const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    expect(refreshResponse.status).toBe(401);
  });
});
