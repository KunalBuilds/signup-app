document.addEventListener('DOMContentLoaded', () => {
    const forgotLink = document.getElementById('forgot-password-link');
    const loginForm = document.querySelector('.login form[action="/login"]');
    const forgotForm = document.querySelector('.forgot-password');
    const verifyForm = document.querySelector('.verify-otp');
    const resetForm = document.querySelector('.reset-password');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const verifyOtpForm = document.getElementById('verify-otp-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const resendOtpButton = document.getElementById('resend-otp');
    const timerSpan = document.getElementById('timer');

    console.log('Elements loaded:', { forgotLink, loginForm, forgotForm, verifyForm, resetForm, forgotPasswordForm, verifyOtpForm, resetPasswordForm, resendOtpButton });

    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        forgotForm.style.display = 'block';
    });

    let countdown;

    function startTimer() {
        let timeLeft = 60;
        resendOtpButton.style.display = 'block';
        resendOtpButton.disabled = true;
        timerSpan.textContent = timeLeft;

        countdown = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(countdown);
                resendOtpButton.disabled = false;
                timerSpan.textContent = '60';
            }
        }, 1000);
    }

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(forgotPasswordForm);
        const email = formData.get('email');
        console.log('Sending to /forgot-password:', email);

        try {
            const response = await fetch('/forgot-password', {
                method: 'POST',
                body: formData
            });
            const text = await response.text();
            console.log('Server response:', text);

            if (text.startsWith('OTP sent to')) {
                forgotForm.style.display = 'none';
                verifyForm.style.display = 'block';
                verifyForm.querySelector('input[name="email"]').value = email || '';
                alert('OTP sent to ' + email + '. Check your email!');
                startTimer(); // Start the 60-second timer
            } else {
                alert(text);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Error: ' + error.message);
        }
    });

    resendOtpButton.addEventListener('click', async () => {
        const email = verifyForm.querySelector('input[name="email"]').value;
        console.log('Resending OTP to:', email);

        try {
            const response = await fetch('/forgot-password', {
                method: 'POST',
                body: new URLSearchParams({ email }) // Send email only
            });
            const text = await response.text();
            console.log('Server response:', text);

            if (text.startsWith('OTP sent to')) {
                alert('OTP resent to ' + email + '. Check your email!');
                startTimer(); // Restart the timer
            } else {
                alert(text);
            }
        } catch (error) {
            console.error('Resend error:', error);
            alert('Error: ' + error.message);
        }
    });

    verifyOtpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(verifyOtpForm);
        const email = formData.get('email');
        const otp = formData.get('otp');
        console.log('Sending to /verify-otp:', { email, otp });

        try {
            const response = await fetch('/verify-otp', {
                method: 'POST',
                body: formData
            });
            const text = await response.text();
            console.log('Server response:', text);

            if (text === 'OTP verified!') {
                clearInterval(countdown); // Stop timer on successful verification
                resendOtpButton.style.display = 'none';
                verifyForm.style.display = 'none';
                resetForm.style.display = 'block';
                resetForm.querySelector('input[name="email"]').value = email || '';
                alert('OTP verified!');
            } else {
                alert(text);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Error: ' + error.message);
        }
    });

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(resetPasswordForm);
        const email = formData.get('email');
        const newPassword = formData.get('newPassword');
        const confirmNewPassword = formData.get('confirmNewPassword');
        console.log('Sending to /reset-password:', { email, newPassword, confirmNewPassword });

        try {
            const response = await fetch('/reset-password', {
                method: 'POST',
                body: formData
            });
            const text = await response.text();
            console.log('Server response:', text);

            if (text.includes('Password reset successful')) {
                alert('Password reset successful! You can now log in.');
                resetForm.style.display = 'none';
                loginForm.style.display = 'block';
            } else {
                alert(text);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Error: ' + error.message);
        }
    });
});