import { StructuredResume } from './types'

// Resume template system for consistent formatting
export interface ResumeTemplate {
  name: string
  description: string
  generateHTML: (resume: StructuredResume) => string
  generatePlainText: (resume: StructuredResume) => string
}

// Professional template
export const professionalTemplate: ResumeTemplate = {
  name: 'Professional',
  description: 'Clean, professional format suitable for most industries',
  
  generateHTML: (resume: StructuredResume) => {
    return `
      <div class="resume-professional">
        <header class="resume-header">
          <h1>${resume.contact.name}</h1>
          <div class="contact-info">
            ${resume.contact.email}
            ${resume.contact.phone ? ` | ${resume.contact.phone}` : ''}
            ${resume.contact.location ? ` | ${resume.contact.location}` : ''}
          </div>
          ${resume.contact.linkedin || resume.contact.github || resume.contact.website ? 
            `<div class="links">
              ${resume.contact.linkedin ? `<a href="${resume.contact.linkedin}">LinkedIn</a>` : ''}
              ${resume.contact.github ? `<a href="${resume.contact.github}">GitHub</a>` : ''}
              ${resume.contact.website ? `<a href="${resume.contact.website}">Website</a>` : ''}
            </div>` : ''}
        </header>
        
        ${resume.summary ? `
          <section class="summary">
            <h2>Summary</h2>
            <p>${resume.summary}</p>
          </section>
        ` : ''}
        
        ${resume.experience.length > 0 ? `
          <section class="experience">
            <h2>Experience</h2>
            ${resume.experience.map(exp => `
              <div class="job">
                <div class="job-header">
                  <h3>${exp.position}</h3>
                  <span class="company">${exp.company}</span>
                  ${exp.location ? `<span class="location">${exp.location}</span>` : ''}
                </div>
                <div class="dates">${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}</div>
                <ul class="achievements">
                  ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                </ul>
                ${exp.technologies && exp.technologies.length > 0 ? 
                  `<div class="technologies">Technologies: ${exp.technologies.join(', ')}</div>` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}
        
        ${resume.education.length > 0 ? `
          <section class="education">
            <h2>Education</h2>
            ${resume.education.map(edu => `
              <div class="degree">
                <h3>${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</h3>
                <div class="school">${edu.institution}${edu.location ? ` (${edu.location})` : ''}</div>
                ${edu.graduationDate ? `<div class="date">${edu.graduationDate}</div>` : ''}
                ${edu.gpa ? `<div class="gpa">GPA: ${edu.gpa}</div>` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}
        
        ${resume.skills.length > 0 ? `
          <section class="skills">
            <h2>Skills</h2>
            ${resume.skills.map(skill => `
              <div class="skill-category">
                <strong>${skill.category}:</strong> ${skill.items.join(', ')}
              </div>
            `).join('')}
          </section>
        ` : ''}
        
        ${resume.projects && resume.projects.length > 0 ? `
          <section class="projects">
            <h2>Projects</h2>
            ${resume.projects.map(project => `
              <div class="project">
                <h3>${project.name}</h3>
                ${project.description ? `<p>${project.description}</p>` : ''}
                ${project.technologies && project.technologies.length > 0 ? 
                  `<div class="technologies">Technologies: ${project.technologies.join(', ')}</div>` : ''}
                ${project.url ? `<div class="project-url"><a href="${project.url}">${project.url}</a></div>` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}
        
        ${resume.certifications && resume.certifications.length > 0 ? `
          <section class="certifications">
            <h2>Certifications</h2>
            <ul>
              ${resume.certifications.map(cert => `<li>${cert}</li>`).join('')}
            </ul>
          </section>
        ` : ''}
        
        ${resume.awards && resume.awards.length > 0 ? `
          <section class="awards">
            <h2>Awards</h2>
            <ul>
              ${resume.awards.map(award => `<li>${award}</li>`).join('')}
            </ul>
          </section>
        ` : ''}
      </div>
    `
  },
  
  generatePlainText: (resume: StructuredResume) => {
    let text = ''
    
    // Header
    text += `${resume.contact.name}\n`
    text += `${resume.contact.email}`
    if (resume.contact.phone) text += ` | ${resume.contact.phone}`
    if (resume.contact.location) text += ` | ${resume.contact.location}`
    text += '\n'
    
    if (resume.contact.linkedin) text += `LinkedIn: ${resume.contact.linkedin}\n`
    if (resume.contact.github) text += `GitHub: ${resume.contact.github}\n`
    if (resume.contact.website) text += `Website: ${resume.contact.website}\n`
    text += '\n'
    
    // Summary
    if (resume.summary) {
      text += 'SUMMARY\n'
      text += `${resume.summary}\n\n`
    }
    
    // Experience
    if (resume.experience.length > 0) {
      text += 'EXPERIENCE\n'
      resume.experience.forEach(exp => {
        text += `${exp.position} - ${exp.company}`
        if (exp.location) text += ` (${exp.location})`
        text += '\n'
        text += `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}\n`
        exp.description.forEach(desc => {
          text += `• ${desc}\n`
        })
        if (exp.technologies && exp.technologies.length > 0) {
          text += `Technologies: ${exp.technologies.join(', ')}\n`
        }
        text += '\n'
      })
    }
    
    // Education
    if (resume.education.length > 0) {
      text += 'EDUCATION\n'
      resume.education.forEach(edu => {
        text += `${edu.degree}`
        if (edu.field) text += ` in ${edu.field}`
        text += ` - ${edu.institution}`
        if (edu.location) text += ` (${edu.location})`
        text += '\n'
        if (edu.graduationDate) text += `${edu.graduationDate}\n`
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`
        text += '\n'
      })
    }
    
    // Skills
    if (resume.skills.length > 0) {
      text += 'SKILLS\n'
      resume.skills.forEach(skill => {
        text += `${skill.category}: ${skill.items.join(', ')}\n`
      })
      text += '\n'
    }
    
    // Projects
    if (resume.projects && resume.projects.length > 0) {
      text += 'PROJECTS\n'
      resume.projects.forEach(project => {
        text += `${project.name}\n`
        if (project.description) text += `${project.description}\n`
        if (project.technologies && project.technologies.length > 0) {
          text += `Technologies: ${project.technologies.join(', ')}\n`
        }
        if (project.url) text += `${project.url}\n`
        text += '\n'
      })
    }
    
    // Certifications
    if (resume.certifications && resume.certifications.length > 0) {
      text += 'CERTIFICATIONS\n'
      resume.certifications.forEach(cert => {
        text += `• ${cert}\n`
      })
      text += '\n'
    }
    
    // Awards
    if (resume.awards && resume.awards.length > 0) {
      text += 'AWARDS\n'
      resume.awards.forEach(award => {
        text += `• ${award}\n`
      })
    }
    
    return text.trim()
  }
}

export const availableTemplates = [professionalTemplate]