(function () {
  "use strict";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Open / closed status, based on Mundelein (Central) time
  // Mon-Fri 6:30 AM - 9:00 PM, Sat 6:30 AM - 7:30 PM, Sun closed
  var HOURS = {
    1: [390, 1260], // Mon: 6:30 - 21:00 (minutes from midnight)
    2: [390, 1260],
    3: [390, 1260],
    4: [390, 1260],
    5: [390, 1260],
    6: [390, 1170], // Sat: 6:30 - 19:30
    0: null         // Sun: closed
  };

  function updateStatus() {
    var statusEl = document.getElementById("open-status");
    if (!statusEl) return;

    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23"
    }).formatToParts(new Date());

    var weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var weekday = null, hour = 0, minute = 0;
    parts.forEach(function (p) {
      if (p.type === "weekday") weekday = weekdayMap[p.value];
      if (p.type === "hour") hour = parseInt(p.value, 10);
      if (p.type === "minute") minute = parseInt(p.value, 10);
    });

    var today = HOURS[weekday];
    var now = hour * 60 + minute;
    var isOpen = !!today && now >= today[0] && now < today[1];

    statusEl.textContent = isOpen ? "We are open now. Call us!" : "Currently closed. Leave a message or request a quote.";
    statusEl.classList.toggle("is-open", isOpen);
    statusEl.classList.toggle("is-closed", !isOpen);
  }

  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  // Quote form: validate, then open a pre-filled email to Diaz Care
  var form = document.getElementById("quote-form");
  var errorEl = document.getElementById("form-error");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      errorEl.textContent = "";

      var fields = {
        name: form.elements.name,
        phone: form.elements.phone,
        email: form.elements.email,
        service: form.elements.service,
        message: form.elements.message
      };

      Object.keys(fields).forEach(function (key) {
        fields[key].classList.remove("invalid");
      });

      var name = fields.name.value.trim();
      var phone = fields.phone.value.trim();
      var email = fields.email.value.trim();
      var message = fields.message.value.trim();

      var phoneDigits = phone.replace(/\D/g, "");
      var emailOk = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var phoneOk = phoneDigits.length >= 10 && phoneDigits.length <= 11;

      if (!name) {
        fields.name.classList.add("invalid");
        errorEl.textContent = "Please enter your name.";
        fields.name.focus();
        return;
      }
      if (!phoneOk) {
        fields.phone.classList.add("invalid");
        errorEl.textContent = "Please enter a valid phone number.";
        fields.phone.focus();
        return;
      }
      if (!emailOk) {
        fields.email.classList.add("invalid");
        errorEl.textContent = "Please enter a valid email address.";
        fields.email.focus();
        return;
      }

      var subject = "Free Quote Request: " + fields.service.value;
      var body = [
        "Name: " + name,
        "Phone: " + phone,
        "Email: " + (email || "Not provided"),
        "Service: " + fields.service.value,
        "",
        "Project details:",
        message || "(none provided)"
      ].join("\n");

      window.location.href =
        "mailto:diazcarehelp@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      form.reset();
    });
  }
})();
