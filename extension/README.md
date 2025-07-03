# Job Tracker Chrome Extension

A Chrome extension that automatically captures job postings from major job sites and sends them to your Job Tracker application for AI-powered analysis and resume customization.

## Features

- ✅ **One-click job capture** from any job posting page
- ✅ **Automatic job detection** on major job sites (LinkedIn, Indeed, Glassdoor, etc.)
- ✅ **AI processing integration** - automatically generates customized resumes and cover letters
- ✅ **Smart content extraction** - works across different job site layouts
- ✅ **Real-time feedback** - visual confirmation of successful captures
- ✅ **Direct dashboard access** - quick link to your Job Tracker application

## Supported Job Sites

The extension automatically detects job postings on:

- **LinkedIn** (linkedin.com)
- **Indeed** (indeed.com) 
- **Glassdoor** (glassdoor.com)
- **Monster** (monster.com)
- **ZipRecruiter** (ziprecruiter.com)
- **Dice** (dice.com)
- **SimplyHired** (simplyhired.com)
- **CareerBuilder** (careerbuilder.com)

*The extension also works on other job sites using generic content extraction.*

## Prerequisites

1. **Job Tracker Application** must be running on `http://localhost:3000`
2. **Chrome Browser** (version 88+ for Manifest V3 support)
3. **Developer Mode** enabled in Chrome Extensions

## Installation Instructions

### Step 1: Enable Developer Mode
1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle on **Developer mode** in the top-right corner

### Step 2: Load the Extension
1. Click **Load unpacked** button
2. Navigate to your Job Tracker project directory
3. Select the `extension/` folder
4. Click **Select Folder**

### Step 3: Verify Installation
1. The Job Tracker extension should appear in your extensions list
2. You should see the Job Tracker icon in your Chrome toolbar
3. Click the icon to test the popup interface

### Step 4: Create Extension Icons (Optional)
The extension currently uses placeholder icons. To create proper icons:

1. Use the provided `icons/icon.svg` as a template
2. Create PNG versions at these sizes:
   - `icon16.png` (16x16)
   - `icon32.png` (32x32) 
   - `icon48.png` (48x48)
   - `icon128.png` (128x128)
3. Place them in the `extension/icons/` directory
4. Reload the extension to see the new icons

## How to Use

### Basic Usage
1. **Start Job Tracker Application**: Run `npm run dev` in your Job Tracker project
2. **Navigate to a job posting** on any supported job site
3. **Click the extension icon** in Chrome toolbar
4. **Review the detected job** information in the popup
5. **Click "Capture Job"** to send it to Job Tracker
6. **Wait for confirmation** - the job will be processed with AI automatically

### Detailed Workflow
1. **Job Detection**: The extension automatically detects when you're on a job posting page
2. **Content Extraction**: Extracts job title, URL, and full job description
3. **Preview**: Shows you what content will be captured
4. **Capture**: Sends data to your local Job Tracker API
5. **AI Processing**: Job Tracker automatically processes the job with AI
6. **Results**: Check your Job Tracker dashboard for customized resume and cover letter

### Troubleshooting

#### "No job posting detected"
- Refresh the page and try again
- Click "Refresh Detection" in the popup
- The page might not be recognized as a job posting
- Try using "Capture Job" anyway - it may still work

#### "Cannot connect to Job Tracker"  
- Ensure Job Tracker is running on `http://localhost:3000`
- Check that the development server is active
- Verify no firewall is blocking localhost connections

#### "Capture failed"
- Check the browser console for error details
- Verify the Job Tracker API is responding
- Try refreshing both the page and extension

## Development & Customization

### File Structure
```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface  
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── content.js            # Job extraction logic
├── background.js         # Extension lifecycle management
├── icons/                # Extension icons
└── README.md            # This documentation
```

### Adding New Job Sites
To add support for a new job site, edit `content.js`:

```javascript
const JOB_SITES = {
  'newjobsite.com': {
    selectors: [
      '.job-description',      // CSS selectors for job description
      '#job-content'
    ],
    titleSelectors: [
      '.job-title',           // CSS selectors for job title
      'h1.title'
    ]
  }
}
```

### Customizing the Interface
- Edit `popup.html` for structure changes
- Modify `popup.css` for styling updates  
- Update `popup.js` for functionality changes

### API Configuration
The extension connects to:
- **API Endpoint**: `http://localhost:3000/api/extension`
- **Dashboard**: `http://localhost:3000`

To change these URLs, edit the variables in `popup.js` and `background.js`.

## Security Considerations

- Extension only connects to `localhost:3000` (your local development server)
- No external API calls or data transmission to third parties
- Job data is only sent to your local Job Tracker application
- Extension permissions are minimal (only `activeTab` and `storage`)

## Version History

### v1.0.0 (Current)
- Initial release with core functionality
- Support for 8 major job sites
- AI processing integration
- Professional popup interface
- Comprehensive error handling

## Support

### Common Issues
- **Extension not loading**: Check that Developer Mode is enabled
- **Icons not showing**: Create PNG icons or ignore for functionality testing
- **API connection issues**: Verify Job Tracker is running on port 3000

### Getting Help
1. Check the browser console for error messages
2. Verify Job Tracker application is running
3. Test the API endpoint directly: `http://localhost:3000/api/extension`

## Contributing

To improve the extension:
1. Test on additional job sites and add configurations
2. Enhance the content extraction logic
3. Improve error handling and user feedback
4. Add more sophisticated job posting detection

---

**Note**: This extension is designed for local development use with the Job Tracker application. It is not intended for Chrome Web Store distribution without additional security and privacy considerations.