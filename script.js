// WhatsApp Template Builder JavaScript

// Global state
let template = {
    name: '',
    language: 'en',
    category: 'MARKETING',
    components: []
};

let variableCounter = 1;
let buttonCounter = 0;
let headerType = 'TEXT';

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    updatePreview();
});

function initializeEventListeners() {
    // Text inputs
    document.getElementById('header').addEventListener('input', updatePreview);
    document.getElementById('body').addEventListener('input', updatePreview);
    document.getElementById('footer').addEventListener('input', updatePreview);
    
    // Location inputs
    document.getElementById('location-latitude').addEventListener('input', updatePreview);
    document.getElementById('location-longitude').addEventListener('input', updatePreview);
    document.getElementById('location-name').addEventListener('input', updatePreview);
    document.getElementById('location-address').addEventListener('input', updatePreview);

    // Header type menu
    const menuButton = document.getElementById('show-header-menu');
    const popupMenu = document.getElementById('popup-menu');

    menuButton.addEventListener('click', (e) => {
        e.preventDefault();
        popupMenu.classList.toggle('hidden');
    });

    // Header type selection
    popupMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const type = e.target.textContent.toUpperCase();
            changeHeaderType(type);
            popupMenu.classList.add('hidden');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!menuButton.contains(event.target) && !popupMenu.contains(event.target)) {
            popupMenu.classList.add('hidden');
        }
    });

    // Variable management
    document.getElementById('add_header_variable').addEventListener('click', (e) => {
        e.preventDefault();
        addVariable('header');
    });

    document.getElementById('add_body_variable').addEventListener('click', (e) => {
        e.preventDefault();
        addVariable('body');
    });

    // Button management
    document.getElementById('add-button').addEventListener('click', addButton);

    // Export
    document.getElementById('export-json').addEventListener('click', exportJSON);

    // Sample template loading
    document.getElementById('sample-template').addEventListener('change', loadSampleTemplate);
    document.getElementById('clear-template').addEventListener('click', clearTemplate);

    // Copy and download
    document.getElementById('copy-json').addEventListener('click', copyJSON);
    document.getElementById('download-json').addEventListener('click', downloadJSON);

    // Character count
    const bodyTextarea = document.getElementById('body');
    const charCountSpan = document.getElementById('body-char-count');

    bodyTextarea.addEventListener('input', function () {
        charCountSpan.textContent = this.value.length;
    });
}

function changeHeaderType(type) {
    headerType = type;
    const headerInput = document.getElementById('header');
    const headerImage = document.getElementById('header-image');
    const headerVideo = document.getElementById('header-video');
    const locationFields = document.getElementById('location-fields');

    // Hide all inputs first
    headerInput.classList.add('hidden');
    headerImage.classList.add('hidden');
    headerVideo.classList.add('hidden');
    locationFields.classList.add('hidden');

    // Show appropriate input
    switch (type) {
        case 'TEXT':
            headerInput.classList.remove('hidden');
            headerInput.placeholder = 'Enter header text';
            break;
        case 'MEDIA':
            headerImage.classList.remove('hidden');
            headerVideo.classList.remove('hidden');
            break;
        case 'LOCATION':
            locationFields.classList.remove('hidden');
            break;
        case 'DOCUMENT':
            // For document, we'll use file input
            headerImage.classList.remove('hidden');
            headerImage.accept = '.pdf,.doc,.docx';
            break;
    }
    updatePreview();
}

function addVariable(section) {
    const container = document.getElementById('variables-container');
    const variableDiv = document.createElement('div');
    variableDiv.className = 'flex items-center space-x-2 p-2 border rounded';
    variableDiv.innerHTML = `
        <label class="text-sm">{{${variableCounter}}}</label>
        <input type="text" placeholder="Variable name" class="flex-1 px-2 py-1 text-sm border rounded" data-variable="${variableCounter}" data-section="${section}">
        <button class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600" onclick="removeVariable(this, ${variableCounter})">Remove</button>
    `;

    container.appendChild(variableDiv);

    // Add variable to text
    const targetInput = document.getElementById(section);
    const currentValue = targetInput.value;
    targetInput.value = currentValue + `{{${variableCounter}}}`;

    variableCounter++;
    updatePreview();
}

function removeVariable(button, varNum) {
    button.parentElement.remove();
    // Remove from text inputs
    ['header', 'body'].forEach(section => {
        const input = document.getElementById(section);
        input.value = input.value.replace(new RegExp(`{{${varNum}}}`, 'g'), '');
    });
    updatePreview();
}

function addButton() {
    if (buttonCounter >= 3) {
        alert('Maximum 3 buttons allowed');
        return;
    }

    const container = document.getElementById('buttons-container');
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'p-4 border rounded-lg bg-white shadow-sm space-y-3';
    buttonDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-gray-700">Button ${buttonCounter + 1}</h4>
            <button class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600" onclick="removeButton(this)">Remove</button>
        </div>
        <div class="space-y-2">
            <label class="text-xs font-medium text-gray-600">Button Type</label>
            <select class="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onchange="toggleButtonFields(this); updatePreview()">
                <option value="QUICK_REPLY">Quick Reply</option>
                <option value="URL">URL Button</option>
                <option value="PHONE_NUMBER">Phone Number</option>
                <option value="COPY_CODE">Copy Code</option>
            </select>
        </div>
        <div class="space-y-2">
            <label class="text-xs font-medium text-gray-600">Button Text</label>
            <input type="text" placeholder="Enter button text (max 20 chars)" maxlength="20" class="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onchange="updatePreview()">
            <div class="text-xs text-gray-500">
                <span class="char-count">0</span>/20 characters
            </div>
        </div>
        <div class="button-value-field space-y-2 hidden">
            <label class="text-xs font-medium text-gray-600 value-label">URL</label>
            <input type="text" placeholder="Enter URL or phone number" class="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onchange="updatePreview()">
            <div class="text-xs text-gray-500 value-hint">
                Enter the full URL (e.g., https://example.com)
            </div>
        </div>
    `;

    container.appendChild(buttonDiv);
    
    // Add character counter for button text
    const textInput = buttonDiv.querySelector('input[type="text"]');
    const charCount = buttonDiv.querySelector('.char-count');
    textInput.addEventListener('input', function() {
        charCount.textContent = this.value.length;
    });

    buttonCounter++;
    updatePreview();
}

function removeButton(button) {
    button.closest('.p-4').remove();
    buttonCounter--;
    updatePreview();
}

function toggleButtonFields(selectElement) {
    const buttonDiv = selectElement.closest('.p-4');
    const valueField = buttonDiv.querySelector('.button-value-field');
    const valueLabel = buttonDiv.querySelector('.value-label');
    const valueInput = buttonDiv.querySelector('.button-value-field input');
    const valueHint = buttonDiv.querySelector('.value-hint');
    
    const buttonType = selectElement.value;
    
    if (buttonType === 'QUICK_REPLY') {
        valueField.classList.add('hidden');
        valueInput.value = '';
    } else {
        valueField.classList.remove('hidden');
        
        if (buttonType === 'URL') {
            valueLabel.textContent = 'URL';
            valueInput.placeholder = 'Enter URL (e.g., https://example.com)';
            valueInput.type = 'url';
            valueHint.textContent = 'Enter the full URL starting with https://';
        } else if (buttonType === 'PHONE_NUMBER') {
            valueLabel.textContent = 'Phone Number';
            valueInput.placeholder = 'Enter phone number (e.g., +1234567890)';
            valueInput.type = 'tel';
            valueHint.textContent = 'Enter phone number with country code (e.g., +1234567890)';
        } else if (buttonType === 'COPY_CODE') {
            valueLabel.textContent = 'Code to Copy';
            valueInput.placeholder = 'Enter code/coupon (e.g., SAVE20)';
            valueInput.type = 'text';
            valueHint.textContent = 'Enter the code that users will copy (e.g., coupon code, promo code)';
        }
    }
}

function updatePreview() {
    // Update header based on type
    let headerText = 'Header text';
    
    if (headerType === 'LOCATION') {
        const locationName = document.getElementById('location-name').value;
        const locationAddress = document.getElementById('location-address').value;
        
        if (locationName || locationAddress) {
            headerText = `📍 ${locationName || 'Location'}${locationAddress ? '\n' + locationAddress : ''}`;
        } else {
            headerText = '📍 Location';
        }
    } else {
        headerText = document.getElementById('header').value || 'Header text';
    }
    
    document.querySelector('.msg_header').innerHTML = headerText.replace(/\n/g, '<br>');

    // Update body
    const bodyText = document.getElementById('body').value || 'Body text';
    document.querySelector('.msg_body').innerHTML = bodyText.replace(/\n/g, '<br>');

    // Update footer
    const footerText = document.getElementById('footer').value || '';
    const footerElement = document.querySelector('.msg_footer');
    if (footerText) {
        footerElement.textContent = footerText;
        footerElement.style.display = 'block';
    } else {
        footerElement.style.display = 'none';
    }

    // Update buttons
    updateButtonsPreview();
}

function updateButtonsPreview() {
    const buttonsContainer = document.getElementById('buttons-preview');
    const buttonDivs = document.querySelectorAll('#buttons-container > .p-4');

    buttonsContainer.innerHTML = '';

    buttonDivs.forEach(buttonDiv => {
        const select = buttonDiv.querySelector('select');
        const textInput = buttonDiv.querySelector('input[type="text"]');
        const valueInput = buttonDiv.querySelector('.button-value-field input');

        if (textInput && textInput.value.trim()) {
            const buttonElement = document.createElement('div');
            buttonElement.className = '_alqy';

            let iconClass = '_863c'; // default phone icon
            if (select.value === 'URL') iconClass = '_85_p';
            else if (select.value === 'QUICK_REPLY') iconClass = '_alqx';
            else if (select.value === 'COPY_CODE') iconClass = '_amf5';

            buttonElement.innerHTML = `
                <div class="_alr0 _3qn7 _61-1 _2fyi _3qng">
                    <span aria-hidden="true" class="_85_r _3-8_ ${iconClass}"></span>
                    <span class="_8752">${textInput.value}</span>
                </div>
            `;

            buttonsContainer.appendChild(buttonElement);
        }
    });
}

function exportJSON() {
    // Validate template
    const validation = validateTemplate();
    if (!validation.isValid) {
        alert('Template validation failed:\n' + validation.errors.join('\n'));
        return;
    }

    const template = generateTemplate();
    const jsonOutput = document.getElementById('json-output');
    jsonOutput.value = JSON.stringify(template, null, 2);

    // Show success message
    const exportBtn = document.getElementById('export-json');
    const originalText = exportBtn.textContent;
    exportBtn.textContent = 'Exported!';
    exportBtn.classList.add('bg-green-600');

    setTimeout(() => {
        exportBtn.textContent = originalText;
        exportBtn.classList.remove('bg-green-600');
    }, 2000);
}

function validateTemplate() {
    const errors = [];

    // Check template name
    const templateName = document.getElementById('template-name').value;
    if (!templateName) {
        errors.push('Template name is required');
    } else if (!/^[a-z0-9_]+$/.test(templateName)) {
        errors.push('Template name must contain only lowercase letters, numbers, and underscores');
    }
    
    // Check language and category
    const templateLanguage = document.getElementById('template-language').value;
    const templateCategory = document.getElementById('template-category').value;
    
    if (!templateLanguage) {
        errors.push('Language selection is required');
    }
    
    if (!templateCategory) {
        errors.push('Category selection is required');
    }

    // Check body text (required)
    const bodyText = document.getElementById('body').value;
    if (!bodyText.trim()) {
        errors.push('Body text is required');
    }

    // Check character limits
    if (bodyText.length > 1024) {
        errors.push('Body text exceeds 1024 character limit');
    }

    // Validate header based on type
    if (headerType === 'LOCATION') {
        const latitude = document.getElementById('location-latitude').value;
        const longitude = document.getElementById('location-longitude').value;
        const locationName = document.getElementById('location-name').value;
        const locationAddress = document.getElementById('location-address').value;
        
        if (!latitude || !longitude || !locationName || !locationAddress) {
            errors.push('All location fields (latitude, longitude, name, address) are required for location headers');
        } else {
            // Validate latitude and longitude ranges
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            
            if (isNaN(lat) || lat < -90 || lat > 90) {
                errors.push('Latitude must be a number between -90 and 90');
            }
            
            if (isNaN(lng) || lng < -180 || lng > 180) {
                errors.push('Longitude must be a number between -180 and 180');
            }
            
            if (locationName.length > 100) {
                errors.push('Location name must be 100 characters or less');
            }
            
            if (locationAddress.length > 200) {
                errors.push('Location address must be 200 characters or less');
            }
        }
    } else {
        const headerText = document.getElementById('header').value;
        if (headerText.length > 60) {
            errors.push('Header text exceeds 60 character limit');
        }
    }

    const footerText = document.getElementById('footer').value;
    if (footerText.length > 60) {
        errors.push('Footer text exceeds 60 character limit');
    }

    // Check button limits
    const buttonDivs = document.querySelectorAll('#buttons-container > .p-4');
    if (buttonDivs.length > 3) {
        errors.push('Maximum 3 buttons allowed');
    }

    // Validate button text and values
    buttonDivs.forEach((buttonDiv, index) => {
        const select = buttonDiv.querySelector('select');
        const textInput = buttonDiv.querySelector('input[type="text"]');
        const valueInput = buttonDiv.querySelector('.button-value-field input');
        
        if (textInput && textInput.value.trim()) {
            if (textInput.value.length > 20) {
                errors.push(`Button ${index + 1} text exceeds 20 character limit`);
            }
            
            // Validate URL and phone number values
            if (select.value === 'URL' && valueInput && valueInput.value.trim()) {
                const urlPattern = /^https?:\/\/.+/;
                if (!urlPattern.test(valueInput.value.trim())) {
                    errors.push(`Button ${index + 1} URL must start with http:// or https://`);
                }
            } else if (select.value === 'PHONE_NUMBER' && valueInput && valueInput.value.trim()) {
                const phonePattern = /^\+[1-9]\d{1,14}$/;
                if (!phonePattern.test(valueInput.value.trim())) {
                    errors.push(`Button ${index + 1} phone number must start with + and contain only digits`);
                }
            } else if (select.value === 'COPY_CODE' && valueInput && valueInput.value.trim()) {
                // Validate copy code - should be alphanumeric and reasonable length
                if (valueInput.value.trim().length > 25) {
                    errors.push(`Button ${index + 1} copy code should be 25 characters or less`);
                }
            }
            
            // Check if URL/Phone/Code is required but missing
            if (select.value === 'URL' && (!valueInput || !valueInput.value.trim())) {
                errors.push(`Button ${index + 1} URL is required for URL buttons`);
            } else if (select.value === 'PHONE_NUMBER' && (!valueInput || !valueInput.value.trim())) {
                errors.push(`Button ${index + 1} phone number is required for phone buttons`);
            } else if (select.value === 'COPY_CODE' && (!valueInput || !valueInput.value.trim())) {
                errors.push(`Button ${index + 1} code is required for copy code buttons`);
            }
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function generateTemplate() {
    const components = [];

    // Header component
    if (headerType === 'LOCATION') {
        const latitude = document.getElementById('location-latitude').value;
        const longitude = document.getElementById('location-longitude').value;
        const locationName = document.getElementById('location-name').value;
        const locationAddress = document.getElementById('location-address').value;
        
        if (latitude && longitude && locationName && locationAddress) {
            const headerComponent = {
                type: 'HEADER',
                format: 'LOCATION',
                parameters: [
                    {
                        type: 'location',
                        location: {
                            latitude: parseFloat(latitude),
                            longitude: parseFloat(longitude),
                            name: locationName,
                            address: locationAddress
                        }
                    }
                ]
            };
            components.push(headerComponent);
        }
    } else {
        const headerText = document.getElementById('header').value;
        if (headerText) {
            const headerComponent = {
                type: 'HEADER',
                format: headerType,
            };

            if (headerType === 'TEXT') {
                headerComponent.text = headerText;

                // Add header parameters if variables exist
                const headerVars = extractVariables(headerText);
                if (headerVars.length > 0) {
                    headerComponent.example = {
                        header_text: headerVars.map(v => `Sample ${v}`)
                    };
                }
            }

            components.push(headerComponent);
        }
    }

    // Body component
    const bodyText = document.getElementById('body').value;
    if (bodyText) {
        const bodyComponent = {
            type: 'BODY',
            text: bodyText
        };

        // Add body parameters if variables exist
        const bodyVars = extractVariables(bodyText);
        if (bodyVars.length > 0) {
            bodyComponent.example = {
                body_text: [bodyVars.map(v => `Sample ${v}`)]
            };
        }

        components.push(bodyComponent);
    }

    // Footer component
    const footerText = document.getElementById('footer').value;
    if (footerText) {
        components.push({
            type: 'FOOTER',
            text: footerText
        });
    }

    // Buttons component
    const buttonDivs = document.querySelectorAll('#buttons-container > .p-4');
    if (buttonDivs.length > 0) {
        const buttons = [];

        buttonDivs.forEach(buttonDiv => {
            const select = buttonDiv.querySelector('select');
            const textInput = buttonDiv.querySelector('input[type="text"]');
            const valueInput = buttonDiv.querySelector('.button-value-field input');

            if (textInput && textInput.value.trim()) {
                const button = {
                    type: select.value,
                    text: textInput.value.trim()
                };

                if (select.value === 'URL' && valueInput && valueInput.value.trim()) {
                    button.url = valueInput.value.trim();
                } else if (select.value === 'PHONE_NUMBER' && valueInput && valueInput.value.trim()) {
                    button.phone_number = valueInput.value.trim();
                } else if (select.value === 'COPY_CODE' && valueInput && valueInput.value.trim()) {
                    button.example = valueInput.value.trim();
                }

                buttons.push(button);
            }
        });

        if (buttons.length > 0) {
            components.push({
                type: 'BUTTONS',
                buttons: buttons
            });
        }
    }

    const templateName = document.getElementById('template-name').value || 'untitled_template';
    const templateLanguage = document.getElementById('template-language').value || 'en';
    const templateCategory = document.getElementById('template-category').value || 'MARKETING';

    return {
        name: templateName.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        language: templateLanguage,
        category: templateCategory,
        components: components
    };
}

function extractVariables(text) {
    const matches = text.match(/\{\{\d+\}\}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : [];
}

function loadSampleTemplate() {
    const select = document.getElementById('sample-template');
    const templateName = select.value;

    if (!templateName) return;

    // Sample templates data
    const sampleTemplates = {
        payment_reminder: {
            name: "payment_reminder",
            language: "en",
            category: "UTILITY",
            header: "Payment Reminder for {{1}}",
            body: "Hi {{1}},\n\nYour payment of ${{2}} for {{3}} is due on {{4}}.\n\nPlease pay to avoid late fees.",
            footer: "Ignore if already paid",
            buttons: [
                { type: "URL", text: "Pay Now", url: "https://example.com/pay" },
                { type: "PHONE_NUMBER", text: "Call Support", phone: "+1234567890" }
            ]
        },
        appointment_confirmation: {
            name: "appointment_confirmation",
            language: "en",
            category: "UTILITY",
            header: "Appointment Confirmed",
            body: "Hello {{1}},\n\nYour appointment with {{2}} is confirmed for {{3}} at {{4}}.\n\nLocation: {{5}}",
            footer: "",
            buttons: [
                { type: "QUICK_REPLY", text: "Confirm" },
                { type: "QUICK_REPLY", text: "Reschedule" },
                { type: "PHONE_NUMBER", text: "Call Us", phone: "+1234567890" }
            ]
        },
        promotional_offer: {
            name: "promotional_offer",
            language: "en",
            category: "MARKETING",
            header: "Special Offer Just for You!",
            body: "Hi {{1}},\n\nGet {{2}}% off your next purchase! Use the code below at checkout.\n\nOffer valid until {{3}}.",
            footer: "Terms and conditions apply",
            buttons: [
                { type: "COPY_CODE", text: "Copy Offer Code", example: "SAVE20" },
                { type: "URL", text: "Shop Now", url: "https://example.com/shop" }
            ]
        },
        spanish_welcome: {
            name: "bienvenida_spanish",
            language: "es",
            category: "UTILITY",
            header: "¡Bienvenido {{1}}!",
            body: "Hola {{1}},\n\n¡Gracias por unirte a nosotros! Tu cuenta ha sido creada exitosamente.\n\n¿Necesitas ayuda para comenzar?",
            footer: "Equipo de soporte",
            buttons: [
                { type: "QUICK_REPLY", text: "Sí, necesito ayuda" },
                { type: "QUICK_REPLY", text: "No, estoy bien" },
                { type: "PHONE_NUMBER", text: "Llamar soporte", phone: "+1234567890" }
            ]
        },
        french_notification: {
            name: "notification_french",
            language: "fr",
            category: "UTILITY",
            header: "Notification importante",
            body: "Bonjour {{1}},\n\nVotre commande {{2}} a été expédiée et arrivera le {{3}}.\n\nNuméro de suivi: {{4}}",
            footer: "Merci pour votre confiance",
            buttons: [
                { type: "URL", text: "Suivre ma commande", url: "https://example.com/track" },
                { type: "PHONE_NUMBER", text: "Contacter le support", phone: "+33123456789" }
            ]
        },
        location_event: {
            name: "event_location",
            language: "en",
            category: "UTILITY",
            headerType: "LOCATION",
            location: {
                latitude: "37.7749",
                longitude: "-122.4194",
                name: "Golden Gate Bridge",
                address: "Golden Gate Bridge, San Francisco, CA 94129, USA"
            },
            body: "Hi {{1}},\n\nYour event '{{2}}' is happening at the location above on {{3}}.\n\nSee you there!",
            footer: "Event Team",
            buttons: [
                { type: "QUICK_REPLY", text: "I'll be there" },
                { type: "QUICK_REPLY", text: "Can't make it" }
            ]
        }
    };

    const template = sampleTemplates[templateName];
    if (!template) return;

    // Clear existing content
    clearTemplate();

    // Load template data
    document.getElementById('template-name').value = template.name || templateName;
    document.getElementById('template-language').value = template.language || 'en';
    document.getElementById('template-category').value = template.category || 'MARKETING';
    
    // Handle different header types
    if (template.headerType === 'LOCATION' && template.location) {
        headerType = 'LOCATION';
        changeHeaderType('LOCATION');
        document.getElementById('location-latitude').value = template.location.latitude;
        document.getElementById('location-longitude').value = template.location.longitude;
        document.getElementById('location-name').value = template.location.name;
        document.getElementById('location-address').value = template.location.address;
    } else {
        headerType = 'TEXT';
        changeHeaderType('TEXT');
        document.getElementById('header').value = template.header || '';
    }
    
    document.getElementById('body').value = template.body;
    document.getElementById('footer').value = template.footer;

    // Load buttons
    template.buttons.forEach(button => {
        addButton();
        const buttonDivs = document.querySelectorAll('#buttons-container > .p-4');
        const lastButton = buttonDivs[buttonDivs.length - 1];

        const select = lastButton.querySelector('select');
        const textInput = lastButton.querySelector('input[type="text"]');
        const valueInput = lastButton.querySelector('.button-value-field input');
        
        select.value = button.type;
        textInput.value = button.text;
        
        // Trigger the field toggle
        toggleButtonFields(select);
        
        if (button.url && valueInput) {
            valueInput.value = button.url;
        } else if (button.phone && valueInput) {
            valueInput.value = button.phone;
        } else if (button.example && valueInput) {
            valueInput.value = button.example;
        }
        
        // Update character count
        const charCount = lastButton.querySelector('.char-count');
        if (charCount) {
            charCount.textContent = button.text.length;
        }
    });

    updatePreview();
}

function clearTemplate() {
    document.getElementById('template-name').value = '';
    document.getElementById('template-language').value = 'en';
    document.getElementById('template-category').value = 'MARKETING';
    document.getElementById('header').value = '';
    document.getElementById('body').value = '';
    document.getElementById('footer').value = '';
    document.getElementById('sample-template').value = '';
    
    // Clear location fields
    document.getElementById('location-latitude').value = '';
    document.getElementById('location-longitude').value = '';
    document.getElementById('location-name').value = '';
    document.getElementById('location-address').value = '';
    
    // Reset header type to TEXT
    headerType = 'TEXT';
    changeHeaderType('TEXT');

    // Clear buttons
    document.getElementById('buttons-container').innerHTML = '';
    buttonCounter = 0;

    // Clear variables
    document.getElementById('variables-container').innerHTML = '';
    variableCounter = 1;

    // Clear JSON output
    document.getElementById('json-output').value = '';

    updatePreview();
}

function copyJSON() {
    const jsonOutput = document.getElementById('json-output');
    if (!jsonOutput.value) {
        alert('Please export JSON first');
        return;
    }

    navigator.clipboard.writeText(jsonOutput.value).then(() => {
        const copyBtn = document.getElementById('copy-json');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';

        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
    });
}

function downloadJSON() {
    const jsonOutput = document.getElementById('json-output');
    if (!jsonOutput.value) {
        alert('Please export JSON first');
        return;
    }

    const templateName = document.getElementById('template-name').value || 'template';
    const blob = new Blob([jsonOutput.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}