const form = document.getElementById('form');
const result = document.getElementById('result');
const button = form.querySelector('button');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  result.textContent = '';
  button.disabled = true;

  const data = Object.fromEntries(new FormData(form));

  if (!data.name || !data.email || !data.message) {
    result.textContent = 'Please fill required fields.';
    result.className = 'error';
    button.disabled = false;
    return;
  }

  try {
    const resp = await fetch('/api/sendd-email', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    });

    if (resp.ok) {
      result.textContent = 'Message sent!';
      result.className = 'success';
      form.reset();
    } else {
      const body = await resp.json().catch(() => ({ error: 'Server error' }));
      result.textContent = 'Failed: ' + (body.error || 'Unknown error');
      result.className = 'error';
    }
  } catch (err) {
    console.error(err);
    result.textContent = 'Network error.';
    result.className = 'error';
  } finally {
    button.disabled = false;
  }
});
