document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('contact-form');

    if (!form) {
        return;
    }

    const name = document.getElementById('contact-name');
    const email = document.getElementById('contact-email');
    const reason = document.getElementById('contact-reason');
    const message = document.getElementById('contact-message');

    function showError(field, text) {

        const error = form.querySelector(
            '[data-error-for="' + field + '"]'
        );

        if (error) {
            error.textContent = text;
        }
    }

    function clearErrors() {

        form.querySelectorAll('.form-error').forEach(function (error) {
            error.textContent = '';
        });
    }

    function validEmail(value) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    form.addEventListener('submit', function (event) {

        event.preventDefault();

        clearErrors();

        let valid = true;

        if (!name.value.trim()) {

            showError(
                'name',
                'Please enter your name.'
            );

            valid = false;
        }

        if (!email.value.trim()) {

            showError(
                'email',
                'Please enter your email address.'
            );

            valid = false;

        } else if (!validEmail(email.value.trim())) {

            showError(
                'email',
                'Please enter a valid email address.'
            );

            valid = false;
        }

        if (!reason.value) {

            showError(
                'reason',
                'Please select a reason for contacting us.'
            );

            valid = false;
        }

        if (!message.value.trim()) {

            showError(
                'message',
                'Please enter your message.'
            );

            valid = false;
        }

        if (!valid) {
            return;
        }

        form.classList.add('is-loading');

        const button =
            form.querySelector('.contact-submit');

        button.disabled = true;

        /*
         * Submit to Express after client-side validation.
         */
        form.submit();

    });

});