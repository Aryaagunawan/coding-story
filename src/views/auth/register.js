import { AuthPresenter } from '../../presenters/AuthPresenter.js';
import { showToast } from '../../utils/api.js';

export default async function RegisterView() {
  const registerView = document.createElement('div');
  registerView.className = 'auth-view';
  registerView.id = 'main-content';

  registerView.innerHTML = `
    <div class="auth-container">
      <div class="auth-header">
        <h1>Create Account</h1>
        <p>Join our community and share your Dicoding journey</p>
      </div>
      
      <form id="registerForm" class="auth-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" name="name" required aria-required="true">
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required aria-required="true">
        </div>
        
        <div class="form-group">
          <label for="password">Password (min 8 characters)</label>
          <div class="password-input">
            <input type="password" id="password" name="password" minlength="8" required aria-required="true">
            <button type="button" class="toggle-password" aria-label="Show password">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        
        <button type="submit" class="btn-primary">Register</button>
      </form>
      
      <div class="auth-footer">
        <p>Already have an account? <a href="#/login">Login here</a></p>
      </div>
    </div>
    
    <div class="auth-image">
      <img src="/src/assets/3918386.jpg" alt="People joining community" class="illustration">
    </div>
  `;

  // Initialize AuthPresenter with callback functions
  const presenter = new AuthPresenter({
    onRegisterSuccess: () => {
      showToast('Registration successful! Please login', 'success');
      window.location.hash = '#/login';
    },
    onRegisterError: (message) => {
      showToast(message, 'error');
    },
    // Add dummy callbacks for other methods (though they won't be used here)
    onLoginSuccess: () => { },
    onLoginError: () => { },
    onLogoutSuccess: () => { }
  });

  // Form submission handler
  registerView.querySelector('#registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = registerView.querySelector('#name').value;
    const email = registerView.querySelector('#email').value;
    const password = registerView.querySelector('#password').value;

    // Use the presenter instance to handle registration
    await presenter.register(name, email, password);
  });

  // Toggle password visibility
  registerView.querySelector('.toggle-password').addEventListener('click', () => {
    const passwordInput = registerView.querySelector('#password');
    const icon = registerView.querySelector('.toggle-password i');

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });

  return registerView;
}