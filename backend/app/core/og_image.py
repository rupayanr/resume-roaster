"""OG image generation for shareable roast cards."""
import io
import textwrap
from PIL import Image, ImageDraw, ImageFont


def get_heat_color(score: int) -> tuple[int, int, int]:
    """Get color based on score (inverted - low score = hot)."""
    heat = 100 - score
    if heat >= 80:  # Very hot (low score)
        return (220, 38, 38)  # red-600
    elif heat >= 60:
        return (249, 115, 22)  # orange-500
    elif heat >= 40:
        return (245, 158, 11)  # amber-500
    elif heat >= 20:
        return (234, 179, 8)  # yellow-500
    else:  # Cool (high score)
        return (34, 197, 94)  # green-500


def get_heat_label(score: int) -> str:
    """Get label based on score."""
    heat = 100 - score
    if heat >= 80:
        return "ABSOLUTELY COOKED"
    elif heat >= 60:
        return "Extra Crispy"
    elif heat >= 40:
        return "Medium Well"
    elif heat >= 20:
        return "Lightly Toasted"
    else:
        return "Barely Warm"


def generate_og_image(score: int, headline: str, intensity: str = "medium") -> bytes:
    """Generate a shareable OG image for a roast.

    Args:
        score: The roast score (0-100)
        headline: The roast headline
        intensity: The roast intensity level

    Returns:
        PNG image as bytes
    """
    # Image dimensions (standard OG size)
    width, height = 1200, 630

    # Colors
    bg_color = (17, 24, 39)  # gray-900
    heat_color = get_heat_color(score)
    text_color = (255, 255, 255)
    muted_color = (156, 163, 175)  # gray-400

    # Create image
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Try to use a nice font, fall back to default
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        score_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 120)
        headline_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except OSError:
        # Fallback to default font
        title_font = ImageFont.load_default()
        score_font = ImageFont.load_default()
        headline_font = ImageFont.load_default()
        small_font = ImageFont.load_default()

    # Draw gradient-like effect at bottom
    for i in range(100):
        alpha = i / 100
        color = tuple(int(bg_color[j] * (1 - alpha * 0.3)) for j in range(3))
        draw.rectangle([(0, height - 100 + i), (width, height - 100 + i + 1)], fill=color)

    # Draw fire emoji/indicator on left
    fire_x = 80
    fire_y = height // 2 - 60

    # Draw score circle
    circle_x = width // 2
    circle_y = 200
    circle_radius = 100

    # Draw circle background
    draw.ellipse(
        [circle_x - circle_radius, circle_y - circle_radius,
         circle_x + circle_radius, circle_y + circle_radius],
        outline=heat_color,
        width=8
    )

    # Draw score
    score_text = str(score)
    try:
        bbox = draw.textbbox((0, 0), score_text, font=score_font)
        score_w = bbox[2] - bbox[0]
        score_h = bbox[3] - bbox[1]
    except AttributeError:
        score_w, score_h = draw.textsize(score_text, font=score_font)

    draw.text(
        (circle_x - score_w // 2, circle_y - score_h // 2 - 10),
        score_text,
        fill=heat_color,
        font=score_font
    )

    # Draw heat label under score
    heat_label = get_heat_label(score)
    try:
        bbox = draw.textbbox((0, 0), heat_label, font=small_font)
        label_w = bbox[2] - bbox[0]
    except AttributeError:
        label_w, _ = draw.textsize(heat_label, font=small_font)

    draw.text(
        (circle_x - label_w // 2, circle_y + circle_radius + 20),
        heat_label,
        fill=heat_color,
        font=small_font
    )

    # Draw headline (wrapped)
    wrapped_headline = textwrap.fill(headline, width=45)
    headline_lines = wrapped_headline.split('\n')[:3]  # Max 3 lines

    headline_y = 380
    for line in headline_lines:
        try:
            bbox = draw.textbbox((0, 0), line, font=headline_font)
            line_w = bbox[2] - bbox[0]
        except AttributeError:
            line_w, _ = draw.textsize(line, font=headline_font)

        draw.text(
            (width // 2 - line_w // 2, headline_y),
            line,
            fill=text_color,
            font=headline_font
        )
        headline_y += 45

    # Draw branding at bottom
    brand_text = "Resume Roaster"
    try:
        bbox = draw.textbbox((0, 0), brand_text, font=title_font)
        brand_w = bbox[2] - bbox[0]
    except AttributeError:
        brand_w, _ = draw.textsize(brand_text, font=title_font)

    draw.text(
        (width // 2 - brand_w // 2, 40),
        brand_text,
        fill=text_color,
        font=title_font
    )

    # Draw intensity badge
    intensity_text = f"{intensity.upper()} ROAST"
    try:
        bbox = draw.textbbox((0, 0), intensity_text, font=small_font)
        int_w = bbox[2] - bbox[0]
    except AttributeError:
        int_w, _ = draw.textsize(intensity_text, font=small_font)

    # Draw intensity pill
    pill_x = width - int_w - 80
    pill_y = 50
    pill_padding = 15
    draw.rounded_rectangle(
        [pill_x - pill_padding, pill_y - 8,
         pill_x + int_w + pill_padding, pill_y + 32],
        radius=20,
        fill=heat_color
    )
    draw.text((pill_x, pill_y), intensity_text, fill=text_color, font=small_font)

    # Draw footer
    footer_text = "resumeroaster.rupayan.dev"
    try:
        bbox = draw.textbbox((0, 0), footer_text, font=small_font)
        footer_w = bbox[2] - bbox[0]
    except AttributeError:
        footer_w, _ = draw.textsize(footer_text, font=small_font)

    draw.text(
        (width // 2 - footer_w // 2, height - 50),
        footer_text,
        fill=muted_color,
        font=small_font
    )

    # Save to bytes
    buffer = io.BytesIO()
    img.save(buffer, format='PNG', optimize=True)
    buffer.seek(0)

    return buffer.getvalue()
