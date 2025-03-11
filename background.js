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