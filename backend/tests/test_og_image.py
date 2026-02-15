"""Tests for OG image generation."""
import pytest
from PIL import Image
import io

from app.core.og_image import (
    generate_og_image,
    get_heat_color,
    get_heat_label,
)


class TestHeatColorCalculation:
    def test_low_score_returns_red(self):
        # Low score = high heat = red
        color = get_heat_color(15)  # heat = 85
        assert color == (220, 38, 38)  # red-600

    def test_medium_low_score_returns_orange(self):
        color = get_heat_color(35)  # heat = 65
        assert color == (249, 115, 22)  # orange-500

    def test_medium_score_returns_amber(self):
        color = get_heat_color(55)  # heat = 45
        assert color == (245, 158, 11)  # amber-500

    def test_medium_high_score_returns_yellow(self):
        color = get_heat_color(75)  # heat = 25
        assert color == (234, 179, 8)  # yellow-500

    def test_high_score_returns_green(self):
        color = get_heat_color(90)  # heat = 10
        assert color == (34, 197, 94)  # green-500


class TestHeatLabelCalculation:
    def test_low_score_label(self):
        label = get_heat_label(15)  # heat = 85
        assert label == "ABSOLUTELY COOKED"

    def test_medium_low_score_label(self):
        label = get_heat_label(35)  # heat = 65
        assert label == "Extra Crispy"

    def test_medium_score_label(self):
        label = get_heat_label(55)  # heat = 45
        assert label == "Medium Well"

    def test_medium_high_score_label(self):
        label = get_heat_label(75)  # heat = 25
        assert label == "Lightly Toasted"

    def test_high_score_label(self):
        label = get_heat_label(90)  # heat = 10
        assert label == "Barely Warm"


class TestOGImageGeneration:
    def test_generates_valid_png(self):
        image_bytes = generate_og_image(
            score=72,
            headline="Your resume is like a beige wall",
            intensity="medium"
        )

        # Should be bytes
        assert isinstance(image_bytes, bytes)
        assert len(image_bytes) > 100

        # Should be valid PNG
        image = Image.open(io.BytesIO(image_bytes))
        assert image.format == "PNG"

    def test_correct_dimensions(self):
        image_bytes = generate_og_image(
            score=72,
            headline="Test headline",
            intensity="medium"
        )

        image = Image.open(io.BytesIO(image_bytes))
        assert image.size == (1200, 630)  # Standard OG image size

    def test_different_scores_generate_images(self):
        """Test that different scores produce valid images."""
        for score in [10, 30, 50, 70, 90]:
            image_bytes = generate_og_image(
                score=score,
                headline=f"Test headline for score {score}",
                intensity="medium"
            )
            image = Image.open(io.BytesIO(image_bytes))
            assert image.size == (1200, 630)

    def test_different_intensities(self):
        """Test that different intensities produce valid images."""
        for intensity in ["mild", "medium", "brutal"]:
            image_bytes = generate_og_image(
                score=50,
                headline="Test headline",
                intensity=intensity
            )
            image = Image.open(io.BytesIO(image_bytes))
            assert image.size == (1200, 630)

    def test_long_headline_wrapped(self):
        """Test that long headlines are handled properly."""
        long_headline = "This is a very long headline that should be wrapped across multiple lines because it exceeds the typical width"
        image_bytes = generate_og_image(
            score=50,
            headline=long_headline,
            intensity="medium"
        )

        # Should still generate valid image
        image = Image.open(io.BytesIO(image_bytes))
        assert image.size == (1200, 630)

    def test_empty_headline(self):
        """Test that empty headline is handled."""
        image_bytes = generate_og_image(
            score=50,
            headline="",
            intensity="medium"
        )

        image = Image.open(io.BytesIO(image_bytes))
        assert image.size == (1200, 630)

    def test_special_characters_in_headline(self):
        """Test that special characters don't break generation."""
        headline = "Your resume is like a 'beige' wall - technically \"there\"!"
        image_bytes = generate_og_image(
            score=50,
            headline=headline,
            intensity="medium"
        )

        image = Image.open(io.BytesIO(image_bytes))
        assert image.size == (1200, 630)

    def test_rgb_mode(self):
        """Test that image is in RGB mode (required for PNG)."""
        image_bytes = generate_og_image(
            score=50,
            headline="Test",
            intensity="medium"
        )

        image = Image.open(io.BytesIO(image_bytes))
        assert image.mode == "RGB"

    def test_extreme_scores(self):
        """Test boundary scores."""
        for score in [0, 100]:
            image_bytes = generate_og_image(
                score=score,
                headline="Boundary test",
                intensity="medium"
            )
            image = Image.open(io.BytesIO(image_bytes))
            assert image.size == (1200, 630)
