export default async function Footer() {
  const footer = document.createElement('footer');
  footer.className = 'footer';

  footer.innerHTML = `
    <div class="footer-container">
      <div class="footer-section">
        <h3>Dicoding Stories</h3>
        <p>Share your learning journey</p>
      </div>
      
      <div class="footer-section">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="#/stories">Home</a></li>
          <li><a href="#/add-story">Add Story</a></li>
          <li><a href="https://dicoding.com" target="_blank">Dicoding</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>Connect</h4>
        <div class="social-links">
          <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
          <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
          <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Stories - Arya Gunawan. All rights reserved.</p>
    </div>
  `;

  return footer;
}