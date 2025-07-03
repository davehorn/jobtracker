// Content script for Job Tracker Chrome Extension
// Runs on job posting pages to extract job descriptions

(function() {
  'use strict';

  // Job site configurations for extracting job descriptions
  const JOB_SITES = {
    'linkedin.com': {
      selectors: [
        '.jobs-description__content .jobs-box__html-content',
        '.jobs-description-content__text',
        '.job-details-module',
        '.jobs-description'
      ],
      titleSelectors: [
        '.jobs-unified-top-card__job-title',
        '.job-details-jobs-unified-top-card__job-title',
        '.jobs-details-top-card__job-title'
      ]
    },
    'indeed.com': {
      selectors: [
        '#jobDescriptionText',
        '.jobsearch-jobDescriptionText',
        '.jobsearch-JobComponent-description',
        '.job-description'
      ],
      titleSelectors: [
        '[data-testid="jobTitle"]',
        '.jobsearch-JobInfoHeader-title',
        'h1.jobsearch-JobInfoHeader-title'
      ]
    },
    'glassdoor.com': {
      selectors: [
        '#JobDescriptionContainer',
        '.jobDescriptionContent',
        '.desc.module',
        '.job-description'
      ],
      titleSelectors: [
        '[data-test="job-title"]',
        '.job-title',
        'h1'
      ]
    },
    'monster.com': {
      selectors: [
        '.job-description',
        '.job-posting-description',
        '#JobDescription'
      ],
      titleSelectors: [
        'h1.job-title',
        '.job-title'
      ]
    },
    'ziprecruiter.com': {
      selectors: [
        '.job_description',
        '.jobDescriptionSection',
        '.job-description-text'
      ],
      titleSelectors: [
        'h1[data-testid="job-title"]',
        '.job-title'
      ]
    },
    'dice.com': {
      selectors: [
        '.job-description',
        '#jobdescSec',
        '.job-description-text'
      ],
      titleSelectors: [
        'h1[data-cy="jobTitle"]',
        '.job-title'
      ]
    }
  };

  // Get current site configuration
  function getCurrentSiteConfig() {
    const hostname = window.location.hostname;
    for (const [site, config] of Object.entries(JOB_SITES)) {
      if (hostname.includes(site)) {
        return config;
      }
    }
    return null;
  }

  // Extract text content using multiple selectors
  function extractContent(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        // Clean up the text content
        const text = element.innerText || element.textContent || '';
        if (text.trim().length > 100) { // Minimum length check
          return text.trim();
        }
      }
    }
    return null;
  }

  // Generic fallback extraction for unknown sites
  function genericExtraction() {
    const commonSelectors = [
      '[class*="job-description"]',
      '[class*="jobdescription"]',
      '[id*="job-description"]',
      '[id*="jobdescription"]',
      '.description',
      '#description',
      '[class*="posting"]',
      '[class*="details"]'
    ];
    
    return extractContent(commonSelectors);
  }

  // Extract job title
  function extractJobTitle(config) {
    if (config && config.titleSelectors) {
      const title = extractContent(config.titleSelectors);
      if (title) return title;
    }
    
    // Fallback title extraction
    const fallbackSelectors = [
      'h1',
      '[class*="job-title"]',
      '[class*="jobtitle"]',
      '[id*="job-title"]',
      '[data-testid*="title"]'
    ];
    
    return extractContent(fallbackSelectors) || document.title;
  }

  // Main extraction function
  function extractJobData() {
    const config = getCurrentSiteConfig();
    let jobDescription = null;
    let jobTitle = null;

    if (config) {
      // Use site-specific selectors
      jobDescription = extractContent(config.selectors);
      jobTitle = extractJobTitle(config);
    }

    // Fallback to generic extraction if site-specific failed
    if (!jobDescription) {
      jobDescription = genericExtraction();
    }

    // If still no description, try extracting main content
    if (!jobDescription) {
      const bodyText = document.body.innerText || document.body.textContent || '';
      if (bodyText.length > 200) {
        jobDescription = bodyText;
      }
    }

    return {
      url: window.location.href,
      description: jobDescription,
      title: jobTitle,
      site: window.location.hostname,
      extractedAt: new Date().toISOString()
    };
  }

  // Check if this looks like a job posting page
  function isJobPostingPage() {
    const url = window.location.href.toLowerCase();
    const jobKeywords = ['job', 'career', 'position', 'posting', 'opening', 'vacancy'];
    
    return jobKeywords.some(keyword => url.includes(keyword)) ||
           document.title.toLowerCase().includes('job') ||
           document.querySelector('[class*="job"], [id*="job"]');
  }

  // Message listener for popup requests
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractJobData') {
      try {
        const jobData = extractJobData();
        const isJobPage = isJobPostingPage();
        
        sendResponse({
          success: true,
          data: jobData,
          isJobPage: isJobPage
        });
      } catch (error) {
        console.error('Job extraction error:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      }
    }
    
    // Return true to indicate we will send a response asynchronously
    return true;
  });

  // Auto-detect job pages and notify background script
  if (isJobPostingPage()) {
    chrome.runtime.sendMessage({
      action: 'jobPageDetected',
      url: window.location.href
    });
  }

  console.log('Job Tracker content script loaded on:', window.location.href);
})();