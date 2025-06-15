import { registerUser } from '../api/authApi.js';

export default class RegisterView {
  constructor(root) {
    this.root = root;
  }

  clear() {
    this.root.innerHTML = '';
  }

  render() {
    this.clear();

    const form = document.createElement('form');
    form.innerHTML = `
      <h2>Daftar</h2>
      <label for="name">Nama</label>
      <input id="name" type="text" required />
      <label for="email">Email</label>
      <input id="email" type="email" required />
      <label for="password">Password</label>
      <input id="password" type="password" required minlength="8" />
      <button type="submit">Register</button>
      <p>Sudah punya akun? <a href="#login">Login di sini</a></p>
    `;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = form.querySelector('#name').value;
      const email = form.querySelector('#email').value;
      const password = form.querySelector('#password').value;

      try {
        await registerUser(name, email, password);
        alert('Registrasi berhasil! Silakan login.');
        location.hash = '#login';
      } catch (err) {
        alert('Registrasi gagal: ' + err.message);
      }
    });

    this.root.appendChild(form);
  }
}