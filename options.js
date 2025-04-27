/*
 **********************************************************************
 * -------------------------------------------------------------------
 * Project Name : Abdal Reverse Type
 * File Name    : options.js
 * Author       : Ebrahim Shafiei (EbraSha)
 * Email        : Prof.Shafiei@Gmail.com
 * Created On   : 2024-03-21 11:00:00
 * Description  : Options page script for managing extension settings
 * -------------------------------------------------------------------
 *
 * "Coding is an engaging and beloved hobby for me. I passionately and insatiably pursue knowledge in cybersecurity and programming."
 * – Ebrahim Shafiei
 *
 **********************************************************************
 */

// Browser compatibility helper
const storage = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;
const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;

// Global variable to track if a shortcut was loaded from storage
let shortcutLoadedFromStorage = false;

// Load saved settings
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading options page settings...');
    
    // Ensure the DOM is fully ready before loading settings
    setTimeout(loadSavedSettings, 100);
});

// Function to load settings from storage with retry capability
function loadSavedSettings(retryCount = 0) {
    console.log(`Attempting to load settings (attempt ${retryCount + 1})...`);
    
    // Load pe key mapping setting and shortcut
    storage.sync.get(['peKeyMapping', 'shortcut'], function(result) {
        console.log('Retrieved settings from storage:', result);
        
        try {
            // Set Pe key mapping radio button
            const peKeyMapping = result.peKeyMapping || 'm'; // Default to 'm'
            console.log('Setting pe key mapping to:', peKeyMapping);
            
            // Fix the issue with backslash value by using ID selectors instead of value selectors
            let radioButton = null;
            
            // Use a more robust way to find the radio button
            switch(peKeyMapping) {
                case 'm':
                    radioButton = document.getElementById('pe-m');
                    break;
                case '\\':
                    radioButton = document.getElementById('pe-backslash');
                    break;
                case '`':
                    radioButton = document.getElementById('pe-backtick');
                    break;
                default:
                    // Fallback to standard query selector if IDs don't match
                    radioButton = document.querySelector(`input[name="peKeyMapping"][value="${peKeyMapping}"]`);
            }
            
            console.log('Found radio button:', radioButton);
            
            if (radioButton) {
                radioButton.checked = true;
                console.log('Successfully set Pe key mapping radio button to:', peKeyMapping);
            } else {
                console.error(`Radio button for value ${peKeyMapping} not found in DOM`);
                // Log all radio buttons for debugging
                const allRadios = document.querySelectorAll('input[name="peKeyMapping"]');
                console.log('Available radio buttons:', Array.from(allRadios).map(el => ({id: el.id, value: el.value})));
                
                if (retryCount < 3) {
                    setTimeout(() => loadSavedSettings(retryCount + 1), 200);
                    return;
                }
            }
            
            // Set shortcut value if available
            if (result.shortcut) {
                const shortcutField = document.getElementById('shortcut');
                if (shortcutField) {
                    shortcutField.value = result.shortcut;
                    shortcutLoadedFromStorage = true;
                    console.log('Successfully set shortcut value:', result.shortcut);
                } else {
                    console.error('Shortcut field not found in DOM');
                    if (retryCount < 3) {
                        setTimeout(() => loadSavedSettings(retryCount + 1), 200);
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Error applying saved settings:', error);
            if (retryCount < 3) {
                setTimeout(() => loadSavedSettings(retryCount + 1), 200);
                return;
            }
        }
    });
    
    // Setup shortcut field after loading settings
    setupShortcutField();
}

// Set up shortcut input field to capture key combinations
function setupShortcutField() {
    const shortcutField = document.getElementById('shortcut');
    if (!shortcutField) {
        console.error('Shortcut field not found when setting up events');
        setTimeout(setupShortcutField, 200);
        return;
    }
    
    console.log('Setting up shortcut field event handlers');
    
    shortcutField.addEventListener('keydown', function(e) {
        e.preventDefault(); // Prevent default input behavior
        
        // Skip if only modifier keys are pressed
        if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') {
            return;
        }
        
        // Build the shortcut string
        let shortcut = [];
        if (e.ctrlKey) shortcut.push('Ctrl');
        if (e.altKey) shortcut.push('Alt');
        if (e.shiftKey) shortcut.push('Shift');
        if (e.metaKey) shortcut.push('Meta');
        
        // Make sure at least one modifier key is pressed
        if (shortcut.length === 0) {
            console.log('Shortcut must include at least one modifier key (Ctrl, Alt, Shift)');
            return;
        }
        
        // Add the actual key (if it's not a modifier)
        let key = e.key;
        
        // Handle special keys
        if (key === ' ') key = 'Space';
        else if (key === 'ArrowUp') key = '↑';
        else if (key === 'ArrowDown') key = '↓';
        else if (key === 'ArrowLeft') key = '←';
        else if (key === 'ArrowRight') key = '→';
        else if (key.length === 1) key = key.toUpperCase();
        
        // Add the key to the shortcut
        shortcut.push(key);
        
        // Set the value
        this.value = shortcut.join('+');
        
        console.log('Captured shortcut:', this.value);
        
        // Immediately register the shortcut for testing
        runtime.sendMessage({
            action: 'registerShortcut',
            shortcut: this.value
        });
    });
    
    // Only clear field on focus if we don't have a saved shortcut
    shortcutField.addEventListener('focus', function() {
        if (!shortcutLoadedFromStorage) {
            this.value = '';
        }
        this.placeholder = 'Press keys for shortcut';
        // After first focus, we'll allow clearing in future focuses
        shortcutLoadedFromStorage = false;
    });
    
    // Restore placeholder on blur
    shortcutField.addEventListener('blur', function() {
        if (!this.value) {
            this.placeholder = 'مثال: Alt+Shift+R';
        }
    });
}

// Save settings
document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save');
    if (!saveButton) {
        console.error('Save button not found when setting up event handler');
        return;
    }
    
    saveButton.addEventListener('click', function() {
        // Get selected pe key mapping
        const radioButton = document.querySelector('input[name="peKeyMapping"]:checked');
        if (!radioButton) {
            console.error('No pe key mapping radio button selected');
            return;
        }
        
        const peKeyMapping = radioButton.value;
        console.log('Saving pe key mapping:', peKeyMapping);
        
        // Get shortcut
        const shortcutField = document.getElementById('shortcut');
        if (!shortcutField) {
            console.error('Shortcut field not found when saving');
            return;
        }
        
        const shortcut = shortcutField.value;
        console.log('Saving shortcut:', shortcut);
    
        // Make sure we have a valid shortcut
        if (!shortcut || shortcut.trim() === '') {
            const status = document.getElementById('status');
            if (status) {
                status.textContent = 'لطفا یک کلید میانبر معتبر انتخاب کنید.';
                status.className = 'status error';
                status.style.display = 'block';
                
                setTimeout(function() {
                    status.style.display = 'none';
                }, 2000);
            }
            
            return;
        }
    
        // Settings object with all values
        const settings = {
            peKeyMapping: peKeyMapping,
            shortcut: shortcut
        };
    
        // Save settings
        storage.sync.set(settings, function() {
            const status = document.getElementById('status');
            if (!status) {
                console.error('Status element not found when saving');
                return;
            }
            
            status.textContent = 'تنظیمات با موفقیت ذخیره شد.';
            status.className = 'status success';
            status.style.display = 'block';
    
            // Register the shortcut with the background script
            runtime.sendMessage({
                action: 'registerShortcut',
                shortcut: shortcut
            }, function(response) {
                console.log('Shortcut registration response:', response);
                
                // Flag that we have a saved shortcut to prevent clearing on focus
                shortcutLoadedFromStorage = true;
                
                // Try to verify the shortcut was registered properly
                setTimeout(function() {
                    runtime.sendMessage({
                        action: 'checkShortcut'
                    }, function(checkResponse) {
                        console.log('Shortcut check response:', checkResponse);
                        if (checkResponse && checkResponse.shortcut) {
                            console.log('Shortcut confirmed registered:', checkResponse.shortcut);
                        } else {
                            console.warn('Shortcut registration not confirmed!');
                        }
                    });
                }, 500);
            });
    
            // Notify all tabs about the updated settings so they can update without refresh
            runtime.sendMessage({
                action: 'settingsUpdated',
                settings: settings
            }, function(response) {
                console.log('Settings broadcast response:', response);
            });
    
            setTimeout(function() {
                status.style.display = 'none';
            }, 2000);
            
            console.log('Settings saved successfully');
        });
    });
});

// Check for stored settings on page load and periodically
window.addEventListener('load', function() {
    console.log('Window fully loaded, verifying settings display');
    
    // Double-check settings are loaded after everything is ready
    setTimeout(function() {
        storage.sync.get(['peKeyMapping', 'shortcut'], function(result) {
            console.log('Final verification of settings:', result);
            
            // Verify and update Pe key mapping if needed
            if (result.peKeyMapping) {
                // Fix the issue with backslash value by using ID selectors instead of value selectors
                let expectedRadio = null;
                const peKeyMapping = result.peKeyMapping;
                
                // Use a more robust way to find the radio button
                switch(peKeyMapping) {
                    case 'm':
                        expectedRadio = document.getElementById('pe-m');
                        break;
                    case '\\':
                        expectedRadio = document.getElementById('pe-backslash');
                        break;
                    case '`':
                        expectedRadio = document.getElementById('pe-backtick');
                        break;
                    default:
                        // Fallback to standard query selector
                        expectedRadio = document.querySelector(`input[name="peKeyMapping"][value="${peKeyMapping}"]`);
                }
                
                if (expectedRadio && !expectedRadio.checked) {
                    console.log('Fixing pe key mapping - setting to', peKeyMapping);
                    expectedRadio.checked = true;
                }
                
                // Log the state of all radio buttons for debugging
                const allRadios = document.querySelectorAll('input[name="peKeyMapping"]');
                console.log('All radio buttons status:', Array.from(allRadios).map(el => 
                    ({id: el.id, value: el.value, checked: el.checked})));
            }
            
            // Verify shortcut is displayed if available
            if (result.shortcut) {
                const shortcutField = document.getElementById('shortcut');
                if (shortcutField && shortcutField.value !== result.shortcut) {
                    console.log('Fixing shortcut display - setting to', result.shortcut);
                    shortcutField.value = result.shortcut;
                    shortcutLoadedFromStorage = true;
                }
            }
        });
    }, 500);
});