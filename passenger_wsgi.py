import sys
import os

# Ajoute le chemin de ton application
sys.path.insert(0, "/home/nasseraldin/lm")

from app import app as application  # 'application' est nécessaire pour Passenger
