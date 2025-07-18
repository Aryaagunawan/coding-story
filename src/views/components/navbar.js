// src/views/components/navbar.js
import { AuthPresenter } from '../../presenters/AuthPresenter.js';

export default async function Navbar() {
  const navbar = document.createElement('nav');
  navbar.className = 'navbar';

  navbar.innerHTML = `
    <div class="navbar-container">
      <a href="#/stories" class="navbar-brand">
        <i class="fas fa-book-open"></i> Dicoding Stories
      </a>
      
      <div class="navbar-menu">
        <a href="#/stories" class="navbar-link">
          <i class="fas fa-home"></i> Home
        </a>
        <a href="#/add-story" class="navbar-link">
          <i class="fas fa-plus"></i> Add Story
        </a>
        <button id="logoutBtn" class="navbar-link">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
      
      <button class="navbar-toggle" aria-label="Toggle menu">
        <i class="fas fa-bars"></i>
      </button>
    </div>
  `;

  // Toggle mobile menu
  navbar.querySelector('.navbar-toggle').addEventListener('click', () => {
    navbar.querySelector('.navbar-menu').classList.toggle('active');
  });

  // Inisialisasi AuthPresenter dengan view dummy karena navbar tidak membutuhkan callback
  const authPresenter = new AuthPresenter({
    onLoginSuccess: () => { },
    onLoginError: () => { },
    onRegisterSuccess: () => { },
    onRegisterError: () => { },
    onLogoutSuccess: () => {
      window.location.hash = '#/login';
    }
  });

  navbar.querySelector('#logoutBtn').addEventListener('click', () => {
    authPresenter.logout();
  });

  return navbar;
}