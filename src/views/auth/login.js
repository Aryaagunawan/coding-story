import { AuthPresenter } from '../../presenters/AuthPresenter.js';

export async function LoginView() {
  const loginView = document.createElement('div');
  loginView.className = 'auth-view';
  loginView.id = 'main-content';

  loginView.innerHTML = `
    <div class="auth-container">
      <div class="auth-header">
        <h1>Welcome Back</h1>
        <p>Share your Dicoding experiences with the community</p>
      </div>
      
      <form id="loginForm" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required aria-required="true">
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input type="password" id="password" name="password" required aria-required="true">
            <button type="button" class="toggle-password" aria-label="Show password">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        
        <button type="submit" class="btn-primary">Login</button>
      </form>
      
      <div class="auth-footer">
        <p>Don't have an account? <a href="#/register">Register here</a></p>
      </div>
    </div>
    
    <div class="auth-image">
      <img src="/src/assets/3918386.jpg" alt="People sharing stories" class="illustration">
    </div>
  `;

  // Initialize Presenter with callback functions
  const presenter = new AuthPresenter({
    onLoginSuccess: () => {
      window.location.hash = '#/stories';
    },
    onLoginError: (message) => {
      // Assuming you have a showToast function available
      showToast(message, 'error');
    }
  });

  // Form submission
  loginView.querySelector('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginView.querySelector('#email').value;
    const password = loginView.querySelector('#password').value;

    // Use the presenter instance to handle login
    presenter.login(email, password);
  });

  // Toggle password visibility
  loginView.querySelector('.toggle-password').addEventListener('click', () => {
    const passwordInput = loginView.querySelector('#password');
    const icon = loginView.querySelector('.toggle-password i');

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });

  return loginView;
}