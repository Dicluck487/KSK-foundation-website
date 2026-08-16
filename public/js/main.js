document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      nav.style.display = nav.classList.contains('open') ? 'block' : '';
    });
  }

  // // Mobile dropdown toggles (About KSK / Publications mega-menus)
  // var dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  // dropdownToggles.forEach(function (link) {
  //   link.addEventListener('click', function (e) {
  //     if (window.innerWidth <= 720) {
  //       e.preventDefault();
  //       var parentLi = link.closest('.has-dropdown');
  //       if (parentLi) parentLi.classList.toggle('open');
  //     }
  //   });
  // });


  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {

    toggle.addEventListener('click', function() {

        const parent = this.closest('.has-dropdown');

        parent.classList.toggle('active');

    });

});
  // FAQ accordion
  var toggles = document.querySelectorAll('.accordion-toggle');
  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-target');
      var content = document.getElementById(targetId);
      if (content) {
        content.classList.toggle('open');
      }
    });
  });
});
