document.addEventListener('DOMContentLoaded', function () {

    // ==========================================
    // MOBILE NAVIGATION TOGGLE
    // ==========================================
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('open');

            if (mainNav.classList.contains('open')) {
                mainNav.style.display = 'block';
            } else {
                mainNav.style.display = '';
            }
        });
    }


    // ==========================================
    // DROPDOWN MENUS
    // About KSK / Publications
    // ==========================================
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    dropdownToggles.forEach(function (toggle) {

        toggle.addEventListener('click', function (event) {

            // Prevent href="#" from jumping to the top
            event.preventDefault();

            const parentDropdown = this.closest('.has-dropdown');

            if (!parentDropdown) {
                return;
            }

            // Close other open dropdowns
            document.querySelectorAll('.has-dropdown.active').forEach(function (dropdown) {

                if (dropdown !== parentDropdown) {
                    dropdown.classList.remove('active');

                    const otherToggle = dropdown.querySelector('.dropdown-toggle');

                    if (otherToggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                    }
                }

            });

            // Toggle the clicked dropdown
            parentDropdown.classList.toggle('active');

            // Update accessibility state
            this.setAttribute(
                'aria-expanded',
                parentDropdown.classList.contains('active')
                    ? 'true'
                    : 'false'
            );

        });

    });


    // ==========================================
    // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
    // ==========================================
    document.addEventListener('click', function (event) {

        const clickedInsideDropdown = event.target.closest('.has-dropdown');

        if (!clickedInsideDropdown) {

            document.querySelectorAll('.has-dropdown.active').forEach(function (dropdown) {

                dropdown.classList.remove('active');

                const toggle = dropdown.querySelector('.dropdown-toggle');

                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                }

            });

        }

    });


    // ==========================================
    // MOBILE DROPDOWN BEHAVIOUR
    // ==========================================
    window.addEventListener('resize', function () {

        // When returning to desktop, remove mobile-open
        // states if necessary.
        if (window.innerWidth > 720) {

            if (mainNav) {
                mainNav.style.display = '';
            }

        }

    });


    // ==========================================
    // FAQ ACCORDION
    // ==========================================
    const accordionToggles = document.querySelectorAll('.accordion-toggle');

    accordionToggles.forEach(function (button) {

        button.addEventListener('click', function () {

            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);

            if (!content) {
                return;
            }

            // Toggle current FAQ item
            content.classList.toggle('open');

            // Update accessibility state
            const isOpen = content.classList.contains('open');

            this.setAttribute(
                'aria-expanded',
                isOpen ? 'true' : 'false'
            );

        });

    });

});