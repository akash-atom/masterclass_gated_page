// =============================================
// Gated Video Lightbox for Atomicwork Masterclass
// =============================================
// Usage: Add data-vimeo-url="https://vimeo.com/..." to any clickable element.
// First video click shows a name+email form. After submission, all videos play directly.
// Form data is sent to HubSpot and gate state is persisted in localStorage.

(function () {
  "use strict";

  // ----- CONFIG (replace with your real IDs) -----
  var HUBSPOT_PORTAL_ID = "YOUR_PORTAL_ID";
  var HUBSPOT_FORM_ID = "YOUR_FORM_ID";
  var STORAGE_KEY = "gated_video_user";

  // ----- THEME TOKENS (Atomicwork) -----
  var T = {
    fontHeading: "Interdisplay, Arial, sans-serif",
    fontBody: "Intervariable, Arial, sans-serif",
    purple: "#862fe7",
    deepPurple: "#271698",
    navy: "#091135",
    lightPurple: "#c5a3ff",
    lavender: "#e1dbfd",
    ctaRed: "#f33f32",
    bodyText: "#525252",
    white: "#fff",
    lightGray: "#f2f3fa",
    radius: "8px",
  };

  // ----- HELPERS -----
  function getStoredUser() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function storeUser(name, email) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ name: name, email: email })
    );
  }

  function vimeoEmbedUrl(url) {
    // Extract Vimeo ID from various URL formats
    var match = url.match(
      /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/
    );
    if (!match) return url;
    return (
      "https://player.vimeo.com/video/" +
      match[1] +
      "?autoplay=1&title=0&byline=0&portrait=0"
    );
  }

  // ----- STYLES (injected once) -----
  function injectStyles() {
    if (document.getElementById("gvl-styles")) return;
    var style = document.createElement("style");
    style.id = "gvl-styles";
    style.textContent =
      // Overlay
      ".gvl-overlay{" +
      "position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;" +
      "background:rgba(9,17,53,.75);display:none;align-items:center;justify-content:center;" +
      "opacity:0;transition:opacity .25s ease;pointer-events:none;}" +
      ".gvl-overlay.is-visible{display:flex;opacity:1;pointer-events:auto;}" +
      // Modal — form mode gets warm gradient, video mode stays dark
      ".gvl-modal{" +
      "position:relative;border-radius:12px;max-width:560px;width:92%;max-height:90vh;" +
      "overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.35);" +
      "transform:translateY(16px);transition:transform .25s ease;}" +
      ".gvl-modal.is-form{background:linear-gradient(#fff,#ffe8cf);}" +
      ".gvl-modal.is-video{background:#000;max-width:900px;}" +
      ".gvl-overlay.is-visible .gvl-modal{transform:translateY(0);}" +
      // Close button
      ".gvl-close{" +
      "position:absolute;top:12px;right:12px;z-index:2;" +
      "width:32px;height:32px;border:none;background:rgba(0,0,0,.06);" +
      "border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;" +
      "transition:background .15s ease;}" +
      ".gvl-close:hover{background:rgba(0,0,0,.12);}" +
      ".gvl-close svg{width:14px;height:14px;}" +
      // Form view — matches Atomicwork masterclass form
      ".gvl-form-view{padding:40px 24px;max-width:520px;margin:0 auto;" +
      "font-family:'Inter',Intervariable,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}" +
      ".gvl-form-view h3{" +
      "font-size:2.5rem;font-weight:500;text-align:center;" +
      "background:linear-gradient(to right,#171717,#341dd1 41%,#7c3aed);" +
      "-webkit-background-clip:text;-webkit-text-fill-color:transparent;" +
      "background-clip:text;margin:0 0 8px;letter-spacing:-2px;line-height:48px;}" +
      ".gvl-form-view p{" +
      "text-align:center;color:#525252;font-size:1.125rem;" +
      "margin:0 0 24px;line-height:28px;letter-spacing:-0.44px;}" +
      ".gvl-field{margin-bottom:16px;}" +
      ".gvl-field label{" +
      "display:block;font-size:14px;font-weight:500;" +
      "color:#0a0a0a;margin-bottom:8px;line-height:20px;}" +
      ".gvl-field input{" +
      "display:block;width:100%;box-sizing:border-box;padding:16px;" +
      "font-size:16px;font-weight:400;color:#0a0a0a;" +
      "background:rgba(255,255,255,.7);height:56px;" +
      "border:1px solid rgba(0,0,0,.1);border-radius:8px;" +
      "box-shadow:0 2px 4px rgba(0,0,0,.03);" +
      "outline:none;transition:border-color .15s ease,box-shadow .15s ease;}" +
      ".gvl-field input:focus{border-color:#6d28d9;box-shadow:0 0 0 2px rgba(109,40,217,.15);}" +
      ".gvl-field input.gvl-error{border-color:" + T.ctaRed + ";}" +
      ".gvl-submit{" +
      "display:flex;align-items:center;justify-content:center;" +
      "width:100%;padding:12px 16px;margin-top:8px;cursor:pointer;" +
      "font-size:16px;font-weight:400;height:50px;" +
      "color:#fff;background:linear-gradient(173deg,#080231 29%,#341dd1 72%,#a872ff 95%);" +
      "border:1px solid #1e1b4b;border-radius:8px;" +
      "transition:opacity .15s ease;}" +
      ".gvl-submit:hover{opacity:.9;}" +
      ".gvl-submit:disabled{opacity:.6;cursor:not-allowed;}" +
      // Video view
      ".gvl-video-view{position:relative;padding-top:56.25%;background:#000;}" +
      ".gvl-video-view iframe{" +
      "position:absolute;top:0;left:0;width:100%;height:100%;border:none;}" +
      // Responsive
      "@media(max-width:520px){" +
      ".gvl-form-view{padding:32px 20px;}" +
      ".gvl-form-view h3{font-size:1.75rem;line-height:36px;}" +
      ".gvl-form-view p{font-size:1rem;}" +
      "}";
    document.head.appendChild(style);
  }

  // ----- LIGHTBOX -----
  var overlay = null;
  var modal = null;

  function createOverlay() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.className = "gvl-overlay";

    modal = document.createElement("div");
    modal.className = "gvl-modal";

    // Close button
    var closeBtn = document.createElement("button");
    closeBtn.className = "gvl-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML =
      '<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M1 1l12 12M13 1L1 13" stroke="#333" stroke-width="1.5" stroke-linecap="round"/></svg>';
    closeBtn.addEventListener("click", closeLightbox);

    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Click backdrop to close
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLightbox();
    });

    // Escape key to close
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-visible")) {
        closeLightbox();
      }
    });
  }

  function openLightbox(mode) {
    createOverlay();
    // Clear previous content (keep close button)
    var children = modal.children;
    for (var i = children.length - 1; i >= 0; i--) {
      if (!children[i].classList.contains("gvl-close")) {
        modal.removeChild(children[i]);
      }
    }
    // Set modal style based on mode
    modal.className = "gvl-modal " + (mode === "video" ? "is-video" : "is-form");
    document.body.style.overflow = "hidden";
    // Set display:flex first, then trigger opacity transition on next frame
    overlay.style.display = "flex";
    void overlay.offsetWidth;
    overlay.classList.add("is-visible");
  }

  function closeLightbox() {
    if (!overlay) return;
    overlay.classList.remove("is-visible");
    document.body.style.overflow = "";
    // After transition ends, hide overlay and remove iframe
    setTimeout(function () {
      overlay.style.display = "none";
      var iframe = modal.querySelector("iframe");
      if (iframe) iframe.parentNode.removeChild(iframe);
    }, 300);
  }

  // ----- FORM VIEW -----
  function showForm(vimeoUrl) {
    openLightbox("form");

    var wrap = document.createElement("div");
    wrap.className = "gvl-form-view";

    wrap.innerHTML =
      "<h3>Watch this session</h3>" +
      "<p>All sessions are live. Recordings available for registered attendees only.</p>" +
      '<div class="gvl-field">' +
      '<label for="gvl-name">Name <span style="color:#dc3545">*</span></label>' +
      '<input type="text" id="gvl-name" placeholder="Your full name" autocomplete="name">' +
      "</div>" +
      '<div class="gvl-field">' +
      '<label for="gvl-email">Work Email <span style="color:#dc3545">*</span></label>' +
      '<input type="email" id="gvl-email" placeholder="you@company.com" autocomplete="email">' +
      "</div>" +
      '<button class="gvl-submit" type="button">Watch now \u2192</button>';

    modal.appendChild(wrap);

    var nameInput = wrap.querySelector("#gvl-name");
    var emailInput = wrap.querySelector("#gvl-email");
    var submitBtn = wrap.querySelector(".gvl-submit");

    submitBtn.addEventListener("click", function () {
      var name = nameInput.value.trim();
      var email = emailInput.value.trim();

      // Reset errors
      nameInput.classList.remove("gvl-error");
      emailInput.classList.remove("gvl-error");

      // Validate
      var valid = true;
      if (!name) {
        nameInput.classList.add("gvl-error");
        valid = false;
      }
      var freeProviders = [
        "gmail.com","yahoo.com","yahoo.co.in","hotmail.com","outlook.com",
        "aol.com","icloud.com","mail.com","zoho.com","protonmail.com",
        "proton.me","yandex.com","gmx.com","gmx.net","live.com",
        "msn.com","me.com","mac.com","inbox.com","fastmail.com",
        "tutanota.com","rediffmail.com","qq.com","163.com","126.com"
      ];
      var emailDomain = email.split("@")[1] ? email.split("@")[1].toLowerCase() : "";
      if (!email || email.indexOf("@") === -1 || email.indexOf(".") === -1 || freeProviders.indexOf(emailDomain) !== -1) {
        emailInput.classList.add("gvl-error");
        emailInput.value = "";
        emailInput.setAttribute("placeholder", "Please use your work email");
        valid = false;
      }
      if (!valid) return;

      // Disable button while submitting
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting\u2026";

      // HubSpot submission (fire-and-forget for now, don't block the video)
      submitToHubSpot(name, email, function () {});
      storeUser(name, email);
      showVideo(vimeoUrl);
    });

    // Allow Enter key to submit
    wrap.addEventListener("keydown", function (e) {
      if (e.key === "Enter") submitBtn.click();
    });

    nameInput.focus();
  }

  // ----- VIDEO VIEW -----
  function showVideo(vimeoUrl) {
    openLightbox("video");

    var wrap = document.createElement("div");
    wrap.className = "gvl-video-view";

    var iframe = document.createElement("iframe");
    iframe.src = vimeoEmbedUrl(vimeoUrl);
    iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    iframe.setAttribute("allowfullscreen", "");

    wrap.appendChild(iframe);
    modal.appendChild(wrap);
  }

  // ----- HUBSPOT SUBMISSION -----
  function submitToHubSpot(name, email, callback) {
    var url =
      "https://api.hsforms.com/submissions/v3/integration/submit/" +
      HUBSPOT_PORTAL_ID +
      "/" +
      HUBSPOT_FORM_ID;

    var nameParts = name.split(" ");
    var firstName = nameParts[0] || "";
    var lastName = nameParts.slice(1).join(" ") || "";

    var payload = JSON.stringify({
      fields: [
        { name: "firstname", value: firstName },
        { name: "lastname", value: lastName },
        { name: "email", value: email },
      ],
      context: {
        pageUri: window.location.href,
        pageName: document.title,
      },
    });

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        callback(xhr.status >= 200 && xhr.status < 300);
      }
    };
    xhr.onerror = function () {
      callback(false);
    };
    xhr.send(payload);
  }

  // ----- INIT -----
  function init() {
    injectStyles();

    var triggers = document.querySelectorAll("[data-vimeo-url]");
    if (!triggers.length) return;

    triggers.forEach(function (el) {
      el.style.cursor = "pointer";
      el.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var vimeoUrl = el.getAttribute("data-vimeo-url");
        if (!vimeoUrl) return;

        if (getStoredUser()) {
          showVideo(vimeoUrl);
        } else {
          showForm(vimeoUrl);
        }
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
