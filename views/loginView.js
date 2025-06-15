import { loginUser } from '../api/authApi.js';

export default class LoginView {
  constructor(root, onLoginSuccess) {
    this.root = root;
    this.onLoginSuccess = onLoginSuccess;
  }

  clear() {
    this.root.innerHTML = '';
  }

  render() {
    this.clear();

    const form = document.createElement('form');
    form.innerHTML = `
      <h2>Login</h2>
      <label for="email">Email</label>
      <input id="email" type="email" required />
      <label for="password">Password</label>
      <input id="password" type="password" required />
      <button type="submit">Login</button>
      <p>Belum punya akun? <a href="#register">Daftar di sini</a></p>
    `;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('#email').value;
      const password = form.querySelector('#password').value;

      try {
        const result = await loginUser(email, password);
        alert(`Selamat datang, ${result.name}!`);
        this.onLoginSuccess();
        location.hash = '#list';
      } catch (err) {
        alert('Login gagal: ' + err.message);
      }
    });

    this.root.appendChild(form);
  }
}