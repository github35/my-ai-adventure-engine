# -*- coding: utf-8 -*-

import requests
import random
from dotenv import load_dotenv
import os
# openai.organization = "org-TK1NEMXJlZIU7ft1co7dYhO1"

def get_reply(data):
    load_dotenv()
    headers = {"Authorization": f"Bearer " + os.getenv("openai_api_key")}
    # data = {"prompt": prompt, "model": model, "max_tokens": max_tokens, "stop": stop}
    print(data)
    good_reply = 0
    while good_reply != 1:
        results = requests.post("https://api.openai.com/v1/completions", headers=headers, json=data).json()
        try:
            stop_choices = [choice['text'] for choice in results['choices'] if choice['finish_reason'] == 'stop']
            if len(stop_choices) > 0:
                good_reply = 1
            reply = min(stop_choices, key=len)
            # reply = random.choice(results["choices"])
        except:
            reply = "啊！报错了！"
        # if reply["finish_reason"] == "stop":
        #     good_reply = 1
    print(results)
    return reply


def new_line_convertor(str, src):
    if src == "backend":
        return str.replace("\n", "<br/>")
    if src == "frontend":
        return str.replace("<br/>", "\n")
    return str