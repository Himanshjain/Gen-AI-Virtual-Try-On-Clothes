import os
from jinja2 import Environment, FileSystemLoader, select_autoescape

# locate our prompts/ folder next to this file
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "prompts")
env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(),
)

def build_tryon_prompt(
    model_type: str,
    gender: str,
    garment_type: str,
    style: str,
    instructions: str,
) -> str:
    tpl = env.get_template("tryon_template.j2")
    return tpl.render(
        model_type=model_type,
        gender=gender,
        garment_type=garment_type,
        style=style,
        instructions=instructions or "",
    )
