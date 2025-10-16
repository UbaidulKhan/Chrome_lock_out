// Popup script for Site Blocker & Time Budget extension

class PopupController {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.updateCurrentTime();
        this.loadData();

        // Update time every minute
        setInterval(() => this.updateCurrentTime(), 60000);
    }

    initializeElements() {
        this.currentTimeElement = document.getElementById('current-time');
        this.scheduleStatusElement = document.getElementById('schedule-status');
        this.usageStatsElement = document.getElementById('usage-stats');
        this.overrideCodeInput = document.getElementById('override-code');

        this.submitOverrideBtn = document.getElementById('submit-override');
        this.clearOverrideBtn = document.getElementById('clear-override');
        this.settingsBtn = document.getElementById('settings-btn');
        this.statsBtn = document.getElementById('stats-btn');
        this.emergencyStopBtn = document.getElementById('emergency-stop');
    }

    setupEventListeners() {
        this.submitOverrideBtn.addEventListener('click', () => this.submitOverride());
        this.clearOverrideBtn.addEventListener('click', () => this.clearOverride());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.statsBtn.addEventListener('click', () => this.openStats());
        this.emergencyStopBtn.addEventListener('click', () => this.emergencyStop());

        // Enter key for override code
        this.overrideCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitOverride();
            }
        });
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const dateString = now.toLocaleDateString([], {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });

        this.currentTimeElement.textContent = `${timeString} - ${dateString}`;
    }

    async loadData() {
        try {
            // Get settings from background script
            const settings = await this.getSettings();
            this.displayScheduleStatus(settings);

            // Get usage stats
            const stats = await this.getStats();
            this.displayUsageStats(stats);

        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load extension data');
        }
    }

    async getSettings() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
                resolve(response || {});
            });
        });
    }

    async getStats() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
                resolve(response || {});
            });
        });
    }

    displayScheduleStatus(settings) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;

        let scheduleText = '';
        let statusClass = 'schedule-inactive';

        if (isWeekday && settings.weekdaySchedule?.enabled) {
            if (currentTime >= settings.weekdaySchedule.start &&
                currentTime <= settings.weekdaySchedule.end) {
                scheduleText = `📅 Weekday schedule active (${settings.weekdaySchedule.start} - ${settings.weekdaySchedule.end})`;
                statusClass = 'schedule-active';
            } else {
                scheduleText = `📅 Weekday schedule inactive (active ${settings.weekdaySchedule.start} - ${settings.weekdaySchedule.end})`;
            }
        } else if (isWeekend && settings.weekendSchedule?.enabled) {
            scheduleText = `🏖️ Weekend schedule active`;
            statusClass = 'schedule-active';
        } else {
            scheduleText = `😴 No active schedule`;
        }

        this.scheduleStatusElement.textContent = scheduleText;
        this.scheduleStatusElement.className = statusClass;
    }

    displayUsageStats(stats) {
        if (!stats || Object.keys(stats).length === 0) {
            this.usageStatsElement.innerHTML = `
                <div class="status-item">
                    <span class="site-name">No usage data available</span>
                    <span class="time-remaining">0 min</span>
                </div>
            `;
            return;
        }

        this.usageStatsElement.innerHTML = '';

        Object.entries(stats).forEach(([site, minutes]) => {
            const statusItem = document.createElement('div');
            statusItem.className = 'status-item';

            const siteName = document.createElement('span');
            siteName.className = 'site-name';
            siteName.textContent = site.replace('.com', '');

            const timeRemaining = document.createElement('span');
            const budget = this.getSiteBudget(site);
            const remaining = Math.max(0, budget - minutes);

            if (remaining === 0) {
                timeRemaining.className = 'time-exceeded';
                timeRemaining.textContent = 'Exceeded';
            } else {
                timeRemaining.className = 'time-remaining';
                timeRemaining.textContent = `${remaining} min left`;
            }

            statusItem.appendChild(siteName);
            statusItem.appendChild(timeRemaining);
            this.usageStatsElement.appendChild(statusItem);
        });
    }

    getSiteBudget(site) {
        // Default budgets in minutes (2 hours per site per week)
        const defaultBudgets = {
            'youtube.com': 120,
            'reddit.com': 120,
            'facebook.com': 120
        };
        return defaultBudgets[site] || 120;
    }

    async submitOverride() {
        const code = this.overrideCodeInput.value.trim();
        if (!code) {
            this.showMessage('Please enter an override code', 'error');
            return;
        }

        try {
            const success = await this.sendOverrideCode(code);
            if (success) {
                this.showMessage('Educational override activated!', 'success');
                this.overrideCodeInput.value = '';
                setTimeout(() => window.close(), 1500);
            } else {
                this.showMessage('Invalid override code', 'error');
            }
        } catch (error) {
            console.error('Override error:', error);
            this.showMessage('Failed to activate override', 'error');
        }
    }

    async sendOverrideCode(code) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({
                type: 'ADD_OVERRIDE',
                code: code
            }, (success) => {
                resolve(success);
            });
        });
    }

    async clearOverride() {
        this.overrideCodeInput.value = '';
        // Note: In a real implementation, you'd want to send a message to clear active overrides
        this.showMessage('Override code cleared', 'info');
    }

    openSettings() {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }

    openStats() {
        chrome.tabs.create({ url: chrome.runtime.getURL('stats.html') });
    }

    async emergencyStop() {
        try {
            // Block all sites immediately
            await chrome.runtime.sendMessage({
                type: 'EMERGENCY_BLOCK_ALL'
            });

            this.showMessage('Emergency block activated!', 'success');

            // Close current tab if it's a blocked site
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && this.isBlockedSite(tab.url)) {
                setTimeout(() => chrome.tabs.remove(tab.id), 1000);
            }

        } catch (error) {
            console.error('Emergency stop error:', error);
            this.showMessage('Failed to activate emergency block', 'error');
        }
    }

    isBlockedSite(url) {
        const blockedSites = ['youtube.com', 'reddit.com', 'facebook.com'];
        return blockedSites.some(site => url.includes(site));
    }

    showMessage(message, type = 'info') {
        // Remove existing message
        const existingMessage = document.querySelector('.temp-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message element
        const messageElement = document.createElement('div');
        messageElement.className = `temp-message ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            z-index: 10000;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#3498db'};
            color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(messageElement);

        // Remove after 3 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 3000);
    }

    showError(message) {
        this.showMessage(message, 'error');
    }
}

// Initialize the popup controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});

console.log('Popup script loaded');
