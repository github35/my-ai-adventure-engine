# -*- coding: utf-8 -*-
#!flask/Scripts/python

import sys
 
#Expand Python classes path with your app's path
sys.path.insert(0, "")
 
from prod import app

#Initialize WSGI app object
application = app

