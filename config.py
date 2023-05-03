# -*- coding: utf-8 -*-

CSRF_ENABLED = True
SECRET_KEY = "GUHDJK@^*#&(@DKM1728"

import os
# __file__ refers to the file settings.py
APP_ROOT = os.path.dirname(os.path.abspath(__file__))   # refers to application_top
APP_STATIC = os.path.join(APP_ROOT, 'app', 'static')