/*
 **********************************************************************
 * -------------------------------------------------------------------
 * Project Name : Abdal Reverse Type
 * File Name    : background.js
 * Author       : Ebrahim Shafiei (EbraSha)
 * Email        : Prof.Shafiei@Gmail.com
 * Created On   : 2024-03-21 13:00:00
 * Description  : Background script for handling context menu
 * -------------------------------------------------------------------
 *
 * "Coding is an engaging and beloved hobby for me. I passionately and insatiably pursue knowledge in cybersecurity and programming."
 * – Ebrahim Shafiei
 *
 **********************************************************************
 */

console.log('Background script loading...');

// Storage compatibility
const storage = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;
const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;

// Current user shortcut
let currentShortcut = null;

// Load settings from storage
function loadSettings() {
    storage.sync.get(['shortcut'], function(result) {
        if (result.shortcut) {
            currentShortcut = parseShortcutString(result.shortcut);
            console.log('Loaded shortcut:', currentShortcut);
        }
    });
}

// Parse shortcut string into key combination
function parseShortcutString(shortcutString) {
    if (!shortcutString) return null;
    
    console.log('Parsing shortcut string:', shortcutString);
    const parts = shortcutString.split('+');
    
    const result = {
        ctrl: parts.includes('Ctrl'),
        alt: parts.includes('Alt'),
        shift: parts.includes('Shift'),
        meta: parts.includes('Meta'),
        key: parts[parts.length - 1].toUpperCase() // Always use uppercase for key
    };
    
    console.log('Parsed shortcut:', result);
    return result;
}

// Create context menu
chrome.contextMenus.create({
    id: "convertText",
    title: "تبدیل متن انتخاب شده",
    contexts: ["selection"]
}, () => {
    if (chrome.runtime.lastError) {
        console.error('Error creating context menu:', chrome.runtime.lastError);
    } else {
        console.log('Context menu created successfully');
    }
});

// Handle browser action click (toolbar icon)
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('Browser action clicked');
    
    // Open options page
    if (typeof browser !== 'undefined') {
        browser.runtime.openOptionsPage();
    } else {
        chrome.runtime.openOptionsPage();
    }
});

// Function to convert selected text on the active tab
function convertSelectedText() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "convertText"
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    // Try injecting the content script again
                    chrome.tabs.executeScript(tabs[0].id, {
                        file: 'content.js'
                    }, function() {
                        if (chrome.runtime.lastError) {
                            console.error('Error injecting content script:', chrome.runtime.lastError);
                        } else {
                            // Try sending the message again after injection
                            setTimeout(() => {
                                chrome.tabs.sendMessage(tabs[0].id, {
                                    action: "convertText"
                                });
                            }, 100);
                        }
                    });
                } else {
                    console.log('Response from content script:', response);
                }
            });
        }
    });
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log('Context menu clicked:', info);
    if (info.menuItemId === "convertText") {
        console.log('Convert text menu item clicked');

        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "convertText",
                    selectedText: info.selectionText
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError);
                        // Try injecting the content script again
                        chrome.tabs.executeScript(tabs[0].id, {
                            file: 'content.js'
                        }, function() {
                            if (chrome.runtime.lastError) {
                                console.error('Error injecting content script:', chrome.runtime.lastError);
                            } else {
                                // Try sending the message again after injection
                                setTimeout(() => {
                                    chrome.tabs.sendMessage(tabs[0].id, {
                                        action: "convertText",
                                        selectedText: info.selectionText
                                    });
                                }, 100);
                            }
                        });
                    } else {
                        console.log('Response from content script:', response);
                    }
                });
            }
        });
    }
});

// Listen for messages from options page and content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Handle settings update broadcasts
    if (request.action === 'settingsUpdated') {
        console.log('Settings updated, broadcasting to all tabs:', request.settings);
        
        // Broadcast the settings update to all tabs
        chrome.tabs.query({}, function(tabs) {
            for (let tab of tabs) {
                console.log('Broadcasting settings to tab:', tab.id);
                chrome.tabs.sendMessage(tab.id, {
                    action: "updateSettings",
                    settings: request.settings
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        // Ignore errors for tabs that don't have content script running
                        console.debug('Could not update tab:', tab.id, chrome.runtime.lastError.message);
                    } else if (response) {
                        console.log('Tab', tab.id, 'settings update response:', response);
                    }
                });
            }
        });
        
        sendResponse({success: true, message: 'Settings broadcast initiated'});
        return true;
    }
    
    // Check if the current shortcut is registered
    if (request.action === 'checkShortcut') {
        console.log('Checking current shortcut:', currentShortcut);
        sendResponse({
            success: true,
            shortcut: currentShortcut
        });
        return true;
    }
    
    // Handle keyboard events from content script
    if (request.action === 'keyEvent') {
        console.log('Received key event:', request.keyEvent);
        console.log('Current shortcut:', currentShortcut);
        
        if (!currentShortcut) {
            console.log('No shortcut registered');
            sendResponse({matched: false});
            return true;
        }
        
        // Check if the key event matches our shortcut
        const keyEvent = request.keyEvent;
        const shortcut = currentShortcut;
        
        console.log('Comparing keyEvent:', keyEvent, 'with shortcut:', shortcut);
        
        // Check each property carefully
        const ctrlMatch = keyEvent.ctrl === shortcut.ctrl;
        const altMatch = keyEvent.alt === shortcut.alt;
        const shiftMatch = keyEvent.shift === shortcut.shift;
        const metaMatch = keyEvent.meta === shortcut.meta;
        
        // Use case-insensitive comparison for key
        const keyMatch = keyEvent.key.toUpperCase() === shortcut.key.toUpperCase();
        
        console.log('Match details:', {
            ctrlMatch,
            altMatch,
            shiftMatch,
            metaMatch,
            keyMatch,
            keyEventKey: keyEvent.key,
            shortcutKey: shortcut.key
        });
        
        const matched = ctrlMatch && altMatch && shiftMatch && metaMatch && keyMatch;
        
        if (matched) {
            console.log('Shortcut matched! Converting text...');
            // Send message back to the content script to convert text
            chrome.tabs.sendMessage(sender.tab.id, {
                action: "convertText"
            }, function(response) {
                console.log('Response from content script after shortcut:', response);
            });
            
            sendResponse({matched: true});
        } else {
            sendResponse({matched: false});
        }
        
        return true;
    }
    
    // Register a new shortcut
    if (request.action === 'registerShortcut') {
        console.log('Registering shortcut:', request.shortcut);
        currentShortcut = parseShortcutString(request.shortcut);
        
        // Save to storage to ensure persistence
        storage.sync.set({shortcut: request.shortcut}, function() {
            console.log('Shortcut saved to storage');
        });
        
        sendResponse({success: true, shortcut: currentShortcut});
        return true;
    }
    
    return true; // Keep the message channel open for async response
});

// Initialize
loadSettings();