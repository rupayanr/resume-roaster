import pytest
import json
from unittest.mock import patch, MagicMock
from app.core.roaster import generate_roast


class TestRoaster:
    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.Groq")
    def test_generate_roast_returns_dict(self, mock_groq_class, mock_get_settings, mock_roast_response):
        """Test that generate_roast returns a dictionary."""
        mock_get_settings.return_value.groq_api_key = "test-key"
        mock_get_settings.return_value.groq_model = "llama-3.1-70b-versatile"

        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content=json.dumps(mock_roast_response)))]
        mock_client.chat.completions.create.return_value = mock_response

        result = generate_roast("John Doe\nSoftware Engineer\n5 years experience")

        assert isinstance(result, dict)
        assert "score" in result
        assert "headline" in result
        assert "sections" in result

    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.Groq")
    def test_generate_roast_calls_groq_correctly(self, mock_groq_class, mock_get_settings, mock_roast_response):
        """Test that Groq is called with correct parameters."""
        mock_get_settings.return_value.groq_api_key = "test-key"
        mock_get_settings.return_value.groq_model = "llama-3.1-70b-versatile"

        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content=json.dumps(mock_roast_response)))]
        mock_client.chat.completions.create.return_value = mock_response

        resume_text = "Test resume content"
        generate_roast(resume_text)

        mock_client.chat.completions.create.assert_called_once()
        call_kwargs = mock_client.chat.completions.create.call_args.kwargs

        assert call_kwargs["model"] == "llama-3.1-70b-versatile"
        assert call_kwargs["response_format"] == {"type": "json_object"}
        assert len(call_kwargs["messages"]) == 2
        assert resume_text in call_kwargs["messages"][1]["content"]

    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.Groq")
    def test_generate_roast_handles_valid_json_response(self, mock_groq_class, mock_get_settings, mock_roast_response):
        """Test that valid JSON response is parsed correctly."""
        mock_get_settings.return_value.groq_api_key = "test-key"
        mock_get_settings.return_value.groq_model = "llama-3.1-70b-versatile"

        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content=json.dumps(mock_roast_response)))]
        mock_client.chat.completions.create.return_value = mock_response

        result = generate_roast("Test resume")

        assert result["score"] == 72
        assert "Your resume is decent" in result["headline"]
        assert len(result["sections"]) == 3
        assert len(result["suggestions"]) == 1

    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.Groq")
    def test_generate_roast_raises_on_invalid_json(self, mock_groq_class, mock_get_settings):
        """Test that invalid JSON response raises an exception."""
        mock_get_settings.return_value.groq_api_key = "test-key"
        mock_get_settings.return_value.groq_model = "llama-3.1-70b-versatile"

        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Not valid JSON"))]
        mock_client.chat.completions.create.return_value = mock_response

        with pytest.raises(json.JSONDecodeError):
            generate_roast("Test resume")

    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.Groq")
    def test_generate_roast_uses_correct_temperature(self, mock_groq_class, mock_get_settings, mock_roast_response):
        """Test that creativity temperature is set appropriately."""
        mock_get_settings.return_value.groq_api_key = "test-key"
        mock_get_settings.return_value.groq_model = "llama-3.1-70b-versatile"

        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content=json.dumps(mock_roast_response)))]
        mock_client.chat.completions.create.return_value = mock_response

        generate_roast("Test resume")

        call_kwargs = mock_client.chat.completions.create.call_args.kwargs
        # Medium temperature for medium intensity (default)
        assert call_kwargs["temperature"] == 0.2

    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.Groq")
    def test_generate_roast_mild_intensity_low_temperature(self, mock_groq_class, mock_get_settings, mock_roast_response):
        """Test that mild intensity uses low temperature."""
        mock_get_settings.return_value.groq_api_key = "test-key"
        mock_get_settings.return_value.groq_model = "llama-3.1-70b-versatile"

        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content=json.dumps(mock_roast_response)))]
        mock_client.chat.completions.create.return_value = mock_response

        generate_roast("Test resume", intensity="mild")

        call_kwargs = mock_client.chat.completions.create.call_args.kwargs
        assert call_kwargs["temperature"] == 0.1

    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.Groq")
    def test_generate_roast_brutal_intensity_high_temperature(self, mock_groq_class, mock_get_settings, mock_roast_response):
        """Test that brutal intensity uses higher temperature."""
        mock_get_settings.return_value.groq_api_key = "test-key"
        mock_get_settings.return_value.groq_model = "llama-3.1-70b-versatile"

        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content=json.dumps(mock_roast_response)))]
        mock_client.chat.completions.create.return_value = mock_response

        generate_roast("Test resume", intensity="brutal")

        call_kwargs = mock_client.chat.completions.create.call_args.kwargs
        assert call_kwargs["temperature"] == 0.3
