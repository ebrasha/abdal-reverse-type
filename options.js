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

// Load saved settings
document.addEventListener('DOMContentLoaded', function() {
    browser.storage.sync.get('shortcut', function(result) {
        if (result.shortcut) {
            document.getElementById('shortcut').value = result.shortcut;
        }
    });
});

// Save settings
document.getElementById('save').addEventListener('click', function() {
    const shortcut = document.getElementById('shortcut').value;

    browser.storage.sync.set({
        shortcut: shortcut
    }, function() {
        const status = document.getElementById('status');
        status.textContent = 'تنظیمات با موفقیت ذخیره شد.';
        status.className = 'status success';
        status.style.display = 'block';

        setTimeout(function() {
            status.style.display = 'none';
        }, 2000);
    });
});