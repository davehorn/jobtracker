// Background script for Job Tracker Chrome Extension
// Handles extension lifecycle and communication

class JobTrackerBackground {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/extension';
        this.dashboardUrl = 'http://localhost:3000';
        
        this.initializeListeners();
        console.log('Job Tracker background script initialized');
    }

    initializeListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });

        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Indicate async response
        });

        // Handle extension icon click (optional - popup handles this)
        chrome.action.onClicked.addListener((tab) => {
            this.handleActionClick(tab);
        });

        // Handle tab updates to detect job pages
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });
    }

    handleInstallation(details) {
        console.log('Job Tracker extension installed/updated:', details.reason);
        
        if (details.reason === 'install') {
            // First time installation
            this.showWelcomeNotification();
        } else if (details.reason === 'update') {
            // Extension updated
            console.log('Extension updated to version:', chrome.runtime.getManifest().version);
        }
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'jobPageDetected':
                    await this.handleJobPageDetected(message, sender);
                    sendResponse({ success: true });
                    break;
                    
                case 'captureJob':
                    const result = await this.captureJobFromContent(message.jobData);
                    sendResponse(result);
                    break;
                    
                case 'healthCheck':
                    const health = await this.checkApiHealth();
                    sendResponse(health);
                    break;
                    
                case 'openDashboard':
                    await this.openDashboard();
                    sendResponse({ success: true });
                    break;
                    
                default:
                    console.log('Unknown message action:', message.action);
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background message handling error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    handleActionClick(tab) {
        // This is called when user clicks extension icon if no popup is defined
        // Since we have a popup, this typically won't be called
        console.log('Extension icon clicked on tab:', tab.url);
    }

    handleTabUpdate(tabId, changeInfo, tab) {
        // Monitor tab changes to potentially update badge or icon
        if (changeInfo.status === 'complete' && tab.url) {
            const isJobSite = this.isJobSite(tab.url);
            if (isJobSite) {
                // Could update badge or icon to indicate job site
                console.log('Job site detected:', tab.url);
            }
        }
    }

    async handleJobPageDetected(message, sender) {
        console.log('Job page detected:', message.url);
        
        // Could show a subtle notification or update badge
        // For now, just log the detection
        if (sender.tab) {
            this.updateBadgeForJobPage(sender.tab.id);
        }
    }

    async captureJobFromContent(jobData) {
        try {
            console.log('Capturing job from content script:', jobData);
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: jobData.url,
                    description: jobData.description
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Show success notification
                this.showSuccessNotification();
                return { success: true, data: result.data };
            } else {
                console.error('API error:', result);
                return { success: false, error: result.error || 'Unknown API error' };
            }
        } catch (error) {
            console.error('Capture error:', error);
            return { success: false, error: error.message };
        }
    }

    async checkApiHealth() {
        try {
            const response = await fetch(this.apiUrl, { method: 'GET' });
            const result = await response.json();
            
            return {
                success: response.ok,
                status: result.success ? 'running' : 'error',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                status: 'unreachable',
                error: error.message
            };
        }
    }

    async openDashboard() {
        try {
            await chrome.tabs.create({ url: this.dashboardUrl });
            return { success: true };
        } catch (error) {
            console.error('Failed to open dashboard:', error);
            return { success: false, error: error.message };
        }
    }

    updateBadgeForJobPage(tabId) {
        // Update badge to show job page is detected
        chrome.action.setBadgeText({
            text: '●',
            tabId: tabId
        });
        
        chrome.action.setBadgeBackgroundColor({
            color: '#10B981', // Green
            tabId: tabId
        });
        
        // Clear badge after 5 seconds
        setTimeout(() => {
            chrome.action.setBadgeText({
                text: '',
                tabId: tabId
            });
        }, 5000);
    }

    showWelcomeNotification() {
        chrome.notifications.create('welcome', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Job Tracker Installed!',
            message: 'Start capturing job postings from any job site. Click the extension icon on job pages to get started.'
        });
    }

    showSuccessNotification() {
        chrome.notifications.create('success', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Job Captured Successfully!',
            message: 'Your job has been added to Job Tracker with AI processing initiated.'
        });
    }

    isJobSite(url) {
        const jobSites = [
            'linkedin.com',
            'indeed.com',
            'glassdoor.com',
            'monster.com',
            'ziprecruiter.com',
            'dice.com',
            'simplyhired.com',
            'careerbuilder.com'
        ];
        
        return jobSites.some(site => url.includes(site));
    }

    // Utility method for development
    async testConnection() {
        console.log('Testing API connection...');
        const health = await this.checkApiHealth();
        console.log('Health check result:', health);
        return health;
    }
}

// Initialize background script
const jobTracker = new JobTrackerBackground();

// Handle errors globally
self.addEventListener('error', (event) => {
    console.error('Background script error:', event.error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection in background:', event.reason);
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobTrackerBackground;
}