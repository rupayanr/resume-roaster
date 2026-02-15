"""Tests for the badge detection system."""
import pytest
from app.core.badges import (
    detect_badges,
    count_buzzwords,
    has_contact_info,
    has_outdated_skills,
    count_metrics,
    count_action_verbs,
    count_jobs,
    estimate_length,
    has_emojis,
)


class TestBuzzwordDetection:
    def test_count_buzzwords_with_buzzwords(self):
        text = "I am a proactive, dynamic team player with synergy skills"
        count = count_buzzwords(text)
        assert count >= 3  # proactive, dynamic, team player, synergy

    def test_count_buzzwords_no_buzzwords(self):
        text = "Software engineer with 5 years of Python experience"
        count = count_buzzwords(text)
        assert count == 0

    def test_count_buzzwords_case_insensitive(self):
        text = "SYNERGY and LEVERAGE are my strengths"
        count = count_buzzwords(text)
        assert count >= 2


class TestContactInfoDetection:
    def test_has_email(self):
        text = "Contact me at john.doe@example.com"
        assert has_contact_info(text) is True

    def test_has_phone(self):
        text = "Call me at (555) 123-4567"
        assert has_contact_info(text) is True

    def test_has_international_phone(self):
        text = "Phone: +1 555-123-4567"
        assert has_contact_info(text) is True

    def test_no_contact_info(self):
        text = "Software developer looking for opportunities"
        assert has_contact_info(text) is False


class TestOutdatedSkillsDetection:
    def test_has_outdated_skills(self):
        text = "Expert in Flash and ActionScript development"
        assert has_outdated_skills(text) is True

    def test_has_cobol(self):
        text = "Experienced COBOL programmer"
        assert has_outdated_skills(text) is True

    def test_no_outdated_skills(self):
        text = "Python, JavaScript, React, Node.js"
        assert has_outdated_skills(text) is False


class TestMetricsDetection:
    def test_count_percentages(self):
        text = "Increased sales by 25% and improved efficiency by 30%"
        count = count_metrics(text)
        assert count >= 2

    def test_count_dollar_amounts(self):
        text = "Managed $2,000,000 budget and saved $500,000"
        count = count_metrics(text)
        assert count >= 2

    def test_count_user_metrics(self):
        text = "Served 10000 users and managed team of 5 people"
        count = count_metrics(text)
        assert count >= 2

    def test_no_metrics(self):
        text = "Responsible for managing projects"
        count = count_metrics(text)
        assert count == 0


class TestActionVerbsDetection:
    def test_count_action_verbs(self):
        text = "Led team, developed features, implemented solutions, achieved goals"
        count = count_action_verbs(text)
        assert count >= 4

    def test_no_action_verbs(self):
        text = "Was responsible for tasks and duties"
        count = count_action_verbs(text)
        assert count == 0


class TestJobCountDetection:
    def test_count_multiple_jobs(self):
        text = """
        Company A (2020 - 2022)
        Company B (2018 - 2020)
        Company C (2015 - 2018)
        """
        count = count_jobs(text)
        assert count >= 3

    def test_count_current_job(self):
        text = "Software Engineer at Company (2020 - Present)"
        count = count_jobs(text)
        assert count >= 1


class TestLengthEstimation:
    def test_short_resume(self):
        text = "x" * 1000  # Less than 1 page
        length = estimate_length(text)
        assert length == 1

    def test_medium_resume(self):
        text = "x" * 4000  # About 1.5 pages
        length = estimate_length(text)
        assert length == 2

    def test_long_resume(self):
        text = "x" * 10000  # About 3+ pages
        length = estimate_length(text)
        assert length >= 3


class TestEmojiDetection:
    def test_has_emojis(self):
        text = "I love coding! \U0001F680\U0001F4BB"
        assert has_emojis(text) is True

    def test_no_emojis(self):
        text = "Professional software engineer"
        assert has_emojis(text) is False


class TestBadgeDetection:
    def test_buzzword_bingo_badge(self):
        text = "Proactive, dynamic, innovative team player with synergy and leverage skills"
        badges = detect_badges(text, score=50)
        badge_ids = [b["id"] for b in badges]
        assert "buzzword_bingo" in badge_ids

    def test_novel_writer_badge(self):
        # Very long resume (3+ pages)
        text = "x" * 10000
        badges = detect_badges(text, score=50)
        badge_ids = [b["id"] for b in badges]
        assert "novel_writer" in badge_ids

    def test_mystery_candidate_badge(self):
        text = "Software developer seeking new opportunities"
        badges = detect_badges(text, score=50)
        badge_ids = [b["id"] for b in badges]
        assert "mystery_candidate" in badge_ids

    def test_time_traveler_badge(self):
        text = "Expert in Flash and Dreamweaver"
        badges = detect_badges(text, score=50)
        badge_ids = [b["id"] for b in badges]
        assert "time_traveler" in badge_ids

    def test_humble_bragger_badge(self):
        text = """
        Responsible for managing projects.
        Responsible for leading team.
        Responsible for delivering results.
        """
        badges = detect_badges(text, score=50)
        badge_ids = [b["id"] for b in badges]
        assert "humble_bragger" in badge_ids

    def test_fireproof_badge(self):
        text = "john@example.com Python developer"
        badges = detect_badges(text, score=95)
        badge_ids = [b["id"] for b in badges]
        assert "fireproof" in badge_ids

    def test_needs_work_badge(self):
        text = "john@example.com Looking for work"
        badges = detect_badges(text, score=30)
        badge_ids = [b["id"] for b in badges]
        assert "needs_work" in badge_ids

    def test_metric_master_badge(self):
        text = """
        john@example.com
        Increased revenue by 25%
        Saved $500,000
        Served 10000 users
        Managed 50 employees
        Grew sales by 30%
        """
        badges = detect_badges(text, score=75)
        badge_ids = [b["id"] for b in badges]
        assert "metric_master" in badge_ids

    def test_action_hero_badge(self):
        text = """
        john@example.com
        Led development, built systems, created solutions.
        Achieved goals, developed features, implemented changes.
        Managed teams, delivered results, executed plans.
        Optimized performance, increased efficiency.
        """
        badges = detect_badges(text, score=70)
        badge_ids = [b["id"] for b in badges]
        assert "action_hero" in badge_ids

    def test_one_page_wonder_badge(self):
        text = "john@example.com " + "x" * 1500  # Short but complete resume
        badges = detect_badges(text, score=75)
        badge_ids = [b["id"] for b in badges]
        assert "one_page_wonder" in badge_ids

    def test_emoji_enthusiast_badge(self):
        text = "john@example.com Software Developer \U0001F680\U0001F4BB"
        badges = detect_badges(text, score=50)
        badge_ids = [b["id"] for b in badges]
        assert "emoji_enthusiast" in badge_ids

    def test_multiple_badges(self):
        # Resume with buzzwords and no contact info
        text = "Proactive dynamic innovative team player with synergy leverage paradigm"
        badges = detect_badges(text, score=50)
        badge_ids = [b["id"] for b in badges]
        assert "buzzword_bingo" in badge_ids
        assert "mystery_candidate" in badge_ids

    def test_badge_structure(self):
        text = "john@example.com"
        badges = detect_badges(text, score=95)
        assert len(badges) > 0
        badge = badges[0]
        assert "id" in badge
        assert "name" in badge
        assert "icon" in badge
        assert "description" in badge
