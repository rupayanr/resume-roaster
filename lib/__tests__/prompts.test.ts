import { describe, it, expect } from 'vitest'
import { getRoastPrompt, INTENSITY_MODIFIERS, INDUSTRY_PERSONAS } from '../prompts'

describe('prompts', () => {
  describe('INTENSITY_MODIFIERS', () => {
    it('contains mild, medium, and brutal keys', () => {
      expect(INTENSITY_MODIFIERS).toHaveProperty('mild')
      expect(INTENSITY_MODIFIERS).toHaveProperty('medium')
      expect(INTENSITY_MODIFIERS).toHaveProperty('brutal')
    })

    it('mild modifier contains encouraging language', () => {
      expect(INTENSITY_MODIFIERS.mild).toContain('encouraging')
      expect(INTENSITY_MODIFIERS.mild).toContain('supportive')
      expect(INTENSITY_MODIFIERS.mild).toContain('opportunities')
    })

    it('medium modifier contains balanced language', () => {
      expect(INTENSITY_MODIFIERS.medium).toContain('witty')
      expect(INTENSITY_MODIFIERS.medium).toContain('direct')
      expect(INTENSITY_MODIFIERS.medium).toContain('professional')
    })

    it('brutal modifier contains harsh language', () => {
      expect(INTENSITY_MODIFIERS.brutal).toContain('nothing back')
      expect(INTENSITY_MODIFIERS.brutal).toContain('savagely')
      expect(INTENSITY_MODIFIERS.brutal).toContain('biting')
    })
  })

  describe('INDUSTRY_PERSONAS', () => {
    it('contains all expected industries', () => {
      expect(INDUSTRY_PERSONAS).toHaveProperty('tech')
      expect(INDUSTRY_PERSONAS).toHaveProperty('finance')
      expect(INDUSTRY_PERSONAS).toHaveProperty('creative')
      expect(INDUSTRY_PERSONAS).toHaveProperty('healthcare')
      expect(INDUSTRY_PERSONAS).toHaveProperty('general')
    })

    it('each persona has name and voice properties', () => {
      Object.values(INDUSTRY_PERSONAS).forEach(persona => {
        expect(persona).toHaveProperty('name')
        expect(persona).toHaveProperty('voice')
        expect(typeof persona.name).toBe('string')
        expect(typeof persona.voice).toBe('string')
      })
    })

    it('tech persona has VC personality', () => {
      expect(INDUSTRY_PERSONAS.tech.name).toContain('VC')
      expect(INDUSTRY_PERSONAS.tech.voice).toContain('startup')
    })

    it('finance persona has analyst personality', () => {
      expect(INDUSTRY_PERSONAS.finance.name).toContain('Analyst')
      expect(INDUSTRY_PERSONAS.finance.voice).toContain('ROI')
    })

    it('creative persona has art director personality', () => {
      expect(INDUSTRY_PERSONAS.creative.name).toContain('Art Director')
      expect(INDUSTRY_PERSONAS.creative.voice).toContain('design')
    })

    it('healthcare persona has doctor personality', () => {
      expect(INDUSTRY_PERSONAS.healthcare.name).toContain('Dr.')
      expect(INDUSTRY_PERSONAS.healthcare.voice).toContain('medical')
    })

    it('general persona has career coach personality', () => {
      expect(INDUSTRY_PERSONAS.general.name).toContain('Career Coach')
    })
  })

  describe('getRoastPrompt', () => {
    const sampleResume = `
      John Doe
      john@example.com
      Software Engineer with 5 years of experience
      Skills: JavaScript, Python, React
    `

    it('generates a prompt string', () => {
      const prompt = getRoastPrompt(sampleResume)
      expect(typeof prompt).toBe('string')
      expect(prompt.length).toBeGreaterThan(0)
    })

    it('includes the resume text in the prompt', () => {
      const prompt = getRoastPrompt(sampleResume)
      expect(prompt).toContain('John Doe')
      expect(prompt).toContain('john@example.com')
      expect(prompt).toContain('Software Engineer')
    })

    it('includes JSON structure requirements', () => {
      const prompt = getRoastPrompt(sampleResume)
      expect(prompt).toContain('JSON')
      expect(prompt).toContain('"score"')
      expect(prompt).toContain('"headline"')
      expect(prompt).toContain('"sections"')
      expect(prompt).toContain('"suggestions"')
    })

    it('includes scoring criteria', () => {
      const prompt = getRoastPrompt(sampleResume)
      expect(prompt).toContain('Clarity')
      expect(prompt).toContain('Impact')
      expect(prompt).toContain('Relevance')
      expect(prompt).toContain('ATS')
      expect(prompt).toContain('25%')
    })

    describe('intensity handling', () => {
      it('defaults to medium intensity', () => {
        const prompt = getRoastPrompt(sampleResume)
        expect(prompt).toContain('witty')
        expect(prompt).toContain('direct')
      })

      it('applies mild intensity', () => {
        const prompt = getRoastPrompt(sampleResume, 'mild')
        expect(prompt).toContain('encouraging')
        expect(prompt).toContain('supportive')
      })

      it('applies medium intensity', () => {
        const prompt = getRoastPrompt(sampleResume, 'medium')
        expect(prompt).toContain('witty')
        expect(prompt).toContain('direct')
      })

      it('applies brutal intensity', () => {
        const prompt = getRoastPrompt(sampleResume, 'brutal')
        expect(prompt).toContain('nothing back')
        expect(prompt).toContain('savagely')
      })

      it('falls back to medium for invalid intensity', () => {
        const prompt = getRoastPrompt(sampleResume, 'invalid')
        expect(prompt).toContain('witty')
        expect(prompt).toContain('direct')
      })
    })

    describe('industry handling', () => {
      it('defaults to general industry (no persona instruction)', () => {
        const prompt = getRoastPrompt(sampleResume)
        expect(prompt).not.toContain('PERSONA:')
      })

      it('explicitly setting general industry does not add persona', () => {
        const prompt = getRoastPrompt(sampleResume, 'medium', 'general')
        expect(prompt).not.toContain('PERSONA:')
      })

      it('applies tech industry persona', () => {
        const prompt = getRoastPrompt(sampleResume, 'medium', 'tech')
        expect(prompt).toContain('PERSONA:')
        expect(prompt).toContain('Silicon Valley VC')
        expect(prompt).toContain('startup')
      })

      it('applies finance industry persona', () => {
        const prompt = getRoastPrompt(sampleResume, 'medium', 'finance')
        expect(prompt).toContain('PERSONA:')
        expect(prompt).toContain('Wall Street Analyst')
        expect(prompt).toContain('ROI')
      })

      it('applies creative industry persona', () => {
        const prompt = getRoastPrompt(sampleResume, 'medium', 'creative')
        expect(prompt).toContain('PERSONA:')
        expect(prompt).toContain('Art Director')
        expect(prompt).toContain('design')
      })

      it('applies healthcare industry persona', () => {
        const prompt = getRoastPrompt(sampleResume, 'medium', 'healthcare')
        expect(prompt).toContain('PERSONA:')
        expect(prompt).toContain('Dr. Resume')
        expect(prompt).toContain('medical')
      })

      it('falls back to general persona content for invalid industry', () => {
        // When invalid industry is passed, it uses general persona content
        // but still adds PERSONA instruction since industry !== 'general'
        const prompt = getRoastPrompt(sampleResume, 'medium', 'invalid')
        // Should contain general persona's name
        expect(prompt).toContain('Career Coach')
      })
    })

    describe('intensity and industry combinations', () => {
      it('combines mild intensity with tech industry', () => {
        const prompt = getRoastPrompt(sampleResume, 'mild', 'tech')
        expect(prompt).toContain('encouraging')
        expect(prompt).toContain('Silicon Valley VC')
      })

      it('combines brutal intensity with finance industry', () => {
        const prompt = getRoastPrompt(sampleResume, 'brutal', 'finance')
        expect(prompt).toContain('savagely')
        expect(prompt).toContain('Wall Street Analyst')
      })

      it('combines medium intensity with healthcare industry', () => {
        const prompt = getRoastPrompt(sampleResume, 'medium', 'healthcare')
        expect(prompt).toContain('witty')
        expect(prompt).toContain('Dr. Resume')
      })
    })

    describe('prompt structure', () => {
      it('includes "The Good" section template', () => {
        const prompt = getRoastPrompt(sampleResume)
        expect(prompt).toContain('The Good')
      })

      it('includes "The Bad" section template', () => {
        const prompt = getRoastPrompt(sampleResume)
        expect(prompt).toContain('The Bad')
      })

      it('includes "The Fixable" section template', () => {
        const prompt = getRoastPrompt(sampleResume)
        expect(prompt).toContain('The Fixable')
      })

      it('includes ats_tips in expected output', () => {
        const prompt = getRoastPrompt(sampleResume)
        expect(prompt).toContain('ats_tips')
      })

      it('includes score_breakdown in expected output', () => {
        const prompt = getRoastPrompt(sampleResume)
        expect(prompt).toContain('score_breakdown')
        expect(prompt).toContain('clarity')
        expect(prompt).toContain('impact')
        expect(prompt).toContain('relevance')
        expect(prompt).toContain('ats')
      })
    })

    describe('quality guidelines', () => {
      it('includes writing quality guidelines', () => {
        const prompt = getRoastPrompt(sampleResume)
        expect(prompt).toContain('WRITING QUALITY GUIDELINES')
      })

      it('includes example format for suggestions', () => {
        const prompt = getRoastPrompt(sampleResume)
        expect(prompt).toContain('original')
        expect(prompt).toContain('improved')
        expect(prompt).toContain('why')
      })

      it('includes important rules about quoting', () => {
        const prompt = getRoastPrompt(sampleResume)
        expect(prompt).toContain('QUOTE exact phrases')
        expect(prompt).toContain('EXACT quotes')
      })
    })
  })
})
