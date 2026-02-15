"""Tests for the roast prompt generation with intensity and industry modifiers."""
import pytest

from app.prompts.roast_prompt import (
    get_roast_prompt,
    INTENSITY_MODIFIERS,
    INDUSTRY_PERSONAS,
)


class TestIntensityModifiers:
    def test_all_intensities_defined(self):
        """Verify all expected intensity levels are defined."""
        assert "mild" in INTENSITY_MODIFIERS
        assert "medium" in INTENSITY_MODIFIERS
        assert "brutal" in INTENSITY_MODIFIERS

    def test_mild_intensity_content(self):
        """Mild intensity should be encouraging."""
        modifier = INTENSITY_MODIFIERS["mild"]
        assert "encouraging" in modifier.lower()
        assert "supportive" in modifier.lower()

    def test_medium_intensity_content(self):
        """Medium intensity should be witty and balanced."""
        modifier = INTENSITY_MODIFIERS["medium"]
        assert "witty" in modifier.lower()
        assert "balanced" in modifier.lower() or "direct" in modifier.lower()

    def test_brutal_intensity_content(self):
        """Brutal intensity should be harsh."""
        modifier = INTENSITY_MODIFIERS["brutal"]
        assert "brutal" in modifier.lower() or "savage" in modifier.lower() or "nothing back" in modifier.lower()


class TestIndustryPersonas:
    def test_all_industries_defined(self):
        """Verify all expected industries are defined."""
        expected = ["tech", "finance", "creative", "healthcare", "general"]
        for industry in expected:
            assert industry in INDUSTRY_PERSONAS

    def test_tech_persona(self):
        """Tech persona should have startup/VC language."""
        persona = INDUSTRY_PERSONAS["tech"]
        assert "name" in persona
        assert "voice" in persona
        # Should mention VC or tech-related terms
        combined = f"{persona['name']} {persona['voice']}".lower()
        assert "vc" in combined or "tech" in combined or "startup" in combined

    def test_finance_persona(self):
        """Finance persona should have financial terms."""
        persona = INDUSTRY_PERSONAS["finance"]
        combined = f"{persona['name']} {persona['voice']}".lower()
        assert "roi" in combined or "financial" in combined or "analyst" in combined

    def test_creative_persona(self):
        """Creative persona should reference design."""
        persona = INDUSTRY_PERSONAS["creative"]
        combined = f"{persona['name']} {persona['voice']}".lower()
        assert "design" in combined or "creative" in combined or "art" in combined

    def test_healthcare_persona(self):
        """Healthcare persona should use medical language."""
        persona = INDUSTRY_PERSONAS["healthcare"]
        combined = f"{persona['name']} {persona['voice']}".lower()
        assert "medical" in combined or "doctor" in combined or "diagnos" in combined

    def test_general_persona(self):
        """General persona should be default balanced."""
        persona = INDUSTRY_PERSONAS["general"]
        combined = f"{persona['name']} {persona['voice']}".lower()
        assert "coach" in combined or "professional" in combined or "balanced" in combined


class TestPromptGeneration:
    def test_prompt_includes_resume_text(self):
        """Generated prompt should include the resume text."""
        resume_text = "John Doe - Software Engineer at Acme Corp"
        prompt = get_roast_prompt(resume_text)
        assert resume_text in prompt

    def test_prompt_includes_intensity_modifier(self):
        """Prompt should include intensity-specific instructions."""
        resume_text = "Test resume"

        mild_prompt = get_roast_prompt(resume_text, intensity="mild")
        assert "encouraging" in mild_prompt.lower()

        brutal_prompt = get_roast_prompt(resume_text, intensity="brutal")
        assert "brutal" in brutal_prompt.lower() or "nothing back" in brutal_prompt.lower()

    def test_prompt_includes_industry_persona(self):
        """Prompt should include industry persona when not general."""
        resume_text = "Test resume"

        tech_prompt = get_roast_prompt(resume_text, industry="tech")
        assert "Silicon Valley VC" in tech_prompt

        finance_prompt = get_roast_prompt(resume_text, industry="finance")
        assert "Wall Street" in finance_prompt

    def test_prompt_general_industry_no_persona(self):
        """General industry should not add persona instruction."""
        resume_text = "Test resume"
        prompt = get_roast_prompt(resume_text, industry="general")
        # Should not have persona header for general
        assert 'PERSONA: You are the "' not in prompt

    def test_prompt_includes_json_structure(self):
        """Prompt should include expected JSON structure."""
        prompt = get_roast_prompt("Test resume")
        assert '"score"' in prompt
        assert '"headline"' in prompt
        assert '"sections"' in prompt
        assert '"suggestions"' in prompt
        assert '"ats_tips"' in prompt

    def test_prompt_includes_scoring_criteria(self):
        """Prompt should include scoring criteria."""
        prompt = get_roast_prompt("Test resume")
        assert "Clarity" in prompt
        assert "Impact" in prompt
        assert "Relevance" in prompt
        assert "ATS" in prompt

    def test_prompt_with_default_parameters(self):
        """Test prompt generation with default parameters."""
        prompt = get_roast_prompt("Test resume")
        # Should use medium intensity and general industry by default
        # Should be a valid prompt
        assert len(prompt) > 500
        assert "Test resume" in prompt

    def test_invalid_intensity_falls_back_to_medium(self):
        """Invalid intensity should fall back to medium."""
        prompt = get_roast_prompt("Test resume", intensity="invalid")
        # Should still work, falling back to medium
        assert "witty" in prompt.lower() or "direct" in prompt.lower()

    def test_invalid_industry_uses_general_persona(self):
        """Invalid industry should use general persona but still add it."""
        prompt = get_roast_prompt("Test resume", industry="invalid")
        # Should not crash, uses general persona as fallback
        assert "Career Coach" in prompt  # General persona name

    def test_prompt_includes_headline_examples(self):
        """Prompt should include headline examples for guidance."""
        prompt = get_roast_prompt("Test resume")
        assert "beige wall" in prompt.lower() or "headline" in prompt.lower()

    def test_combination_of_intensity_and_industry(self):
        """Test combinations of intensity and industry work together."""
        combinations = [
            ("mild", "tech"),
            ("brutal", "finance"),
            ("medium", "creative"),
        ]

        for intensity, industry in combinations:
            prompt = get_roast_prompt("Test resume", intensity=intensity, industry=industry)
            # Should include both modifiers
            assert len(prompt) > 500
            assert "Test resume" in prompt
