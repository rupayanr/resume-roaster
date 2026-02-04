import pytest
import json
from unittest.mock import patch, MagicMock
from app.core.roaster import generate_roast


class TestRoaster:
    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.ollama.Client")
    def test_generate_roast_returns_dict(self, mock_client_class, mock_get_settings, mock_roast_response):
        """Test that generate_roast returns a dictionary."""
        mock_get_settings.return_value.ollama_host = "http://localhost:11434"
        mock_get_settings.return_value.ollama_model = "llama3.2"

        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        mock_client.chat.return_value = {"message": {"content": json.dumps(mock_roast_response)}}

        result = generate_roast("John Doe\nSoftware Engineer\n5 years experience")

        assert isinstance(result, dict)
        assert "score" in result
        assert "headline" in result
        assert "sections" in result

    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.ollama.Client")
    def test_generate_roast_calls_ollama_correctly(self, mock_client_class, mock_get_settings, mock_roast_response):
        """Test that Ollama is called with correct parameters."""
        mock_get_settings.return_value.ollama_host = "http://localhost:11434"
        mock_get_settings.return_value.ollama_model = "llama3.2"

        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        mock_client.chat.return_value = {"message": {"content": json.dumps(mock_roast_response)}}

        resume_text = "Test resume content"
        generate_roast(resume_text)

        mock_client.chat.assert_called_once()
        call_kwargs = mock_client.chat.call_args.kwargs

        assert call_kwargs["model"] == "llama3.2"
        assert call_kwargs["format"] == "json"
        assert len(call_kwargs["messages"]) == 2
        assert resume_text in call_kwargs["messages"][1]["content"]

    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.ollama.Client")
    def test_generate_roast_handles_valid_json_response(self, mock_client_class, mock_get_settings, mock_roast_response):
        """Test that valid JSON response is parsed correctly."""
        mock_get_settings.return_value.ollama_host = "http://localhost:11434"
        mock_get_settings.return_value.ollama_model = "llama3.2"

        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        mock_client.chat.return_value = {"message": {"content": json.dumps(mock_roast_response)}}

        result = generate_roast("Test resume")

        assert result["score"] == 72
        assert "Your resume is decent" in result["headline"]
        assert len(result["sections"]) == 3
        assert len(result["suggestions"]) == 1

    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.ollama.Client")
    def test_generate_roast_raises_on_invalid_json(self, mock_client_class, mock_get_settings):
        """Test that invalid JSON response raises an exception."""
        mock_get_settings.return_value.ollama_host = "http://localhost:11434"
        mock_get_settings.return_value.ollama_model = "llama3.2"

        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        mock_client.chat.return_value = {"message": {"content": "Not valid JSON"}}

        with pytest.raises(json.JSONDecodeError):
            generate_roast("Test resume")

    @patch("app.core.roaster.get_settings")
    @patch("app.core.roaster.ollama.Client")
    def test_generate_roast_uses_correct_temperature(self, mock_client_class, mock_get_settings, mock_roast_response):
        """Test that creativity temperature is set appropriately."""
        mock_get_settings.return_value.ollama_host = "http://localhost:11434"
        mock_get_settings.return_value.ollama_model = "llama3.2"

        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        mock_client.chat.return_value = {"message": {"content": json.dumps(mock_roast_response)}}

        generate_roast("Test resume")

        call_kwargs = mock_client.chat.call_args.kwargs
        # Low temperature for consistent scoring
        assert call_kwargs["options"]["temperature"] == 0.1
