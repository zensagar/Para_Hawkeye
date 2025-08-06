// ==UserScript==
// @name         Paragon Review Validator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Blocks Review if status is not changed from default.
// @match        https://paragon-na.amazon.com/hz/view-case*
// @match        https://paragon-eu.amazon.com/hz/view-case*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let defaultStatus = null;
    let statusChanged = false;

    function getCurrentStatus() {
        try {
            const selected = document.querySelector('input[type="radio"]:checked');
            return selected ? selected.value.trim().toLowerCase() : null;
        } catch (err) {
            console.error("Error getting current status:", err);
            return null;
        }
    }

    function findReviewButton() {
        try {
            const buttons = Array.from(document.querySelectorAll("button"));
            return buttons.find(btn => btn.textContent.trim().toLowerCase() === "review");
        } catch (err) {
            console.error("Error finding Review button:", err);
            return null;
        }
    }

    function attachRadioListeners() {
        try {
            const radios = document.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                radio.addEventListener("change", () => {
                    statusChanged = true;
                });
            });
        } catch (err) {
            console.error("Error attaching radio listeners:", err);
        }
    }

    function attachReviewButtonListener() {
        try {
            const reviewBtn = findReviewButton();
            if (!reviewBtn || reviewBtn.dataset.listenerAttached === "true") return;

            reviewBtn.dataset.listenerAttached = "true";

            reviewBtn.addEventListener("click", function (event) {
                const currentStatus = getCurrentStatus();

                if (defaultStatus === null) {
                    console.warn("Default status not set. Skipping validation.");
                    return;
                }

                const isDefaultPendingCarrier = defaultStatus === "pending carrier action";

                if (!statusChanged && !isDefaultPendingCarrier) {
                    alert("Please change the case status from the default before reviewing.");
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            });
        } catch (err) {
            console.error("Error attaching Review click listener:", err);
        }
    }

    function initialize() {
        try {
            const radioButtons = document.querySelectorAll('input[type="radio"]');
            const reviewBtn = findReviewButton();

            if (!radioButtons.length || !reviewBtn) return;

            if (defaultStatus === null) {
                defaultStatus = getCurrentStatus();
                if (!defaultStatus) {
                    console.warn("No default status detected.");
                    return;
                }
            }

            attachRadioListeners();
            attachReviewButtonListener();
        } catch (err) {
            console.error("Initialization error:", err);
        }
    }

    function startObserver() {
        try {
            const observer = new MutationObserver(() => {
                try {
                    initialize();
                } catch (err) {
                    console.error("Observer error:", err);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        } catch (err) {
            console.error("Failed to start MutationObserver:", err);
        }
    }

    // Run the script
    initialize();
    startObserver();
})();
