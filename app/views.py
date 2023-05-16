# -*- coding: utf-8 -*-

from flask import render_template, request, jsonify, redirect, session
from app import app
from random import choice
import json
import os
import re
# from datetime import datetime
from .my_tools import *


@app.route('/')
def home():
    return read()


@app.route('/read')
def read():
    books = os.listdir(os.path.join(app.config['APP_STATIC'], "screenplays"))
    books = [b for b in books if b.endswith(".json")]
    books = [b.replace(".json", "") for b in books]
    return redirect("/read/" + (choice(books)))


@app.route('/read/<this>', methods = ["GET"])
def read_this(this):
    return general_main(this)
    # else:
    #     return render_template(this + ".html", title = "Read! <<" + this.capitalize() + ">>")


@app.route('/walk/<this>', methods = ["POST"])
def walk_this(this):
    return general_next()
    

@app.route('/run/<this>', methods = ["POST"])
def run_this(this):
    the_input = new_line_convertor(str(request.form['input']), "frontend")
    return general_action(the_input)


def general_main(this):
    with open(os.path.join(app.config['APP_STATIC'], "screenplays", this + ".json"), encoding='utf-8') as fh:
        session["screenplay"] = json.load(fh)

    session["texts"] = []
    session["displays"] = []

    process_plain_settings(session["screenplay"]["opening"], "opening")

    session["n_steps"] = len(session["screenplay"]["steps"])
    session["progress"] = 0
    process_interactive_settings(session["progress"])
    
    return render_template("main.html", title = "Hey!", n_steps = session["n_steps"])


def general_next():
    next = session["displays"][0]
    session["displays"] = session["displays"][1:]
    return jsonify(next)


def general_action(the_input):
    interaction_reply = close_interactive_settings(session["progress"], the_input)

    session["progress"] += 1
    if session["progress"] < session["n_steps"]:
        process_interactive_settings(session["progress"])
    
    else:
        process_plain_settings(session["screenplay"]["ending"], "ending")

        display = "<p></p><p></p><div data-html2canvas-ignore='true'><button onclick='download(this);' style='margin-left: 0px;'>Save</button><button onclick='location.reload();'>Restart</button></div><p></p><p></p>"
        session["displays"].append({"type": "t", "id": "download", "text": new_line_convertor(display, "backend")})
        # 冒险存档 重新开始

    return jsonify(interaction_reply)


def process_plain_settings(block, id):
    for s in block:
        if "model" in s:
            display = send_to_model(s)
        else:
            display = s["display"]
        session["texts"].append(display)
        session["displays"].append({"type": "t", "id": id, "text": new_line_convertor(display, "backend")})


def process_interactive_settings(progress):
    process_plain_settings(session["screenplay"]["steps"][progress]["intro"], "step" + str(progress) + "_intro")

    s = session["screenplay"]["steps"][progress]["interaction"]
    id = "step" + str(progress) + "_interaction_input"
    if (session["screenplay"]["language_code"] == "zh"):
        nbsp = "".join(["啊" * int(s["max_input"])])
    else:
        nbsp = "".join(["啊" * round(int(s["max_input"]) / 2)])
        # some tricks to mimic input underline formating
    max_input = s["max_input"]

    # display = f"<div class='editor underline_input' id='{id}_underline' style='widthpx;'>{nbsp}<button class='bi bi-joystick' id='{id}_submit' onclick='run();'></button></div>"
    display = f"<div class='editor underline_input' id='{id}_underline' style='width: ppxxpx;'>{nbsp}</div><div class='editor hidden_input' id='{id}_hidden' style='width: ppxxpx;'>{nbsp}</div>"
    session["displays"].append({"type": "n", "id": id + "_bg", "text": new_line_convertor(display, "backend")})

    display = f"<div class='editor' id='{id}' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' oninput='count_input(this, {max_input});' onblur='cut_input(this, {max_input});' onfocus='$(\"#current_state\").val(\"I\");' onfocusout='$(\"#current_state\").val(\"\");'></div>"
    session["displays"].append({"type": "t", "id": id + "_box", "text": new_line_convertor(display, "backend")})

    display = "<span class='smaller'>" +s["hint"] + "</span>" + f"<span class='smaller' id='{id}_limit'> (0/{max_input}) </span><button id='{id}_submit' onclick='run();'>Continue</button>"
    # 继续
    session["displays"].append({"type": "t", "id": id + "_hint", "text": new_line_convertor(display, "backend")})


def close_interactive_settings(progress, the_input):
    # new_line_convertor(str(request.form['input']), "frontend")
    interaction_reply = send_to_model(session["screenplay"]["steps"][progress]["interaction"], the_input)
    session["texts"].append(interaction_reply)

    process_plain_settings(session["screenplay"]["steps"][progress]["outro"], "step" + str(progress) + "_outro")

    return interaction_reply


def send_to_model(settings, the_input=""):
    prompt = settings["prompt"].replace("{{input}}", the_input)

    pattern = r"\{\{(all|\d+)\}\}"
    attention = ""
    for i, match in enumerate(re.finditer(pattern, prompt)):
        if i == 0:
            attention = match.group(1)
        prompt = re.sub(pattern, '', prompt, count=1)

    if len(the_input) > 0:
        session["texts"].append(prompt)
        if attention == "all":
            prompt = "".join(session["texts"][:-1]) + prompt
        elif len(attention) > 0:
            prompt = "".join(session["texts"][-1 * min(len(session["texts"]), int(attention) + 1):-1]) + prompt
    else:
        if attention == "all":
            prompt = "".join(session["texts"]) + prompt
        elif len(attention) > 0:
            prompt = "".join(session["texts"][-1 * min(len(session["texts"]), int(attention)):]) + prompt

    ps = {}
    ps["prompt"] = prompt
    for p in ["model", "suffix", "max_tokens", "temperature", "stop", "best_of"]:
        if p in settings:
            ps[p] = settings[p]
    reply = get_reply(ps)
    return settings["display"].replace("{{reply}}", reply)