"""
Vercel Serverless Function Adapter for Flask App

This file bridges Vercel's serverless function system with Flask.
Vercel's Python runtime expects WSGI-compatible applications, which Flask is.
"""
import sys
import os

# Add backend directory to Python path so we can import app
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Change to backend directory to ensure relative imports work
os.chdir(backend_path)

# Import Flask app - this must be done after path setup
from app import app

# Vercel's Python runtime expects the Flask app (WSGI application) to be exported
# The @vercel/python builder automatically handles WSGI apps
handler = app


