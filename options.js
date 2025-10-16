// Options/Settings page script

class SettingsController {
    constructor() {
        this.defaultSettings = {
            weekdaySchedule: {
                enabled: true,
                start: '09:00',
                end: '17:00'
            },
            weekendSchedule: {
                enabled: false
            },
            blockAfterMinutes: 30,
            educationalCodes: ['EDU2024', 'LEARN123', 'STUDY456'],
            blockedSites: ['youtube.com', 'reddit.com', 'facebook.com'],
            siteBudgets: {
                'youtube.com': 120,
                'reddit.com': 120,
                'facebook.com': 120
            }
        };

        this.currentSettings = {};

        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        // Schedule elements
        this.weekdayEnabled = document.getElementById('weekday-enabled');
        this.weekdayStart = document.getElementById('weekday-start');
        this.weekdayEnd = document.getElementById('weekday-end');
        this.weekendEnabled = document.getElementById('weekend-enabled');
        this.blockDuration = document.getElementById('block-duration');

        // Lists
        this.sitesList = document.getElementById('sites-list');
        this.educationalCodesList = document.getElementById('educational-codes');
        this.blockedSitesList = document.getElementById('blocked-sites-list');

        // Buttons
        this.addSiteBtn = document.getElementById('add-site');
        this.addCodeBtn = document.getElementById('add-code');
        this.saveBtn = document.getElementById('save-settings');
        this.resetBtn = document.getElementById('reset-settings');

        // Status
        this.statusMessage = document.getElementById('status-message');
    }

    setupEventListeners() {
        this.weekdayEnabled.addEventListener('change', () => {
            this.toggleWeekdayTimes();
        });

        this.addSiteBtn.addEventListener('click', () => {
            this.addSiteInput();
        });

        this.addCodeBtn.addEventListener('click', () => {
            this.addCodeInput();
        });

        this.saveBtn.addEventListener('click', () => {
            this.saveSettings();
        });

        this.resetBtn.addEventListener('click', () => {
            this.resetToDefaults();
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get([
                'settings',
                'blockedSites',
                'siteBudgets'
            ]);

            if (result.settings) {
                this.currentSettings = { ...this.defaultSettings, ...result.settings };
            } else {
                this.currentSettings = { ...this.defaultSettings };
            }

            if (result.blockedSites) {
                this.currentSettings.blockedSites = result.blockedSites;
            }

            if (result.siteBudgets) {
                this.currentSettings.siteBudgets = result.siteBudgets;
            }

            this.populateForm();
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showStatus('Error loading settings', 'error');
        }
    }

    populateForm() {
        // Populate schedule settings
        this.weekdayEnabled.checked = this.currentSettings.weekdaySchedule.enabled;
        this.weekdayStart.value = this.currentSettings.weekdaySchedule.start;
        this.weekdayEnd.value = this.currentSettings.weekdaySchedule.end;
        this.weekendEnabled.checked = this.currentSettings.weekendSchedule.enabled;
        this.blockDuration.value = this.currentSettings.blockAfterMinutes;

        this.toggleWeekdayTimes();

        // Populate sites list
        this.populateSitesList();

        // Populate educational codes
        this.populateEducationalCodes();

        // Populate blocked sites
        this.populateBlockedSites();
    }

    toggleWeekdayTimes() {
        const weekdayTimes = document.getElementById('weekday-times');
        weekdayTimes.style.opacity = this.weekdayEnabled.checked ? '1' : '0.5';
        this.weekdayStart.disabled = !this.weekdayEnabled.checked;
        this.weekdayEnd.disabled = !this.weekdayEnabled.checked;
    }

    populateSitesList() {
        this.sitesList.innerHTML = '';

        Object.entries(this.currentSettings.siteBudgets).forEach(([site, budget]) => {
            const siteItem = this.createSiteInput(site, budget);
            this.sitesList.appendChild(siteItem);
        });
    }

    createSiteInput(site, budget) {
        const item = document.createElement('div');
        item.className = 'site-item';

        const siteInput = document.createElement('input');
        siteInput.type = 'text';
        siteInput.value = site;
        siteInput.placeholder = 'example.com';

        const budgetInput = document.createElement('input');
        budgetInput.type = 'number';
        budgetInput.value = budget;
        budgetInput.min = '1';
        budgetInput.max = '10080'; // 1 week in minutes
        budgetInput.placeholder = '120';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
            delete this.currentSettings.siteBudgets[site];
            item.remove();
        });

        item.appendChild(siteInput);
        item.appendChild(budgetInput);
        item.appendChild(removeBtn);

        return item;
    }

    addSiteInput() {
        const item = this.createSiteInput('', 120);
        this.sitesList.appendChild(item);

        // Focus on the new site input
        const siteInput = item.querySelector('input[type="text"]');
        siteInput.focus();
    }

    populateEducationalCodes() {
        this.educationalCodesList.innerHTML = '';

        this.currentSettings.educationalCodes.forEach(code => {
            const codeItem = this.createCodeInput(code);
            this.educationalCodesList.appendChild(codeItem);
        });
    }

    createCodeInput(code) {
        const item = document.createElement('div');
        item.className = 'code-item';

        const codeInput = document.createElement('input');
        codeInput.type = 'text';
        codeInput.value = code;
        codeInput.placeholder = 'EDU2024';
        codeInput.maxLength = '20';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
            const index = this.currentSettings.educationalCodes.indexOf(code);
            if (index > -1) {
                this.currentSettings.educationalCodes.splice(index, 1);
            }
            item.remove();
        });

        item.appendChild(codeInput);
        item.appendChild(removeBtn);

        return item;
    }

    addCodeInput() {
        const item = this.createCodeInput('');
        this.educationalCodesList.appendChild(item);

        // Focus on the new code input
        const codeInput = item.querySelector('input');
        codeInput.focus();
    }

    populateBlockedSites() {
        this.blockedSitesList.innerHTML = '';

        this.currentSettings.blockedSites.forEach(site => {
            const siteItem = this.createBlockedSiteInput(site);
            this.blockedSitesList.appendChild(siteItem);
        });
    }

    createBlockedSiteInput(site) {
        const item = document.createElement('div');
        item.className = 'site-item';

        const siteInput = document.createElement('input');
        siteInput.type = 'text';
        siteInput.value = site;
        siteInput.placeholder = 'example.com';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
            const index = this.currentSettings.blockedSites.indexOf(site);
            if (index > -1) {
                this.currentSettings.blockedSites.splice(index, 1);
            }
            item.remove();
        });

        item.appendChild(siteInput);
        item.appendChild(removeBtn);

        return item;
    }

    collectFormData() {
        // Collect schedule settings
        this.currentSettings.weekdaySchedule.enabled = this.weekdayEnabled.checked;
        this.currentSettings.weekdaySchedule.start = this.weekdayStart.value;
        this.currentSettings.weekdaySchedule.end = this.weekdayEnd.value;
        this.currentSettings.weekendSchedule.enabled = this.weekendEnabled.checked;
        this.currentSettings.blockAfterMinutes = parseInt(this.blockDuration.value) || 30;

        // Collect site budgets
        this.currentSettings.siteBudgets = {};
        const siteItems = this.sitesList.querySelectorAll('.site-item');
        siteItems.forEach(item => {
            const inputs = item.querySelectorAll('input');
            const site = inputs[0].value.trim();
            const budget = parseInt(inputs[1].value) || 120;
            if (site) {
                this.currentSettings.siteBudgets[site] = budget;
            }
        });

        // Collect educational codes
        this.currentSettings.educationalCodes = [];
        const codeItems = this.educationalCodesList.querySelectorAll('.code-item input');
        codeItems.forEach(input => {
            const code = input.value.trim();
            if (code) {
                this.currentSettings.educationalCodes.push(code);
            }
        });

        // Collect blocked sites
        this.currentSettings.blockedSites = [];
        const blockedItems = this.blockedSitesList.querySelectorAll('.site-item input');
        blockedItems.forEach(input => {
            const site = input.value.trim();
            if (site) {
                this.currentSettings.blockedSites.push(site);
            }
        });
    }

    async saveSettings() {
        try {
            this.collectFormData();

            // Validate settings
            if (!this.validateSettings()) {
                return;
            }

            // Save to storage
            await chrome.storage.local.set({
                settings: this.currentSettings,
                blockedSites: this.currentSettings.blockedSites,
                siteBudgets: this.currentSettings.siteBudgets
            });

            // Update background script
            chrome.runtime.sendMessage({
                type: 'UPDATE_SETTINGS',
                settings: this.currentSettings
            });

            this.showStatus('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Error saving settings', 'error');
        }
    }

    validateSettings() {
        // Validate time format
        if (this.currentSettings.weekdaySchedule.enabled) {
            if (!this.currentSettings.weekdaySchedule.start ||
                !this.currentSettings.weekdaySchedule.end) {
                this.showStatus('Please set weekday start and end times', 'error');
                return false;
            }

            if (this.currentSettings.weekdaySchedule.start >= this.currentSettings.weekdaySchedule.end) {
                this.showStatus('Weekday start time must be before end time', 'error');
                return false;
            }
        }

        // Validate block duration
        if (this.currentSettings.blockAfterMinutes < 1 || this.currentSettings.blockAfterMinutes > 1440) {
            this.showStatus('Block duration must be between 1 and 1440 minutes', 'error');
            return false;
        }

        // Validate at least one educational code
        if (this.currentSettings.educationalCodes.length === 0) {
            this.showStatus('Please add at least one educational override code', 'error');
            return false;
        }

        return true;
    }

    async resetToDefaults() {
        if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            return;
        }

        try {
            this.currentSettings = { ...this.defaultSettings };

            // Clear storage
            await chrome.storage.local.clear();

            this.populateForm();
            this.showStatus('Settings reset to defaults', 'success');
        } catch (error) {
            console.error('Error resetting settings:', error);
            this.showStatus('Error resetting settings', 'error');
        }
    }

    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message status-${type}`;
        this.statusMessage.style.display = 'block';

        // Hide after 5 seconds
        setTimeout(() => {
            this.statusMessage.style.display = 'none';
        }, 5000);
    }
}

// Initialize the settings controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsController();
});

console.log('Options script loaded');
