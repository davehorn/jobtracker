## This file is only meant  to describe my initial prompt to get started on this project.

I am creating an application that is going to help me modify my resume and make a custom resume based upon a given job description.  The custom resume MUST ALWAYS start with my source resume.  Then, based upon the job description, the application will propose changes to a NEW resume that will make sure to highlight specific skills and experience that are application to the job description.  The application will create an outline and only an outline for a cover letter to include with this resume.  It is important this is never a full cover letter but an outline of one such that I can fill in the cover letter with my own writting based upon the outline.

This application will have the following functionality at a high level.

1. A configuration section where I can see and save the folling things;  the source resume that would always be the source for any new resume proposals, a place to save the prompt that I will use for GenAI prompting where I will pass both my resume and the job description with this prompt (that I know I will need to ability to easily edit at runtime) and have the LLM return to me the following artifacts; new resume, cover letter outline, a description of the company.  I will need your help to determine if this should be one prompt for all of this or a prompt for each artifact.  If multiple prompts, I will want to be sure to have these multiple prompts in the configuration sections.  

2. The application will also allow me to then track the status of this job application.  Each job application will have these fields;
Creation Date: this is the date I passed in the job description and created this new job entry
Job Description URL: this is how I will pass in new job descriptions 
Job Description: sometimes job URLs get pulled down, so any job description I give you will also be copied into this app in case the URL becomes unavailable
Job Application Status: status will be one of 4 values;
Pending - The new job tracking item has been creating, but I have not applied to the job yet
Applied - I have applied for the job 
Closed - I have closed the job application
Rejected - I have explicitily rejected for the job
Job Info: this is information about the company that is retrieved via GenAI
Job Resume: this is the resume that was created by GenAI and reviewed and accepted and saved to use for this job application
Cover Letter Outline: This is the cover letter outline created by GenAI
Applied Date: the date I applied for the job when the job application was moved to the Applied status
Closed Date: this will be the date the job application was either put in Rejected or Closed Status

3. This application will also include a VERY SIMPLE chrome browser extension.  The extension will have a very easy way to pass into this application the URL of the job description.  This will be the process by which a job is added to this application.  And this will kick off the process in the application that will interact with GenAI to create all the required artifacts.

4. The application will have a simple dashboard, that allows me to see all the jobs I applied for and get access to all the data I described above.

So from a high level we have these core user actions in the application.
1. Configuration setup, admin, and maintenace 
2. The ability to add a new job to the application via the chrome extension, the user interact with the chrome extension, like a simple button click, that will send the URL to this application and start the process to create the artifacts
3. The ability to change the status on a job 

So, for starters, lets think hard about this, the first I want you to do is create some user stories for me that define the core functionality of this application.  I do not need small detailed user stores.  Consider the storied you create more like Epics.  I want to make sure you understand what I want to build.  Please just display the user stories for now.  If I like them I will ask you to save them.