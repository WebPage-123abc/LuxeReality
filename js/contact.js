/* ============================================================
   contact.js — Contact Form Handler for ARIA Interiors
   Uses EmailJS to send form submissions directly from the browser.
   No backend server required.

   SETUP CHECKLIST (3 things to replace before going live):
   1. EmailJS Public Key  → line ~25  (emailjs.init)
   2. EmailJS Service ID  → line ~85  (emailjs.send, 1st argument)
   3. EmailJS Template ID → line ~85  (emailjs.send, 2nd argument)

   HOW TO GET THESE VALUES:
   ① Go to https://www.emailjs.com and create a free account
   ② Connect your email (Gmail, Outlook, etc.) as a Service
      → Dashboard → Email Services → Add New Service
      → Copy the Service ID (looks like: service_abc1234)
   ③ Create an Email Template
      → Dashboard → Email Templates → Create New Template
      → Use variables: {{fullName}}, {{email}}, {{phone}},
        {{service}}, {{message}}
      → Copy the Template ID (looks like: template_xyz5678)
   ④ Get your Public Key
      → Dashboard → Account → General → Public Key
      → Copy it (looks like: abcDEF1234567890)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('contact-form');
  if (!form) return; // Only runs on contact.html

  const successMessage = document.getElementById('success-message');

  /* ============================================================
     EMAILJS INITIALISATION
     REPLACE: 'YOUR_PUBLIC_KEY' with your actual EmailJS Public Key
     Found at: https://dashboard.emailjs.com/admin/account
     Example:  emailjs.init('abcDEF1234567890xyzW')
  ============================================================ */
  if (typeof emailjs !== 'undefined') {
    emailjs.init('YOUR_PUBLIC_KEY'); // ← REPLACE THIS
  }

  /* ============================================================
     INLINE VALIDATION HELPERS
     showError: appends a red error message below the field
     clearError: removes the error message
  ============================================================ */
  const showError = (input, message) => {
    const formGroup = input.closest('.form-group');
    let errorEl = formGroup.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      formGroup.appendChild(errorEl);
    }
    errorEl.textContent = message;
    errorEl.classList.add('show');
    input.style.borderBottomColor = '#e53935';
  };

  const clearError = (input) => {
    const formGroup = input.closest('.form-group');
    const errorEl = formGroup ? formGroup.querySelector('.form-error') : null;
    if (errorEl) errorEl.classList.remove('show');
    input.style.borderBottomColor = '';
  };

  /* ============================================================
     PER-FIELD VALIDATION RULES
     REPLACE: validation messages if you want different copy.
     REPLACE: minimum message length (currently 20 chars).
  ============================================================ */
  const validateField = (input) => {
    clearError(input);
    const value = input.value.trim();

    // Full name — minimum 2 characters
    if (input.name === 'fullName' && value.length < 2) {
      showError(input, 'Please enter your full name.');
      return false;
    }

    // Email — basic format check
    if (input.name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        showError(input, 'Please enter a valid email address.');
        return false;
      }
    }

    // Phone — optional field, only validates if filled in
    if (input.name === 'phone' && value !== '') {
      const phoneRegex = /^[+]?[\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(value)) {
        showError(input, 'Please enter a valid phone number.');
        return false;
      }
    }

    // Service dropdown — must select an option
    if (input.name === 'service' && value === '') {
      showError(input, 'Please select a service.');
      return false;
    }

    // Message — minimum 20 characters
    // REPLACE: 20 with a higher/lower minimum if desired
    if (input.name === 'message' && value.length < 20) {
      showError(input, 'Please write at least 20 characters.');
      return false;
    }

    return true;
  };

  /* ============================================================
     FORM SUBMIT HANDLER
  ============================================================ */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all fields before submitting
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (!validateField(input)) isValid = false;
    });

    if (!isValid) return;

    // Show loading state on the button
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    /* ============================================================
       EMAILJS SEND
       REPLACE: 'YOUR_SERVICE_ID'  with your EmailJS Service ID
                 Example: 'service_abc1234'
       REPLACE: 'YOUR_TEMPLATE_ID' with your EmailJS Template ID
                 Example: 'template_xyz5678'

       Template variables used (must match your EmailJS template):
         {{fullName}}  — sender's full name
         {{email}}     — sender's email address
         {{phone}}     — sender's phone (may be blank)
         {{service}}   — selected service
         {{message}}   — message body
    ============================================================ */
    const templateParams = {
      fullName : form.fullName.value.trim(),
      email    : form.email.value.trim(),
      phone    : form.phone.value.trim(),
      service  : form.service.value,
      message  : form.message.value.trim()
    };

    if (typeof emailjs !== 'undefined') {
      emailjs.send(
        'YOUR_SERVICE_ID',   // ← REPLACE with your EmailJS Service ID
        'YOUR_TEMPLATE_ID',  // ← REPLACE with your EmailJS Template ID
        templateParams
      )
      .then(() => {
        // Success — show inline success message then redirect
        form.style.display = 'none';
        successMessage.classList.add('show');

        // Redirect to thank-you page after 2 seconds
        // REPLACE: 2000 (ms) to change the delay before redirect
        setTimeout(() => {
          window.location.href = './thank-you.html';
        }, 2000);
      })
      .catch((error) => {
        // EmailJS error — re-enable the button so user can retry
        console.error('EmailJS error:', error);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        // Show a non-alert inline error
        const formBox = form.closest('div');
        let globalError = formBox.querySelector('.global-error');
        if (!globalError) {
          globalError = document.createElement('p');
          globalError.className = 'global-error';
          globalError.style.cssText = 'color:#e53935;font-size:13px;text-align:center;margin-top:16px;';
          form.appendChild(globalError);
        }
        // REPLACE: error message text below
        globalError.textContent = 'Something went wrong. Please try again or email us directly.';
      });

    } else {
      /* ============================================================
         FALLBACK — EmailJS script failed to load
         Simulates success for testing/demo purposes only.
         REMOVE this block before going live if not needed.
      ============================================================ */
      console.warn('EmailJS not loaded — simulating success for demo.');
      setTimeout(() => {
        form.style.display = 'none';
        successMessage.classList.add('show');
        setTimeout(() => {
          window.location.href = './thank-you.html';
        }, 2000);
      }, 1000);
    }
  });

  /* ============================================================
     REAL-TIME VALIDATION
     Validates each field on blur (when focus leaves the field)
     and clears errors as the user types.
  ============================================================ */
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur',  () => validateField(input));
    input.addEventListener('input', () => clearError(input));
  });

});
/* ============================================================
   END OF contact.js
   ============================================================ */