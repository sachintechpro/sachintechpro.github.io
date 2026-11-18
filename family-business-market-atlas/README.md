# Family Business Market Atlas

A market research and lightweight prospect workspace for finding U.S. owner-led, multi-branch service and installation businesses.

## Run locally
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py

## Features
- Public-facing market overview and segment discovery
- Sample account directory with search and filters
- Create, edit and delete prospect records
- CSV import and export
- Markdown market playbook view and editor
- CSV and Markdown files are the demo backend data store

## Important data caveats
- Prospect records are fictional examples, not verified companies.
- Segment counts are broad Census employer establishments, not the number of target companies.
- The SBA's 26.1% family-owned figure is an all-industry benchmark, not trade-specific.
- There is no public dataset that directly counts family-owned firms with $5M+ revenue and 2–20 branches. Qualify named accounts individually.

## Render
Build: pip install -r family-business-market-atlas/requirements.txt
Start: gunicorn --chdir family-business-market-atlas app:app

## Demo storage warning
The CSV/Markdown files are written on the app filesystem. On Render, local filesystem changes may be lost during redeploys/restarts unless a persistent disk is attached. This version is a public portfolio demo. Do not enter confidential or real customer/prospect information.
