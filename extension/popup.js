// Popup script for Job Tracker Chrome Extension

class JobTrackerPopup {
    constructor() {
        this.currentJobData = null;
        this.apiUrl = 'http://localhost:3000/api/extension';
        this.dashboardUrl = 'http://localhost:3000';
        
        this.initializeElements();
        this.attachEventListeners();
        this.detectJobPosting();
    }

    initializeElements() {
        // Status elements
        this.jobDetectedEl = document.getElementById('job-detected');
        this.noJobDetectedEl = document.getElementById('no-job-detected');
        
        // Preview elements
        this.jobPreviewEl = document.getElementById('job-preview');
        this.jobTitleEl = document.getElementById('job-title');
        this.jobUrlEl = document.getElementById('job-url');
        this.descriptionLengthEl = document.getElementById('description-length');
        
        // Button elements
        this.captureBtn = document.getElementById('capture-btn');
        this.refreshBtn = document.getElementById('refresh-btn');
        
        // Result elements
        this.resultSection = document.getElementById('result-section');
        this.successMessage = document.getElementById('success-message');
        this.errorMessage = document.getElementById('error-message');
        this.errorText = document.getElementById('error-text');
        
        // Footer elements
        this.openDashboardBtn = document.getElementById('open-dashboard');
    }

    attachEventListeners() {
        this.captureBtn.addEventListener('click', () => this.captureJob());
        this.refreshBtn.addEventListener('click', () => this.detectJobPosting());
        this.openDashboardBtn.addEventListener('click', () => this.openDashboard());
    }

    async detectJobPosting() {
        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                this.showNoJobDetected('No active tab found');
                return;
            }

            // Send message to content script to extract job data
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractJobData' });

            if (response && response.success) {
                this.currentJobData = response.data;
                
                if (response.isJobPage && response.data.description) {
                    this.showJobDetected(response.data);
                } else {
                    this.showNoJobDetected('This page does not appear to contain a job posting');
                }
            } else {
                console.error('Job detection failed:', response?.error);
                this.showNoJobDetected(response?.error || 'Failed to detect job posting');
            }
        } catch (error) {
            console.error('Detection error:', error);
            this.showNoJobDetected('Error communicating with page content');
        }
    }

    showJobDetected(jobData) {
        // Update status
        this.jobDetectedEl.classList.remove('hidden');
        this.noJobDetectedEl.classList.add('hidden');
        
        // Show preview
        this.jobPreviewEl.classList.remove('hidden');
        
        // Populate preview data
        this.jobTitleEl.textContent = jobData.title || 'Job Title Not Found';
        this.jobUrlEl.textContent = this.truncateUrl(jobData.url || '');
        
        const descLength = jobData.description ? jobData.description.length : 0;
        this.descriptionLengthEl.textContent = `Description: ${descLength.toLocaleString()} characters`;
        
        // Enable capture button
        this.captureBtn.disabled = false;
        
        // Hide any previous results
        this.hideResults();
    }

    showNoJobDetected(message) {
        // Update status
        this.jobDetectedEl.classList.add('hidden');
        this.noJobDetectedEl.classList.remove('hidden');
        
        // Update message if provided
        if (message) {
            this.noJobDetectedEl.querySelector('.status-text').textContent = message;
        }
        
        // Hide preview
        this.jobPreviewEl.classList.add('hidden');
        
        // Disable capture button
        this.captureBtn.disabled = true;
        
        // Hide any previous results
        this.hideResults();
    }

    async captureJob() {
        if (!this.currentJobData || !this.currentJobData.description) {
            this.showError('No job data available to capture');
            return;
        }

        // Show loading state
        this.setLoadingState(true);
        this.hideResults();

        try {
            // Prepare job data for API
            const jobData = {
                url: this.currentJobData.url,
                description: this.currentJobData.description
            };

            console.log('Sending job data to API:', jobData);

            // Send to Job Tracker API
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showSuccess();
                console.log('Job captured successfully:', result);
            } else {
                const errorMsg = result.error || `Server error: ${response.status}`;
                this.showError(errorMsg);
                console.error('API error:', result);
            }
        } catch (error) {
            console.error('Capture error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                this.showError('Cannot connect to Job Tracker. Make sure the application is running on localhost:3000');
            } else {
                this.showError('Failed to capture job. Please try again.');
            }
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        const btnText = this.captureBtn.querySelector('.btn-text');
        const spinner = this.captureBtn.querySelector('.loading-spinner');
        
        if (loading) {
            btnText.textContent = 'Capturing...';
            spinner.classList.remove('hidden');
            this.captureBtn.disabled = true;
        } else {
            btnText.textContent = 'Capture Job';
            spinner.classList.add('hidden');
            this.captureBtn.disabled = !this.currentJobData;
        }
    }

    showSuccess() {
        this.resultSection.classList.remove('hidden');
        this.successMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
    }

    showError(message) {
        this.errorText.textContent = message;
        this.resultSection.classList.remove('hidden');
        this.errorMessage.classList.remove('hidden');
        this.successMessage.classList.add('hidden');
    }

    hideResults() {
        this.resultSection.classList.add('hidden');
        this.successMessage.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
    }

    openDashboard() {
        chrome.tabs.create({ url: this.dashboardUrl });
    }

    truncateUrl(url, maxLength = 40) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength - 3) + '...';
    }

    // Utility method for development/debugging
    testCapture() {
        console.log('Testing capture with mock data...');
        this.currentJobData = {
            url: window.location.href,
            description: 'This is a test job description for development purposes.',
            title: 'Test Job Title',
            site: 'test.com'
        };
        this.showJobDetected(this.currentJobData);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JobTrackerPopup();
});

// Handle errors globally
window.addEventListener('error', (event) => {
    console.error('Popup error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});