// Content script for YouTube video detection and control

class YouTubeController {
  constructor() {
    this.currentVideo = null;
    this.isBlocked = false;
    this.setupMessageListener();
    this.detectPageLoad();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'BLOCK_SITE':
          this.blockSite(message.reason);
          break;
        case 'CHECK_VIDEO_EDUCATIONAL':
          this.checkIfVideoEducational();
          break;
      }
      return true;
    });
  }

  detectPageLoad() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initialize();
      });
    } else {
      this.initialize();
    }
  }

  initialize() {
    // Check if we're on YouTube
    if (!window.location.hostname.includes('youtube.com')) return;

    // Start session tracking
    this.startSession();

    // Monitor for video player
    this.waitForVideoPlayer();

    // Check if site should be blocked
    this.checkSiteBlocking();
  }

  startSession() {
    chrome.runtime.sendMessage({
      type: 'START_SESSION',
      site: 'youtube.com'
    });
  }

  waitForVideoPlayer() {
    const checkForPlayer = () => {
      const videoPlayer = document.querySelector('video');
      if (videoPlayer && !this.currentVideo) {
        this.currentVideo = videoPlayer;
        this.attachVideoListeners();
      } else if (!videoPlayer) {
        setTimeout(checkForPlayer, 1000);
      }
    };
    checkForPlayer();
  }

  attachVideoListeners() {
    if (!this.currentVideo) return;

    // Monitor video play state
    this.currentVideo.addEventListener('play', () => {
      if (this.isBlocked) {
        this.showEducationalOverridePrompt();
      }
    });

    // Monitor for video changes (new video loaded)
    const observer = new MutationObserver(() => {
      const newVideo = document.querySelector('video');
      if (newVideo && newVideo !== this.currentVideo) {
        this.currentVideo = newVideo;
        this.attachVideoListeners();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  checkSiteBlocking() {
    chrome.runtime.sendMessage({
      type: 'CHECK_BLOCKED',
      site: 'youtube.com',
      url: window.location.href
    }, (isBlocked) => {
      if (isBlocked) {
        this.blockSite('Site access restricted');
      }
    });
  }

  blockSite(reason) {
    this.isBlocked = true;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'site-blocker-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        ">
          <h2 style="color: #e74c3c; margin-bottom: 20px;">🚫 Access Blocked</h2>
          <p style="margin-bottom: 15px; color: #333;">${reason}</p>
          <p style="margin-bottom: 20px; color: #666; font-size: 14px;">
            This site is currently blocked according to your schedule or time budget.
          </p>
          <div style="margin-bottom: 20px;">
            <button id="educational-override-btn" style="
              background: #3498db;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              margin-right: 10px;
              font-size: 14px;
            ">Educational Override</button>
            <button id="close-tab-btn" style="
              background: #95a5a6;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
            ">Close Tab</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Add event listeners
    document.getElementById('educational-override-btn').addEventListener('click', () => {
      this.showEducationalOverridePrompt();
    });

    document.getElementById('close-tab-btn').addEventListener('click', () => {
      window.close();
    });
  }

  showEducationalOverridePrompt() {
    const promptOverlay = document.createElement('div');
    promptOverlay.id = 'educational-prompt-overlay';
    promptOverlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999999;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        ">
          <h2 style="color: #3498db; margin-bottom: 20px;">🎓 Educational Override</h2>
          <p style="margin-bottom: 20px; color: #333;">
            If this video is educational content, enter the override code to continue watching:
          </p>
          <input type="text" id="override-code" placeholder="Enter override code" style="
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 16px;
            text-align: center;
          ">
          <div>
            <button id="submit-override-btn" style="
              background: #2ecc71;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              margin-right: 10px;
              font-size: 14px;
            ">Submit</button>
            <button id="cancel-override-btn" style="
              background: #95a5a6;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
            ">Cancel</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(promptOverlay);

    // Add event listeners
    document.getElementById('submit-override-btn').addEventListener('click', () => {
      const code = document.getElementById('override-code').value.trim();
      if (code) {
        chrome.runtime.sendMessage({
          type: 'ADD_OVERRIDE',
          code: code
        }, (success) => {
          if (success) {
            this.removeOverlay();
            this.isBlocked = false;
          } else {
            alert('Invalid override code. Please try again.');
          }
        });
      }
    });

    document.getElementById('cancel-override-btn').addEventListener('click', () => {
      document.body.removeChild(promptOverlay);
    });

    // Focus on input
    document.getElementById('override-code').focus();
  }

  removeOverlay() {
    const overlay = document.getElementById('site-blocker-overlay');
    const promptOverlay = document.getElementById('educational-prompt-overlay');

    if (overlay) document.body.removeChild(overlay);
    if (promptOverlay) document.body.removeChild(promptOverlay);
  }

  checkIfVideoEducational() {
    // Try to determine if current video is educational
    const title = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent || '';
    const description = document.querySelector('#description')?.textContent || '';

    const educationalKeywords = [
      'tutorial', 'lesson', 'education', 'learn', 'study', 'course',
      'university', 'college', 'academic', 'research', 'science',
      'mathematics', 'history', 'literature', 'language'
    ];

    const isEducational = educationalKeywords.some(keyword =>
      title.toLowerCase().includes(keyword) ||
      description.toLowerCase().includes(keyword)
    );

    return isEducational;
  }
}

// Initialize the YouTube controller
const youtubeController = new YouTubeController();

console.log('YouTube Controller content script loaded');
