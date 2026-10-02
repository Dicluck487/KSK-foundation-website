document.addEventListener('DOMContentLoaded', function () {

    const questions =
        document.querySelectorAll('.faq-question');

    if (!questions.length) {
        return;
    }

    questions.forEach(function (question) {

        question.addEventListener('click', function () {

            const currentItem =
                question.closest('.faq-item');

            const isOpen =
                currentItem.classList.contains('active');


            /*
             * Close all other questions.
             * This keeps the FAQ clean and prevents
             * the entire page becoming too long.
             */

            document
                .querySelectorAll('.faq-item.active')
                .forEach(function (item) {

                    if (item !== currentItem) {

                        item.classList.remove('active');

                        const button =
                            item.querySelector('.faq-question');

                        if (button) {
                            button.setAttribute(
                                'aria-expanded',
                                'false'
                            );
                        }

                    }

                });


            /*
             * Toggle current question
             */

            if (isOpen) {

                currentItem.classList.remove('active');

                question.setAttribute(
                    'aria-expanded',
                    'false'
                );

            } else {

                currentItem.classList.add('active');

                question.setAttribute(
                    'aria-expanded',
                    'true'
                );

            }

        });

    });

});