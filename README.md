# my-ai-adventure-engine

This is a lightweight web application engine that allows you to create and host your AI-powered text adventure games. Unlike traditional text adventures, which often limit players to pre-defined options, this engine leverages OpenAI's powerful Davinci 3.5 API to dynamically respond to players' actions, allowing them to co-create a unique and immersive experience with the author each time they play.

The engine reads JSON format screenplays. You have the flexibility to specify where to embed AI interactions and what prompts and API parameters to use. This means you can craft rich and complex narratives that evolve and adapt to the player's decisions, while still maintaining control over the generated stories.

It is built on Python web framework Flask, so you can easily host it on your personal computer or server, inviting players to your world. The default visual style is minimalistic, featuring interactive animations that guide players through the game. You have the option to replace these elements with your own tailored designs.

[GIF game]

[screenplay example]

Installation and Setup
Download the code
Run `pip install -r requirements.txt` to install the necessary dependencies
Get your OpenAI API kay from https://platform.openai.com/account/api-keys
Set the value to environment variable openai_api_key (.env file works as well)
Navigate to the code folder and run `python run.py`
Open `http://localhost:800` in your web browser

Writing Your Own Screenplay
Copy `demo.json` in the `/static/screenplays` folder and save it with your own screenplay name
Edit your screenplay JSON following the below standards:
A screenplay must have three parts: opening, steps (allowing player interaction), and ending
For opening and ending blocks, you can add any number of {} settings
[screenshot]
For steps block, you can add any number of steps, each consisting of the following elements:
[screenshot]

The two-letter language code for English is "en." This code follows the ISO 639-1 standard, which assigns two-letter codes to represent different languages. Here are some other commonly used language codes:

English: "en"
Spanish: "es"
French: "fr"
German: "de"
Italian: "it"
Portuguese: "pt"
Chinese: "zh"
Japanese: "ja"
Russian: "ru"
Arabic: "ar"

Customizing Design and Animation
Edit `main.css` in `/static/style`
Add your animations in `/static/animations`. You can use `$("#current_state").val()` to control the animation. An empty string means story proceeding, "I" means needing player input, "L" means waiting for OpenAI API response, and "E" means the story is complete.
Load your animations in main.html by replacing `<script src="/static/p5/my_rug.js?v=17" type="text/javascript"></script>`

This is my first open-source tool, and there are many items on my to-do list. Please stay tuned for updates!

