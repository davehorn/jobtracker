import { 
  StructuredResume, 
  ResumeContact, 
  ResumeExperience, 
  ResumeEducation, 
  ResumeProject, 
  ResumeSkill, 
  ResumeFormat,
  ResumeData 
} from './types'

// Validation functions for structured resume
export function validateResumeContact(contact: any): contact is ResumeContact {
  return (
    typeof contact === 'object' &&
    contact !== null &&
    typeof contact.name === 'string' &&
    typeof contact.email === 'string' &&
    contact.email.includes('@') &&
    (contact.phone === undefined || typeof contact.phone === 'string') &&
    (contact.location === undefined || typeof contact.location === 'string') &&
    (contact.linkedin === undefined || typeof contact.linkedin === 'string') &&
    (contact.github === undefined || typeof contact.github === 'string') &&
    (contact.website === undefined || typeof contact.website === 'string')
  )
}

export function validateResumeExperience(experience: any): experience is ResumeExperience {
  return (
    typeof experience === 'object' &&
    experience !== null &&
    typeof experience.company === 'string' &&
    typeof experience.position === 'string' &&
    typeof experience.startDate === 'string' &&
    (experience.endDate === undefined || typeof experience.endDate === 'string') &&
    (experience.location === undefined || typeof experience.location === 'string') &&
    Array.isArray(experience.description) &&
    experience.description.every((desc: any) => typeof desc === 'string') &&
    (experience.technologies === undefined || 
     (Array.isArray(experience.technologies) && 
      experience.technologies.every((tech: any) => typeof tech === 'string')))
  )
}

export function validateResumeEducation(education: any): education is ResumeEducation {
  return (
    typeof education === 'object' &&
    education !== null &&
    typeof education.institution === 'string' &&
    typeof education.degree === 'string' &&
    (education.field === undefined || typeof education.field === 'string') &&
    (education.graduationDate === undefined || typeof education.graduationDate === 'string') &&
    (education.location === undefined || typeof education.location === 'string') &&
    (education.gpa === undefined || typeof education.gpa === 'string') &&
    (education.honors === undefined || 
     (Array.isArray(education.honors) && 
      education.honors.every((honor: any) => typeof honor === 'string')))
  )
}

export function validateResumeProject(project: any): project is ResumeProject {
  return (
    typeof project === 'object' &&
    project !== null &&
    typeof project.name === 'string' &&
    typeof project.description === 'string' &&
    (project.technologies === undefined || 
     (Array.isArray(project.technologies) && 
      project.technologies.every((tech: any) => typeof tech === 'string'))) &&
    (project.url === undefined || typeof project.url === 'string') &&
    (project.startDate === undefined || typeof project.startDate === 'string') &&
    (project.endDate === undefined || typeof project.endDate === 'string')
  )
}

export function validateResumeSkill(skill: any): skill is ResumeSkill {
  return (
    typeof skill === 'object' &&
    skill !== null &&
    typeof skill.category === 'string' &&
    Array.isArray(skill.items) &&
    skill.items.every((item: any) => typeof item === 'string')
  )
}

export function validateStructuredResume(resume: any): resume is StructuredResume {
  return (
    typeof resume === 'object' &&
    resume !== null &&
    validateResumeContact(resume.contact) &&
    (resume.summary === undefined || typeof resume.summary === 'string') &&
    Array.isArray(resume.experience) &&
    resume.experience.every((exp: any) => validateResumeExperience(exp)) &&
    Array.isArray(resume.education) &&
    resume.education.every((edu: any) => validateResumeEducation(edu)) &&
    Array.isArray(resume.skills) &&
    resume.skills.every((skill: any) => validateResumeSkill(skill)) &&
    (resume.projects === undefined || 
     (Array.isArray(resume.projects) && 
      resume.projects.every((proj: any) => validateResumeProject(proj)))) &&
    (resume.certifications === undefined || 
     (Array.isArray(resume.certifications) && 
      resume.certifications.every((cert: any) => typeof cert === 'string'))) &&
    (resume.awards === undefined || 
     (Array.isArray(resume.awards) && 
      resume.awards.every((award: any) => typeof award === 'string')))
  )
}

// Utility functions for working with resume data
export function parseResumeData(content: string, format: ResumeFormat): ResumeData {
  return {
    format,
    content: format === 'structured' ? JSON.parse(content) : content
  }
}

export function serializeResumeData(data: ResumeData): string {
  return data.format === 'structured' 
    ? JSON.stringify(data.content, null, 2)
    : data.content as string
}

export function getResumeText(data: ResumeData): string {
  if (data.format === 'text') {
    return data.content as string
  }
  
  // Convert structured resume to text representation
  const resume = data.content as StructuredResume
  let text = ''
  
  // Contact information
  text += `${resume.contact.name}\n`
  text += `${resume.contact.email}`
  if (resume.contact.phone) text += ` | ${resume.contact.phone}`
  if (resume.contact.location) text += ` | ${resume.contact.location}`
  if (resume.contact.linkedin) text += `\nLinkedIn: ${resume.contact.linkedin}`
  if (resume.contact.github) text += `\nGitHub: ${resume.contact.github}`
  if (resume.contact.website) text += `\nWebsite: ${resume.contact.website}`
  text += '\n\n'
  
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
      if (edu.honors && edu.honors.length > 0) {
        text += `Honors: ${edu.honors.join(', ')}\n`
      }
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
    resume.projects.forEach(proj => {
      text += `${proj.name}\n`
      text += `${proj.description}\n`
      if (proj.technologies && proj.technologies.length > 0) {
        text += `Technologies: ${proj.technologies.join(', ')}\n`
      }
      if (proj.url) text += `URL: ${proj.url}\n`
      if (proj.startDate || proj.endDate) {
        text += `${proj.startDate || ''}${proj.endDate ? ` - ${proj.endDate}` : ''}\n`
      }
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

// Create a structured resume from text (basic parsing)
export function createStructuredResumeFromText(text: string): StructuredResume {
  // This is a basic implementation - in a real scenario, you might want more sophisticated parsing
  const lines = text.split('\n').filter(line => line.trim())
  
  // Extract basic contact info (first few lines typically)
  const contact: ResumeContact = {
    name: lines[0] || 'Name',
    email: 'email@example.com' // Would need better parsing
  }
  
  return {
    contact,
    summary: 'Please update this summary',
    experience: [],
    education: [],
    skills: [{ category: 'Technical Skills', items: [] }],
    projects: [],
    certifications: [],
    awards: []
  }
}