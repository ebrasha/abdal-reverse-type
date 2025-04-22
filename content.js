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
    'm': 'پ',
    ',': 'و',
    '.': '؟',   // نقطه‌ی پرسش
    '/': '/',    // اسلش بدون تغییر

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
    'ب': 'f',
    'ل': 'g',
    'ا': 'h',
    'ت': 'j',
    'ن': 'k',
    'م': 'l',
    'ک': ';',   // added kaf
    'گ': '\'',  // added gaf
    'ظ': 'z',
    'ط': 'x',
    'ز': 'c',
    'ر': 'v',
    'ذ': 'b',
    'د': 'n',
    'پ': 'm',
    'و': ',',   // Persian vav → comma
    'پ': '\\',  // if you prefer backslash for pe

    // Special Persian letter
    'ژ': 'C',

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

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request);

    if (request.action === "convertText") {
        try {
            const selectedText = request.selectedText || window.getSelection().toString();
            console.log('Selected text:', selectedText);

            if (selectedText) {
                const success = handleTextReplacement(selectedText);
                console.log('Text replacement success:', success);
                sendResponse({ success: success });
            } else {
                console.error('No text selected');
                sendResponse({ success: false, error: 'No text selected' });
            }
        } catch (error) {
            console.error('Error in message handler:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    return true; // Keep the message channel open for async response
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}