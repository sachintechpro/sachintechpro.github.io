from flask import Flask, jsonify, request, render_template, send_file
from pathlib import Path
import csv, io, os
from datetime import datetime
ROOT=Path(__file__).resolve().parent
DATA=ROOT/"data"
SEGMENTS=DATA/"segments.csv"; PROSPECTS=DATA/"prospects.csv"; PLAYBOOK=DATA/"market-playbook.md"
FIELDS=["id","company","segment","city","state","revenue_band","branches","ownership","fit_status","website","notes","record_type"]
app=Flask(__name__)
def read_csv(path):
    with path.open("r",newline="",encoding="utf-8-sig") as f: return list(csv.DictReader(f))
def write_csv(path,rows,fields):
    with path.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore"); w.writeheader(); w.writerows(rows)
@app.get("/")
def home(): return render_template("index.html")
@app.get("/api/segments")
def segments(): return jsonify(read_csv(SEGMENTS))
@app.get("/api/prospects")
def prospects(): return jsonify(read_csv(PROSPECTS))
@app.post("/api/prospects")
def add_prospect():
    d=request.get_json(silent=True) or {}; rows=read_csv(PROSPECTS)
    item={k:str(d.get(k,"")).strip() for k in FIELDS}
    item["id"]=item["id"] or "P-"+datetime.utcnow().strftime("%y%m%d%H%M%S%f"); item["record_type"]="DEMO"
    if not item["company"]: return jsonify({"error":"Company name is required"}),400
    rows.append(item); write_csv(PROSPECTS,rows,FIELDS); return jsonify(item),201
@app.put("/api/prospects/<pid>")
def update_prospect(pid):
    d=request.get_json(silent=True) or {}; rows=read_csv(PROSPECTS); found=False
    for r in rows:
        if r["id"]==pid:
            r.update({k:str(d.get(k,r.get(k,""))).strip() for k in FIELDS if k!="id"}); found=True; break
    if not found: return jsonify({"error":"Record not found"}),404
    write_csv(PROSPECTS,rows,FIELDS); return jsonify({"ok":True})
@app.delete("/api/prospects/<pid>")
def delete_prospect(pid):
    rows=read_csv(PROSPECTS); kept=[r for r in rows if r["id"]!=pid]
    if len(kept)==len(rows): return jsonify({"error":"Record not found"}),404
    write_csv(PROSPECTS,kept,FIELDS); return jsonify({"ok":True})
@app.post("/api/import")
def import_csv():
    up=request.files.get("file")
    if not up: return jsonify({"error":"Choose a CSV file"}),400
    try:
        incoming=list(csv.DictReader(io.StringIO(up.stream.read().decode("utf-8-sig")))); rows=read_csv(PROSPECTS); ids={r["id"] for r in rows}; added=0
        for raw in incoming:
            item={k:str(raw.get(k,"")).strip() for k in FIELDS}
            if not item["company"]: continue
            if not item["id"] or item["id"] in ids: item["id"]="P-"+datetime.utcnow().strftime("%y%m%d%H%M%S%f")+str(added)
            item["record_type"]="DEMO"; rows.append(item); ids.add(item["id"]); added+=1
        write_csv(PROSPECTS,rows,FIELDS); return jsonify({"added":added})
    except Exception as e: return jsonify({"error":str(e)}),400
@app.get("/api/export")
def export_csv(): return send_file(PROSPECTS,as_attachment=True,download_name="prospects.csv",mimetype="text/csv")
@app.get("/api/playbook")
def playbook(): return jsonify({"markdown":PLAYBOOK.read_text(encoding="utf-8")})
@app.put("/api/playbook")
def save_playbook():
    d=request.get_json(silent=True) or {}; PLAYBOOK.write_text(str(d.get("markdown","")),encoding="utf-8"); return jsonify({"ok":True})
@app.get("/api/health")
def health(): return jsonify({"status":"ok","storage":"CSV + Markdown files","demo":True})
if __name__=="__main__": app.run(host="0.0.0.0",port=int(os.environ.get("PORT",5000)))
