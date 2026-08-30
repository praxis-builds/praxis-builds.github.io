(() => {
  const navToggle = document.querySelector(".nav-toggle");
  const navigation = document.querySelector("#primary-navigation");

  if (navToggle && navigation) {
    const closeNavigation = (returnFocus = false) => {
      navToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      if (returnFocus) navToggle.focus();
    };

    navToggle.addEventListener("click", () => {
      const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
      navToggle.setAttribute("aria-expanded", String(willOpen));
      navigation.classList.toggle("is-open", willOpen);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeNavigation();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigation.classList.contains("is-open")) {
        closeNavigation(true);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 850) closeNavigation();
    });
  }

  const process = document.querySelector("[data-process]");

  if (process) {
    const tabs = [...process.querySelectorAll('[role="tab"]')];
    const panels = [...process.querySelectorAll('[role="tabpanel"]')];

    const activateTab = (tab, focus = false) => {
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      });

      if (focus) tab.focus();
    };

    if (tabs.length) activateTab(tabs[0]);

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateTab(tab));
      tab.addEventListener("keydown", (event) => {
        const navigationKeys = [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ];

        if (!navigationKeys.includes(event.key)) return;

        event.preventDefault();
        let next = index;

        if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          next = (index + 1) % tabs.length;
        } else {
          next = (index - 1 + tabs.length) % tabs.length;
        }

        activateTab(tabs[next], true);
      });
    });
  }

  const year = document.querySelector("#copyright-year");
  if (year) year.textContent = String(new Date().getFullYear());

  const form = document.querySelector("#inquiry-form");
  const status = document.querySelector("#form-status");

  if (!form || !status) return;

  const phone = form.querySelector("#phone");
  const honeypot = form.querySelector('input[name="_gotcha"]');
  const submitButton = form.querySelector(".submit-button");
  const submitButtonLabel = form.querySelector(".submit-button-label");
  const contactPreferences = [
    ...form.querySelectorAll('input[name="contact-preference"]'),
  ];
  let isSubmitting = false;

  const removeError = (field) => {
    const errorId = `${field.id}-error`;
    document.querySelector(`#${errorId}`)?.remove();
    field.removeAttribute("aria-invalid");

    const descriptions = (field.getAttribute("aria-describedby") || "")
      .split(/\s+/)
      .filter((id) => id && id !== errorId);

    if (descriptions.length) {
      field.setAttribute("aria-describedby", descriptions.join(" "));
    } else {
      field.removeAttribute("aria-describedby");
    }
  };

  const clearErrors = () => {
    form.querySelectorAll("input, select, textarea").forEach(removeError);
  };

  const selectedContactPreference = () =>
    contactPreferences.find((field) => field.checked)?.value || "Email";

  const syncPhoneRequirement = () => {
    if (!phone) return;

    const preference = selectedContactPreference();
    phone.required =
      preference === "Phone call" || preference === "Text message";

    if (!phone.required || phone.value.trim()) removeError(phone);
  };

  const errorMessageFor = (field) => {
    if (field === phone && field.validity.valueMissing) {
      const preference = selectedContactPreference().toLowerCase();
      return `Enter a phone number so we can respond by ${preference}.`;
    }

    if (field.validity.typeMismatch) return "Enter a valid email address.";
    if (field.validity.tooShort) {
      return "Please add a little more detail (at least 20 characters).";
    }

    return "Please complete this field.";
  };

  const showError = (field, serverMessage = "") => {
    removeError(field);
    const message = document.createElement("p");
    message.className = "field-error";
    message.id = `${field.id}-error`;
    message.textContent = serverMessage || errorMessageFor(field);
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", message.id);
    field.insertAdjacentElement("afterend", message);
  };

  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.classList.remove("is-ready", "is-error", "is-sending");
    if (state) status.classList.add(state);
  };

  const focusStatus = () => {
    status.focus({ preventScroll: true });
    status.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
    });
  };

  const setSubmitting = (submitting) => {
    isSubmitting = submitting;
    if (submitButton) submitButton.disabled = submitting;
    if (submitButtonLabel) {
      submitButtonLabel.textContent = submitting
        ? "Sending…"
        : "Send Project Details";
    }
  };

  const parseResponse = async (response) => {
    try {
      return await response.json();
    } catch {
      return null;
    }
  };

  const applyServerErrors = (payload) => {
    if (!payload || !Array.isArray(payload.errors)) return [];

    return payload.errors
      .map((error) => {
        const message =
          typeof error?.message === "string" ? error.message.trim() : "";
        const fieldName =
          typeof error?.field === "string" ? error.field.trim() : "";

        if (message && fieldName) {
          const field = [...form.elements].find(
            (element) => element.name === fieldName,
          );
          if (field?.id) showError(field, message);
        }

        return message;
      })
      .filter(Boolean);
  };

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    const eventName = field.matches('select, input[type="radio"]')
      ? "change"
      : "input";

    field.addEventListener(eventName, () => {
      if (field.matches('input[name="contact-preference"]')) {
        syncPhoneRequirement();
      }

      if (field.checkValidity()) removeError(field);
    });
  });

  syncPhoneRequirement();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    syncPhoneRequirement();
    clearErrors();

    if (honeypot?.value.trim()) {
      setStatus(
        "We could not send this inquiry. Please clear the extra form field or use a direct contact option.",
        "is-error",
      );
      focusStatus();
      return;
    }

    const invalid = [
      ...form.querySelectorAll("input, select, textarea"),
    ].filter((field) => !field.checkValidity());

    invalid.forEach((field) => showError(field));

    if (invalid.length) {
      setStatus(
        "Please complete the highlighted fields before sending your request.",
        "is-error",
      );
      invalid[0].focus();
      return;
    }

    setSubmitting(true);
    setStatus("Sending your project details…", "is-sending");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const payload = await parseResponse(response);

      if (!response.ok) {
        const serverErrors = applyServerErrors(payload);
        const details = serverErrors.length
          ? ` Formspree reported: ${serverErrors.join(" ")}`
          : "";
        setStatus(
          `We could not send your project details. Your entries are still here. Please try again or use the Email, Call, or Text options.${details}`,
          "is-error",
        );
        focusStatus();
        return;
      }

      form.reset();
      clearErrors();
      syncPhoneRequirement();
      setStatus(
        "Thanks—your project details have been sent. We’ll review them and respond within one business day.",
        "is-ready",
      );
      focusStatus();
    } catch {
      setStatus(
        "We could not send your project details. Your entries are still here. Check your connection and try again, or use the Email, Call, or Text options.",
        "is-error",
      );
      focusStatus();
    } finally {
      setSubmitting(false);
    }
  });
})();
