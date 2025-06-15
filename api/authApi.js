const BASE_URL = 'https://story-api.dicoding.dev/v1';

export async function registerUser(name, email, password) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.message || 'Registrasi gagal');
  }

  return data;
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.message || 'Login gagal');
  }

  localStorage.setItem('token', data.loginResult.token);
  localStorage.setItem('userName', data.loginResult.name);
  return data.loginResult;
}