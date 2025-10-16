// Background script for Site Blocker & Time Budget extension

class SiteBlocker {
  constructor() {
    this.blockedSites = new Set(['youtube.com', 'reddit.com', 'facebook.com']);
    this.timeBudgets = new Map(); // site -> weekly minutes
    this.currentSessions = new Map(); // site -> start time
    this.educationalOverrides = new Set(); // active override codes
    this.settings = {
      weekdaySchedule: { start: '09:00', end: '17:00', enabled: true },
      weekendSchedule: { enabled: false },
      blockAfterMinutes: 30,
      educationalCodes: ['EDU2024', 'LEARN123', 'STUDY456']
    };

    this.loadSettings();
    this.setupAlarms();
    this.setupMessageListener();
  }

  async loadSettings() {
    const result = await chrome.storage.local.get(['settings', 'timeBudgets', 'blockedSites']);
    if (result.settings) {
      this.settings = { ...this.settings, ...result.settings };
    }
    if (result.timeBudgets) {
      this.timeBudgets = new Map(Object.entries(result.timeBudgets));
    }
    if (result.blockedSites) {
      this.blockedSites = new Set(result.blockedSites);
    }
  }

  async saveSettings() {
    await chrome.storage.local.set({
      settings: this.settings,
      timeBudgets: Object.fromEntries(this.timeBudgets),
      blockedSites: Array.from(this.blockedSites)
    });
  }

  setupAlarms() {
    // Check every minute for time budget updates
    chrome.alarms.create('timeBudgetCheck', { delayInMinutes: 1, periodInMinutes: 1 });

    // Check every hour for schedule changes
    chrome.alarms.create('scheduleCheck', { delayInMinutes: 60, periodInMinutes: 60 });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'START_SESSION':
          this.startSession(message.site);
          break;
        case 'END_SESSION':
          this.endSession(message.site);
          break;
        case 'CHECK_BLOCKED':
          sendResponse(this.isSiteBlocked(message.site, message.url));
          break;
        case 'ADD_OVERRIDE':
          this.addEducationalOverride(message.code);
          sendResponse(true);
          break;
        case 'UPDATE_SETTINGS':
          this.updateSettings(message.settings);
          break;
        case 'GET_STATS':
          sendResponse(this.getWeeklyStats());
          break;
        case 'GET_SETTINGS':
          sendResponse(this.settings);
          break;
        case 'EMERGENCY_BLOCK_ALL':
          this.emergencyBlockAll();
          sendResponse(true);
          break;
      }
      return true;
    });
  }

  startSession(site) {
    if (this.currentSessions.has(site)) return;

    const now = new Date();
    this.currentSessions.set(site, now);

    // Set alarm to end session after configured minutes
    const alarmName = `endSession_${site}`;
    chrome.alarms.create(alarmName, {
      delayInMinutes: this.settings.blockAfterMinutes
    });

    console.log(`Started session for ${site} at ${now.toISOString()}`);
  }

  endSession(site) {
    if (!this.currentSessions.has(site)) return;

    const startTime = this.currentSessions.get(site);
    const endTime = new Date();
    const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));

    this.currentSessions.delete(site);

    // Update weekly budget
    this.updateWeeklyBudget(site, durationMinutes);

    console.log(`Ended session for ${site}, duration: ${durationMinutes} minutes`);
  }

  updateWeeklyBudget(site, minutesUsed) {
    const currentWeek = this.getCurrentWeek();
    const key = `${site}_${currentWeek}`;

    chrome.storage.local.get([key], (result) => {
      const currentUsage = result[key] || 0;
      const newUsage = currentUsage + minutesUsed;

      chrome.storage.local.set({ [key]: newUsage }, () => {
        console.log(`Updated ${site} budget: ${newUsage} minutes this week`);
      });
    });
  }

  isSiteBlocked(site, url) {
    if (this.educationalOverrides.size > 0) {
      return false; // Educational override active
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    // Check schedule
    if (isWeekday && this.settings.weekdaySchedule.enabled) {
      if (currentTime >= this.settings.weekdaySchedule.start &&
          currentTime <= this.settings.weekdaySchedule.end) {
        return this.blockedSites.has(site);
      }
    }

    if (isWeekend && this.settings.weekendSchedule.enabled) {
      return this.blockedSites.has(site);
    }

    // Check time budget
    if (this.timeBudgets.has(site)) {
      const budgetMinutes = this.timeBudgets.get(site);
      const currentWeek = this.getCurrentWeek();
      const usageKey = `${site}_${currentWeek}`;

      chrome.storage.local.get([usageKey], (result) => {
        const usage = result[usageKey] || 0;
        if (usage >= budgetMinutes) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url.includes(site)) {
              chrome.tabs.sendMessage(tabs[0].id, {
                type: 'BLOCK_SITE',
                reason: 'Weekly time budget exceeded'
              });
            }
          });
        }
      });
    }

    return false;
  }

  addEducationalOverride(code) {
    if (this.settings.educationalCodes.includes(code)) {
      this.educationalOverrides.add(code);

      // Auto-remove override after 30 minutes
      setTimeout(() => {
        this.educationalOverrides.delete(code);
      }, 30 * 60 * 1000);

      console.log(`Educational override added: ${code}`);
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getWeeklyStats() {
    const currentWeek = this.getCurrentWeek();
    const stats = {};

    this.blockedSites.forEach(site => {
      const usageKey = `${site}_${currentWeek}`;
      chrome.storage.local.get([usageKey], (result) => {
        stats[site] = result[usageKey] || 0;
      });
    });

    return stats;
  }

  getCurrentWeek() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString().slice(0, 10);
  }

  emergencyBlockAll() {
    // Block all sites immediately for emergency situations
    this.settings.emergencyBlock = true;

    // Set all sites to blocked
    this.blockedSites = new Set(['youtube.com', 'reddit.com', 'facebook.com', 'twitter.com', 'instagram.com']);

    // Clear any active overrides
    this.educationalOverrides.clear();

    this.saveSettings();

    // Show notification
    chrome.notifications.create('emergency-block', {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🚫 Emergency Block Activated',
      message: 'All sites have been blocked immediately.'
    });

    console.log('Emergency block activated');
  }
}

// Initialize the site blocker
const siteBlocker = new SiteBlocker();

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('endSession_')) {
    const site = alarm.name.replace('endSession_', '');
    siteBlocker.endSession(site);
  } else if (alarm.name === 'timeBudgetCheck') {
    // Check all active tabs for budget violations
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url) {
          const url = new URL(tab.url);
          const site = url.hostname.replace('www.', '');
          siteBlocker.isSiteBlocked(site, tab.url);
        }
      });
    });
  }
});

console.log('Site Blocker background script loaded');
