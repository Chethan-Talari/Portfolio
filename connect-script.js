document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.connect-form');
  const btn = document.querySelector('.btn-send');

  if (!form) return;

  form.addEventListener('submit', e => {
    btn.textContent = 'Sending...';
    btn.disabled = true;
  });

  // footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
