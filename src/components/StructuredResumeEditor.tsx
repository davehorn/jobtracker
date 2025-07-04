'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, Save, X } from 'lucide-react'
import { StructuredResume, ResumeContact, ResumeExperience, ResumeEducation, ResumeSkill } from '@/lib/types'
import { validateStructuredResume } from '@/lib/resume-utils'

interface StructuredResumeEditorProps {
  initialData: string
  onSave: (resumeData: string) => void
  onCancel: () => void
  loading?: boolean
}

export default function StructuredResumeEditor({ 
  initialData, 
  onSave, 
  onCancel, 
  loading = false 
}: StructuredResumeEditorProps) {
  const [formData, setFormData] = useState<StructuredResume>({
    contact: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    awards: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    console.log('[DEBUG] 🏗️  StructuredResumeEditor component initializing')
    console.log('[DEBUG] Initial data length:', initialData?.length || 0)
    
    try {
      const parsed = JSON.parse(initialData)
      console.log('[DEBUG] ✅ StructuredResumeEditor JSON parsed successfully')
      console.log('[DEBUG] Keys found:', Object.keys(parsed))
      
      const isValid = validateStructuredResume(parsed)
      console.log('[DEBUG] Schema validation result:', isValid)
      
      if (isValid) {
        console.log('[DEBUG] ✅ Setting form data from valid structured resume')
        setFormData(parsed)
      } else {
        console.log('[DEBUG] ❌ Schema validation failed, using default form data')
      }
    } catch (error) {
      console.error('[DEBUG] ❌ JSON parsing failed in StructuredResumeEditor:', error)
    }
  }, [initialData])

  const handleContactChange = (field: keyof ResumeContact, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }))
  }

  const handleSummaryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      summary: value
    }))
  }

  const addExperience = () => {
    const newExperience: ResumeExperience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      location: '',
      description: [''],
      technologies: []
    }
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }))
  }

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const updateExperience = (index: number, field: keyof ResumeExperience, value: any) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const addExperienceDescription = (expIndex: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? { ...exp, description: [...exp.description, ''] } : exp
      )
    }))
  }

  const removeExperienceDescription = (expIndex: number, descIndex: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? { ...exp, description: exp.description.filter((_, j) => j !== descIndex) } : exp
      )
    }))
  }

  const updateExperienceDescription = (expIndex: number, descIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? { 
          ...exp, 
          description: exp.description.map((desc, j) => j === descIndex ? value : desc)
        } : exp
      )
    }))
  }

  const addExperienceTechnology = (expIndex: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? { ...exp, technologies: [...(exp.technologies || []), ''] } : exp
      )
    }))
  }

  const removeExperienceTechnology = (expIndex: number, techIndex: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? { 
          ...exp, 
          technologies: (exp.technologies || []).filter((_, j) => j !== techIndex)
        } : exp
      )
    }))
  }

  const updateExperienceTechnology = (expIndex: number, techIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? { 
          ...exp, 
          technologies: (exp.technologies || []).map((tech, j) => j === techIndex ? value : tech)
        } : exp
      )
    }))
  }

  const addEducation = () => {
    const newEducation: ResumeEducation = {
      institution: '',
      degree: '',
      field: '',
      graduationDate: '',
      location: '',
      gpa: '',
      honors: []
    }
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }))
  }

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const updateEducation = (index: number, field: keyof ResumeEducation, value: any) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const addEducationHonor = (eduIndex: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === eduIndex ? { ...edu, honors: [...(edu.honors || []), ''] } : edu
      )
    }))
  }

  const removeEducationHonor = (eduIndex: number, honorIndex: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === eduIndex ? { 
          ...edu, 
          honors: (edu.honors || []).filter((_, j) => j !== honorIndex)
        } : edu
      )
    }))
  }

  const updateEducationHonor = (eduIndex: number, honorIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === eduIndex ? { 
          ...edu, 
          honors: (edu.honors || []).map((honor, j) => j === honorIndex ? value : honor)
        } : edu
      )
    }))
  }

  const addSkillCategory = () => {
    const newSkill: ResumeSkill = {
      category: '',
      items: ['']
    }
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }))
  }

  const removeSkillCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const updateSkillCategory = (index: number, field: keyof ResumeSkill, value: any) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }))
  }

  const addSkillItem = (skillIndex: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === skillIndex ? { ...skill, items: [...skill.items, ''] } : skill
      )
    }))
  }

  const removeSkillItem = (skillIndex: number, itemIndex: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === skillIndex ? { 
          ...skill, 
          items: skill.items.filter((_, j) => j !== itemIndex)
        } : skill
      )
    }))
  }

  const updateSkillItem = (skillIndex: number, itemIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === skillIndex ? { 
          ...skill, 
          items: skill.items.map((item, j) => j === itemIndex ? value : item)
        } : skill
      )
    }))
  }

  const handleSave = () => {
    // Validate form data
    const newErrors: Record<string, string> = {}
    
    if (!formData.contact.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.contact.email.trim()) {
      newErrors.email = 'Email is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        const jsonString = JSON.stringify(formData, null, 2)
        onSave(jsonString)
      } catch (error) {
        console.error('Error serializing form data:', error)
      }
    }
  }

  console.log('[DEBUG] 🎨 StructuredResumeEditor rendering')
  console.log('[DEBUG] Form data name:', formData.contact?.name || 'NO NAME SET')
  console.log('[DEBUG] Form data email:', formData.contact?.email || 'NO EMAIL SET')
  
  return (
    <div className="space-y-6 max-h-screen overflow-y-auto border-2 border-green-300 bg-green-25 p-4 rounded-lg">
      <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm">
        🟢 <strong>StructuredResumeEditor Component Loaded Successfully</strong>
        <br />Contact Name: {formData.contact?.name || 'Not set'}
        <br />Contact Email: {formData.contact?.email || 'Not set'}
      </div>
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="resume-name"
              name="name"
              value={formData.contact.name}
              onChange={(e) => handleContactChange('name', e.target.value)}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Your full name"
              autoComplete="name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="resume-email"
              name="email"
              value={formData.contact.email}
              onChange={(e) => handleContactChange('email', e.target.value)}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="your.email@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="resume-phone"
              name="phone"
              value={formData.contact.phone || ''}
              onChange={(e) => handleContactChange('phone', e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              placeholder="(555) 123-4567"
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="resume-location"
              name="location"
              value={formData.contact.location || ''}
              onChange={(e) => handleContactChange('location', e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              placeholder="City, State"
              autoComplete="address-level1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              id="resume-linkedin"
              name="linkedin"
              value={formData.contact.linkedin || ''}
              onChange={(e) => handleContactChange('linkedin', e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              placeholder="https://linkedin.com/in/yourprofile"
              autoComplete="url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub
            </label>
            <input
              type="url"
              id="resume-github"
              name="github"
              value={formData.contact.github || ''}
              onChange={(e) => handleContactChange('github', e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              placeholder="https://github.com/yourusername"
              autoComplete="url"
            />
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Professional Summary</h3>
        <textarea
          id="resume-summary"
          name="summary"
          value={formData.summary || ''}
          onChange={(e) => handleSummaryChange(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
          rows={4}
          placeholder="Write a brief professional summary highlighting your key qualifications and career objectives..."
        />
      </div>

      {/* Experience Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
          <button
            type="button"
            onClick={addExperience}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Add Experience</span>
          </button>
        </div>
        
        {formData.experience.map((exp, expIndex) => (
          <div key={expIndex} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Experience {expIndex + 1}</h4>
              <button
                type="button"
                onClick={() => removeExperience(expIndex)}
                className="flex items-center space-x-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
              >
                <Minus className="h-3 w-3" />
                <span>Remove</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(expIndex, 'position', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Job title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="text"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(expIndex, 'startDate', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="e.g., January 2020"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="text"
                  value={exp.endDate || ''}
                  onChange={(e) => updateExperience(expIndex, 'endDate', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="e.g., Present or December 2022"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={exp.location || ''}
                  onChange={(e) => updateExperience(expIndex, 'location', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="City, State"
                />
              </div>
            </div>
            
            {/* Description bullets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Key Achievements</label>
                <button
                  type="button"
                  onClick={() => addExperienceDescription(expIndex)}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Point</span>
                </button>
              </div>
              {exp.description.map((desc, descIndex) => (
                <div key={descIndex} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => updateExperienceDescription(expIndex, descIndex, e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="Describe a key achievement or responsibility"
                  />
                  {exp.description.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperienceDescription(expIndex, descIndex)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Technologies */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Technologies Used</label>
                <button
                  type="button"
                  onClick={() => addExperienceTechnology(expIndex)}
                  className="flex items-center space-x-1 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Technology</span>
                </button>
              </div>
              {(exp.technologies || []).map((tech, techIndex) => (
                <div key={techIndex} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={tech}
                    onChange={(e) => updateExperienceTechnology(expIndex, techIndex, e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="e.g., React, Node.js, PostgreSQL, AWS"
                  />
                  <button
                    type="button"
                    onClick={() => removeExperienceTechnology(expIndex, techIndex)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(!exp.technologies || exp.technologies.length === 0) && (
                <p className="text-xs text-gray-500 italic">No technologies added yet. Click "Add Technology" to include tools and technologies used.</p>
              )}
            </div>
          </div>
        ))}
        
        {formData.experience.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm">No work experience added yet.</p>
            <p className="text-xs mt-1">Click "Add Experience" to get started.</p>
          </div>
        )}
      </div>

      {/* Education Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Education</h3>
          <button
            type="button"
            onClick={addEducation}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Add Education</span>
          </button>
        </div>
        
        {formData.education.map((edu, eduIndex) => (
          <div key={eduIndex} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Education {eduIndex + 1}</h4>
              <button
                type="button"
                onClick={() => removeEducation(eduIndex)}
                className="flex items-center space-x-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
              >
                <Minus className="h-3 w-3" />
                <span>Remove</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(eduIndex, 'institution', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="University or school name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(eduIndex, 'degree', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="e.g., Bachelor of Science"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                <input
                  type="text"
                  value={edu.field || ''}
                  onChange={(e) => updateEducation(eduIndex, 'field', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="e.g., Computer Science"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
                <input
                  type="text"
                  value={edu.graduationDate || ''}
                  onChange={(e) => updateEducation(eduIndex, 'graduationDate', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="e.g., May 2020"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={edu.location || ''}
                  onChange={(e) => updateEducation(eduIndex, 'location', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="City, State"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                <input
                  type="text"
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducation(eduIndex, 'gpa', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="e.g., 3.8/4.0"
                />
              </div>
            </div>
            
            {/* Honors */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Honors & Awards</label>
                <button
                  type="button"
                  onClick={() => addEducationHonor(eduIndex)}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Honor</span>
                </button>
              </div>
              {(edu.honors || []).map((honor, honorIndex) => (
                <div key={honorIndex} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={honor}
                    onChange={(e) => updateEducationHonor(eduIndex, honorIndex, e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="e.g., Dean's List, Magna Cum Laude"
                  />
                  <button
                    type="button"
                    onClick={() => removeEducationHonor(eduIndex, honorIndex)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(!edu.honors || edu.honors.length === 0) && (
                <p className="text-xs text-gray-500 italic">No honors added yet. Click "Add Honor" to include academic achievements.</p>
              )}
            </div>
          </div>
        ))}
        
        {formData.education.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm">No education added yet.</p>
            <p className="text-xs mt-1">Click "Add Education" to get started.</p>
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
          <button
            type="button"
            onClick={addSkillCategory}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
        
        {formData.skills.map((skill, skillIndex) => (
          <div key={skillIndex} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Skill Category {skillIndex + 1}</h4>
              <button
                type="button"
                onClick={() => removeSkillCategory(skillIndex)}
                className="flex items-center space-x-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
              >
                <Minus className="h-3 w-3" />
                <span>Remove</span>
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
              <input
                type="text"
                value={skill.category}
                onChange={(e) => updateSkillCategory(skillIndex, 'category', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="e.g., Programming Languages, Tools, Frameworks"
              />
            </div>
            
            {/* Skills within category */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Skills in this Category</label>
                <button
                  type="button"
                  onClick={() => addSkillItem(skillIndex)}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Skill</span>
                </button>
              </div>
              {skill.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateSkillItem(skillIndex, itemIndex, e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="e.g., JavaScript, Python, React"
                  />
                  {skill.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkillItem(skillIndex, itemIndex)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {formData.skills.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm">No skill categories added yet.</p>
            <p className="text-xs mt-1">Click "Add Category" to organize your skills.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving...' : 'Save Resume'}</span>
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  )
}