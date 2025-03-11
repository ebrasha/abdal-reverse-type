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
    'a': 'ش',
    'b': 'ذ',
    'c': 'ز',
    'd': 'ی',
    'e': 'ث',
    'f': 'ب',
    'g': 'ل',
    'h': 'ا',
    'i': 'ه',
    'j': 'ت',
    'k': 'ن',
    'l': 'م',
    'm': 'پ',
    'n': 'د',
    'o': 'خ',
    'p': 'ح',
    'q': 'ض',
    'r': 'ق',
    's': 'س',
    't': 'ف',
    'u': 'ع',
    'v': 'ر',
    'w': 'ص',
    'x': 'ط',
    'y': 'غ',
    'z': 'ظ',
    '[': 'ج',
    ']': 'چ',
    '\\': 'پ',
    ',': 'و',
    '.': '.',
    'C': 'ژ'
};

// Mapping of Persian to English characters
const persianToEnglish = {
    'ش': 'a',
    'ذ': 'b',
    'ز': 'c',
    'ی': 'd',
    'ث': 'e',
    'ب': 'f',
    'ل': 'g',
    'ا': 'h',
    'ه': 'i',
    'ت': 'j',
    'ن': 'k',
    'م': 'l',
    'پ': '\\',
    'د': 'n',
    'خ': 'o',
    'ح': 'p',
    'ض': 'q',
    'ق': 'r',
    'س': 's',
    'ف': 't',
    'ع': 'u',
    'ر': 'v',
    'ص': 'w',
    'ط': 'x',
    'غ': 'y',
    'ظ': 'z',
    'ج': '[',
    'چ': ']',
    'و': ',',
    '.': '.',
    'ژ': 'C'
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