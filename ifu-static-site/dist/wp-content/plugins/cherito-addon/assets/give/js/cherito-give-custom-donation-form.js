(function ($) {
    "use strict";

    // Get the formId value
    const formId = $('input[name="formId"]').val() || '';

    // Parse the JSON string into an object
    const formLayout = JSON.parse(formLayoutData.form_layout);

    // Check if the formId exists as a key in the parsed object
    if (formLayout.hasOwnProperty(formId)) {
        // Get the layout value for the matching formId
        const layout = formLayout[formId];

        // Add the custom CSS hide the donation form initially
        $("head").append($("<style>").text(".givewp-donation-form { display: none; }")); 

        switch (layout) {
            case "layout1":
                $(".givewp-layouts.givewp-layouts-header").remove();
                $(".givewp-donation-form__steps-header").remove();
                $(".givewp-donation-form__steps-progress").remove();
                $(".givewp-fields-amount__input-label-container").remove();
                $(".givewp-donation-form__steps-footer").remove();
                $(".givewp-fields-text-lastName").remove();
            
                wrapNameEmailFieldInGroup();
                moveCustomAmountFieldAtVeryFirst();
                formatAmountInput();
                customizeSubmitButton('.givewp-donation-form__steps-button-next');
                $(".givewp-donation-form").addClass("custom-layout1");
                loadStylesheet("cherito-give-custom-donation-form-layout1.css");

                break;
        
            case "layout2":
                $(".givewp-layouts.givewp-layouts-header").remove();
                $(".givewp-donation-form__steps-header").remove();
                $(".givewp-donation-form__steps-progress").remove();
                $(".givewp-fields-amount__input-label-container").remove();
                $(".givewp-layouts-section__fieldset__legend").remove();
                $(".givewp-donation-form__steps-footer").remove();

                moveCustomAmountFieldAtVeryFirst();
                formatAmountInput();
                customizeSubmitButton('.givewp-donation-form__steps-button-next');
                $(".givewp-donation-form").addClass("custom-layout2");
                loadStylesheet("cherito-give-custom-donation-form-layout2.css");

                break;

            case "layout3":
                $(".givewp-layouts.givewp-layouts-header").remove();
                $(".givewp-fields-amount__input-label-container").remove();
                $(".givewp-elements-donationSummary__header").remove();
                $(".givewp-elements-donationSummary__list #amount").remove();
                $(".givewp-elements-donationSummary__list #frequency").remove();
                    
                moveCustomAmountFieldAtTop();
                formatAmountInput();
                customizeSubmitButton('.givewp-layouts.givewp-layouts-section button[type=submit]');
                $(".givewp-donation-form").addClass("custom-layout3");
                loadStylesheet("cherito-give-custom-donation-form-layout3.css");
                break;

            case "layout4":
                $(".givewp-layouts.givewp-layouts-header").remove();
                $(".givewp-fields-amount__input-label-container").remove();
                $(".givewp-elements-donationSummary__header").remove();
                $(".givewp-elements-donationSummary__list #amount").remove();
                $(".givewp-elements-donationSummary__list #frequency").remove();
                    
                moveCustomAmountFieldAtTop();
                formatAmountInput();
                customizeSubmitButton('.givewp-layouts.givewp-layouts-section button[type=submit]');
                $(".givewp-donation-form").addClass("custom-layout4");
                loadStylesheet("cherito-give-custom-donation-form-layout4.css");
                break;

            case "layout5":
                $(".givewp-layouts.givewp-layouts-header").remove();
                $(".givewp-fields-amount__input-label-container").remove();
                $(".givewp-elements-donationSummary__header").remove();
                $(".givewp-elements-donationSummary__list #amount").remove();
                $(".givewp-elements-donationSummary__list #frequency").remove();
                    
                moveCustomAmountFieldAtTop();
                formatAmountInput();
                customizeSubmitButton('.givewp-layouts.givewp-layouts-section button[type=submit]');
                $(".givewp-donation-form").addClass("custom-layout5");
                loadStylesheet("cherito-give-custom-donation-form-layout5.css");
                break;
        
            default:
            // Silence is gold
        }     
    } else {
        // Add the custom CSS to visible the donation form after loading
        $("head").append($("<style>").text(".givewp-donation-form { visibility: visible;padding-top: 120px;padding-bottom: 120px; }")); 
    }

    /* Load google font */
    loadGoogleFont('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Quicksand:wght@600;700&display=swap');

    /* Wrap name and email field inside givewp-name-email-group */
    function wrapNameEmailFieldInGroup() {
        let firstSectionNodes = $(".givewp-section-nodes").first();

        if (firstSectionNodes.length) {
            let elementsToWrap = firstSectionNodes.children(".givewp-groups-name-name, .givewp-fields-email-email");
    
            if (elementsToWrap.length) {
                elementsToWrap.wrapAll('<div class="givewp-name-email-group"></div>');
            }
        }
    }

    /* Move custom amount field and hidden input at first of the form */
    function moveCustomAmountFieldAtVeryFirst() {
        $(".givewp-fields-amount").each(function () {
            let $amountContainer = $(this).find(".givewp-fields-amount__levels-container");
            let $inputContainer = $(this).find(".givewp-fields-amount__input-container");
            let $hiddenInput = $(this).find("input[name='amount']");
            $amountContainer.prepend($inputContainer, $hiddenInput);
        });
    }

    /* Move custom amount field and hidden input at top of the form */
    function moveCustomAmountFieldAtTop() {
        $(".givewp-fields-amount").each(function () {
            let $inputContainer = $(this).find(".givewp-fields-amount__input-container");
            let $hiddenInput = $(this).find("input[name='amount']");
            $(this).prepend($inputContainer, $hiddenInput);
        });
    }

    /* Format custom amount button and input */
    function formatAmountInput() {
        let container = $(".givewp-fields-amount__levels-container");

        if (container.length) {
            const $customInput = $("#amount-custom");

            function formatAmountLevels() {
                $(".givewp-fields-amount__level").each(function () {
                    let amountText = $(this).text().trim();
                    if (amountText.endsWith(".00")) {
                        $(this).text(amountText.replace(/\.00$/, ''));
                    }
                });
            }

            function updateCustomInput() {
                const $selectedAmount = $(".givewp-fields-amount__level--selected");
                if ($selectedAmount.length && $customInput.length) {
                    let amount = $selectedAmount.text();
                    $customInput.val(amount);
                    $customInput.attr('placeholder', '');
                }
            }

            $(document).ready(function () {
                formatAmountLevels();
                updateCustomInput();
            });

            container.off("click", ".givewp-fields-amount__level").on("click", ".givewp-fields-amount__level", function () {
                $(".givewp-fields-amount__level").removeClass("givewp-fields-amount__level--selected");
                $(".givewp-fields-amount_custom__level").removeClass("givewp-fields-amount__level--selected");
                $(this).addClass("givewp-fields-amount__level--selected");
                updateCustomInput();
            });

            if (container.find(".givewp-fields-amount_custom__level").length === 0) {
                container.append('<div class="givewp-fields-amount__level-container"><button class="givewp-fields-amount_custom__level" type="button">Custom</button></div>');
            }

            container.on("click", ".givewp-fields-amount_custom__level", function () {
                $customInput.val('');
                $customInput.attr('placeholder', 'Amount');
                $(".givewp-fields-amount__level").removeClass("givewp-fields-amount__level--selected");
                $(".givewp-fields-amount_custom__level").addClass("givewp-fields-amount__level--selected");
            });
        }
    }

    /* Custom submit button */
    function customizeSubmitButton($element) {
        $($element).each(function () {
            var buttonText = $(this).text();
    
            $(this).html(`
                <span class="cherito-btn__text">${buttonText}</span>
                <span class="cherito-btn__hover cherito-btn__hover--1"></span>
                <span class="cherito-btn__hover cherito-btn__hover--2"></span>
                <span class="cherito-btn__hover cherito-btn__hover--3"></span>
                <span class="cherito-btn__hover cherito-btn__hover--4"></span>
                <span class="cherito-btn__hover cherito-btn__hover--5"></span>
            `);
    
            $(this).addClass("cherito-btn");
        });
    }

    /* Dynamically add the CSS file for specefic layout only if not already added */
    function loadStylesheet(filename) {
        if (!$("link[href*='" + filename + "']").length) {
            $("<link>", {
                rel: "stylesheet",
                type: "text/css",
                href: formLayoutData.pluginurl + "/give/css/" + filename
            }).appendTo("head");
        }
    }

    /* Dynamically add google font for specific layout only if not already added */
    function loadGoogleFont(fonturl) {
        if (!$("link[href='" + fonturl + "']").length) {
            $("<link>", {
                rel: "stylesheet",
                type: "text/css",
                href: fonturl
            }).appendTo("head");
        }
    }
    
})(jQuery);
