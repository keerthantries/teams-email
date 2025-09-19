document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = {
    name: this.name.value,
    email: this.email.value,
    message: this.message.value
  };

  try {
    const response = await fetch('/api/sendd-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const contentType = response.headers.get('content-type');
    let result;

    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON: ${text}`);
    }

    alert(result.message);
  } catch (err) {
    console.error('Response parsing error:', err);
    alert('Something went wrong. Please try again later.');
  }
});
