/*
 **********************************************************************
 * -------------------------------------------------------------------
 * Project Name : Abdal Reverse Type
 * File Name    : content.js
 * Author       : Ebrahim Shafiei (EbraSha)
 * Email        : Prof.Shafiei@Gmail.com
 * Created On   : 2024-03-19 12:00:00
 * Description  : Main content script for text conversion functionality
 * -------------------------------------------------------------------
 *
 * "Coding is an engaging and beloved hobby for me. I passionately and insatiably pursue knowledge in cybersecurity and programming."
 * – Ebrahim Shafiei
 *
 **********************************************************************
 */

console.log('Content script loading...');

// Default keyboard settings
let keyboardSettings = {
    peKeyMapping: 'm', // Default pe mapping ('m')
    // Add other keyboard layout settings here as needed
};

// Load settings from storage
function loadSettings() {
    console.log('Loading keyboard settings...');
    if (typeof browser !== 'undefined') {
        browser.storage.sync.get(['peKeyMapping'], function(result) {
            if (result.peKeyMapping) {
                keyboardSettings.peKeyMapping = result.peKeyMapping;
                console.log('Loaded pe key mapping:', keyboardSettings.peKeyMapping);
                updateMappings();
            }
        });
    } else if (typeof chrome !== 'undefined') {
        chrome.storage.sync.get(['peKeyMapping'], function(result) {
            if (result.peKeyMapping) {
                keyboardSettings.peKeyMapping = result.peKeyMapping;
                console.log('Loaded pe key mapping:', keyboardSettings.peKeyMapping);
                updateMappings();
            }
        });
    }
}

// Mapping of English to Persian characters
const englishToPersian = {
    // Row 1
    'q': 'ض',
    'w': 'ص',
    'e': 'ث',
    'r': 'ق',
    't': 'ف',
    'y': 'غ',
    'u': 'ع',
    'i': 'ه',
    'o': 'خ',
    'p': 'ح',
    '[': 'ج',
    ']': 'چ',
    '\\': '\\',  // معمولا \ را بدون تغییر نگه می‌داریم

    // Row 2
    'a': 'ش',
    's': 'س',
    'd': 'ی',
    'f': 'ب',
    'g': 'ل',
    'h': 'ا',
    'j': 'ت',
    'k': 'ن',
    'l': 'م',
    ';': 'ک',
    '\'': 'گ',

    // Row 3
    'z': 'ظ',
    'x': 'ط',
    'c': 'ز',
    'v': 'ر',
    'b': 'ذ',
    'n': 'د',
    'm': 'پ',  // Default mapping for pe
    ',': 'و',
    '.': '؟',   // نقطه‌ی پرسش
    '/': '/',    // اسلش بدون تغییر
    '`': 'پ',   // Alternative mapping for pe on some keyboards

    // ارقام
    '0': '۰',
    '1': '۱',
    '2': '۲',
    '3': '۳',
    '4': '۴',
    '5': '۵',
    '6': '۶',
    '7': '۷',
    '8': '۸',
    '9': '۹'
};

// Mapping of Persian to English characters
const persianToEnglish = {
    // Letters
    'ض': 'q',
    'ص': 'w',
    'ث': 'e',
    'ق': 'r',
    'ف': 't',
    'غ': 'y',
    'ع': 'u',
    'ه': 'i',
    'خ': 'o',
    'ح': 'p',
    'ج': '[',
    'چ': ']',
    'ش': 'a',
    'س': 's',
    'ی': 'd',
    'ئ': 'm',
    'ب': 'f',
    'ل': 'g',
    'ا': 'h',
    'ت': 'j',
    'ن': 'k',
    'م': 'l',
    'ک': ';',   // kaf
    'گ': '\'',  // gaf
    'ظ': 'z',
    'ط': 'x',
    'ز': 'c',
    'ر': 'v',
    'ذ': 'b',
    'د': 'n',
    'پ': 'm',   // Default mapping for pe
    'و': ',',   // Persian vav → comma

    // Special Persian letter
    'ژ': 'C',
    'ي': 'X',
    'ة': 'Z',
    'إ': 'B',
    'أ': 'N',
    'ء': 'M',

    // Digits
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',

    // Punctuation
    '؛': ';',   // Persian semicolon
    '؟': '?',   // Persian question mark
    '،': ',',   // Persian comma
    '.': '.',   // dot
    ':': ':',
    '/': '/',
    '\\': '\\',
    '-': '-',
    '_': '_',
    '(': '(',
    ')': ')',
    '\'': '\'',
    '"': '"'
};

// Function to update mappings based on settings
function updateMappings() {
    console.log('Updating mappings with settings:', keyboardSettings);
    
    // Reset default Pe mapping
    englishToPersian['m'] = 'پ';
    englishToPersian['\\'] = '\\';
    englishToPersian['`'] = 'پ';
    persianToEnglish['پ'] = 'm';
    
    // Update based on settings
    switch(keyboardSettings.peKeyMapping) {
        case '\\':
            englishToPersian['\\'] = 'پ'; // Set backslash to pe
            englishToPersian['m'] = 'م';  // Remap m to meem
            persianToEnglish['پ'] = '\\'; // Set pe to backslash
            persianToEnglish['م'] = 'm';  // Remap meem to m
            break;
        case '`':
            englishToPersian['`'] = 'پ';  // Set backtick to pe
            englishToPersian['m'] = 'م';  // Remap m to meem
            persianToEnglish['پ'] = '`';  // Set pe to backtick
            persianToEnglish['م'] = 'm';  // Remap meem to m
            break;
        default: // 'm' is default
            englishToPersian['m'] = 'پ';  // Set m to pe
            persianToEnglish['پ'] = 'm';  // Set pe to m
            break;
    }
    
    console.log('Updated mappings successfully');
}

// Function to convert text
function convertText(text) {
    console.log('Converting text:', text);
    let result = '';
    let isEnglish = false;

    // Check if text is English or Persian
    for (let char of text) {
        if (englishToPersian[char.toLowerCase()]) {
            isEnglish = true;
            console.log('Detected English text');
            break;
        } else if (persianToEnglish[char]) {
            isEnglish = false;
            console.log('Detected Persian text');
            break;
        }
    }

    // Convert based on detected language
    for (let char of text) {
        if (isEnglish) {
            result += englishToPersian[char.toLowerCase()] || char;
        } else {
            result += persianToEnglish[char] || char;
        }
    }

    console.log('Converted result:', result);
    return result;
}

// Function to replace text in input/textarea fields
function replaceTextInInput(element, convertedText) {
    try {
        console.log('Replacing text in input/textarea');
        const start = element.selectionStart;
        const end = element.selectionEnd;
        const text = element.value;
        const before = text.substring(0, start);
        const after = text.substring(end);

        // Set the new value
        element.value = before + convertedText + after;

        // Create and dispatch events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));

        // Update selection
        element.setSelectionRange(start, start + convertedText.length);
        element.focus();

        return true;
    } catch (error) {
        console.error('Error in replaceTextInInput:', error);
        return false;
    }
}

// Function to replace text in regular elements
function replaceTextInDocument(convertedText) {
    try {
        console.log('Replacing text in document');
        const selection = window.getSelection();

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(convertedText));

            // Update selection
            const newRange = document.createRange();
            newRange.setStart(range.startContainer, range.startOffset);
            newRange.setEnd(range.startContainer, range.startOffset + convertedText.length);
            selection.removeAllRanges();
            selection.addRange(newRange);

            return true;
        }
        return false;
    } catch (error) {
        console.error('Error in replaceTextInDocument:', error);
        return false;
    }
}

// Function to handle text replacement
function handleTextReplacement(selectedText) {
    try {
        console.log('Handling text replacement for:', selectedText);
        const convertedText = convertText(selectedText);
        const activeElement = document.activeElement;

        // Handle input/textarea elements
        if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
            return replaceTextInInput(activeElement, convertedText);
        }

        // Handle regular text
        return replaceTextInDocument(convertedText);

    } catch (error) {
        console.error('Error in handleTextReplacement:', error);
        return false;
    }
}

// Setup keyboard shortcut listener
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Log the key event for debugging
        console.debug('Key pressed:', e.key, 'modifiers:', 
            (e.ctrlKey ? 'Ctrl ' : '') + 
            (e.altKey ? 'Alt ' : '') + 
            (e.shiftKey ? 'Shift ' : '') + 
            (e.metaKey ? 'Meta ' : ''));
            
        // Don't handle shortcuts in form fields unless modifiers are used
        if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && 
            !(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey)) {
            return;
        }
        
        // Skip if only modifier keys are pressed without any other key
        if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') {
            return;
        }

        // Only send if at least one modifier key is pressed
        if (!(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey)) {
            return;
        }

        const keyEvent = {
            ctrl: e.ctrlKey,
            alt: e.altKey,
            shift: e.shiftKey,
            meta: e.metaKey,
            key: e.key // Keep original case for consistent matching
        };

        console.log('Sending key event to background:', keyEvent);

        // Send the key event to the background script
        chrome.runtime.sendMessage({
            action: 'keyEvent',
            keyEvent: keyEvent
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Error sending key event:', chrome.runtime.lastError);
                return;
            }
            
            if (response && response.matched) {
                console.log('Shortcut matched! Preventing default behavior');
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }, true); // Use capture phase to get events before they reach other handlers
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request);

    // Handle settings updates from the background script
    if (request.action === "updateSettings") {
        console.log('Received settings update:', request.settings);
        
        // Update pe key mapping if provided
        if (request.settings && request.settings.peKeyMapping) {
            keyboardSettings.peKeyMapping = request.settings.peKeyMapping;
            console.log('Updated pe key mapping setting:', keyboardSettings.peKeyMapping);
            
            // Update keyboard mappings based on new settings
            updateMappings();
        }
        
        sendResponse({ success: true, message: 'Settings updated in content script' });
        return true;
    }

    if (request.action === "convertText") {
        try {
            const selectedText = request.selectedText || window.getSelection().toString();
            console.log('Selected text:', selectedText);

            if (selectedText) {
                const success = handleTextReplacement(selectedText);
                console.log('Text replacement success:', success);
                sendResponse({ success: success });
            } else {
                console.warn('No text selected for conversion');
                
                // Try to execute text replacement anyway if we're in an editable field
                const activeElement = document.activeElement;
                if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
                    // If in an input/textarea, try to convert the text at cursor or selected text
                    const start = activeElement.selectionStart;
                    const end = activeElement.selectionEnd;
                    
                    if (start !== end) {
                        // We have some selected text in the form field
                        const selectedFieldText = activeElement.value.substring(start, end);
                        const success = handleTextReplacement(selectedFieldText);
                        console.log('Form field text replacement success:', success);
                        sendResponse({ success: success });
                    } else {
                        console.error('No text selected in form field');
                        sendResponse({ success: false, error: 'No text selected in form field' });
                    }
                } else {
                    console.error('No text selected and not in editable field');
                    sendResponse({ success: false, error: 'No text selected' });
                }
            }
        } catch (error) {
            console.error('Error in message handler:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    return true; // Keep the message channel open for async response
});

// Initialize
function initialize() {
    console.log('Initializing content script...');
    loadSettings();
    setupKeyboardShortcuts();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}