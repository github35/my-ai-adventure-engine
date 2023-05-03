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
    return render_template("home.html", title = "Book Shelf")


@app.route('/read')
def read():
    books = ["demo"]
    return redirect('/read/' + choice(books))


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
    with open(os.path.join(app.config['APP_STATIC'], "plots", this + ".json"), encoding='utf-8') as fh:
        session["plot"] = json.load(fh)

    session["texts"] = []
    session["displays"] = []

    process_plain_settings(session["plot"]["opening"], "opening")

    session["n_steps"] = len(session["plot"]["steps"])
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
        process_plain_settings(session["plot"]["ending"], "ending")

        display = "<p></p><p></p><div data-html2canvas-ignore='true'><button onclick='download(this);' style='margin-left: 0px;'>冒险存档</button><button onclick='location.reload();'>重新开始</button></div><p></p><p></p>"
        session["displays"].append({"type": "t", "id": "download", "text": new_line_convertor(display, "backend")})

    return jsonify(interaction_reply)


def process_plain_settings(block, id):
    for s in block:
        if "prompt" in s:
            display = send_to_model(s)
        else:
            display = s["display"]
        session["texts"].append(display)
        session["displays"].append({"type": "t", "id": id, "text": new_line_convertor(display, "backend")})


def process_interactive_settings(progress):
    process_plain_settings(session["plot"]["steps"][progress]["intro"], "step" + str(progress) + "_intro")

    s = session["plot"]["steps"][progress]["interaction"]
    id = "step" + str(progress) + "_interaction_input"
    nbsp = "".join(["啊" * int(s["max_input"])])
    max_input = s["max_input"]

    # display = f"<div class='editor underline_input' id='{id}_underline' style='widthpx;'>{nbsp}<button class='bi bi-joystick' id='{id}_submit' onclick='run();'></button></div>"
    display = f"<div class='editor underline_input' id='{id}_underline' style='width: ppxxpx;'>{nbsp}</div><div class='editor hidden_input' id='{id}_hidden' style='width: ppxxpx;'>{nbsp}</div>"
    session["displays"].append({"type": "n", "id": id + "_bg", "text": new_line_convertor(display, "backend")})

    display = f"<div class='editor' id='{id}' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' oninput='count_input(this, {max_input});' onblur='cut_input(this, {max_input});' onfocus='$(\"#current_state\").val(\"I\");' onfocusout='$(\"#current_state\").val(\"\");'></div>"
    session["displays"].append({"type": "t", "id": id + "_box", "text": new_line_convertor(display, "backend")})

    display = "<span class='smaller'>" +s["hint"] + "</span>" + f"<span class='smaller' id='{id}_limit'> (0/{max_input}) </span><button id='{id}_submit' onclick='run();'>继续</button>"
    # display = s["hint"] + f"<span class='smaller' id='{id}_limit'> (0/{max_input}) </span>"
    session["displays"].append({"type": "t", "id": id + "_hint", "text": new_line_convertor(display, "backend")})

    # display = "<button id='{id}_submit' onclick='run();'>继续</button>"
    # session["displays"].append({"type": "t", "id": id + "_result", "text": new_line_convertor(display, "backend")})


def close_interactive_settings(progress, the_input):
    # new_line_convertor(str(request.form['input']), "frontend")
    interaction_reply = send_to_model(session["plot"]["steps"][progress]["interaction"], the_input)
    session["texts"].append(interaction_reply)

    process_plain_settings(session["plot"]["steps"][progress]["outro"], "step" + str(progress) + "_outro")

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
    for p in ["suffix", "model", "max_tokens", "stop", "role", "temperature"]:
        if p in settings:
            ps[p] = settings[p]
    reply = get_reply(ps)
    return settings["display"].replace("{{reply}}", reply)