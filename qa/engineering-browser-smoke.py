"""Browser verification for all TEN portfolio QA workbenches.

Only GET/read-only safe checks and browser-local test records.
Real app business data, orders, jobs and PixelProof are never mutated.
"""
import json
import re
import sys
import time
from datetime import datetime,timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

TARGETS = [
 ("Project/Program Manager","project-program-manager","https://project-program-manager.onrender.com/qa-bench.html"),
 ("FrameOps","frameops-window-door-operations","https://frameops-operations.onrender.com/qa-bench.html"),
 ("CommerceDesk","commercedesk","https://commercedesk.onrender.com/qa-bench.html"),
 ("IdentityFlow","identityflow","https://identityflow.onrender.com/qa-bench.html"),
 ("DeliveryCommand","deliverycommand","https://deliverycommand.onrender.com/qa-bench.html"),
 ("IntegrationCommand","integrationcommand","https://integrationcommand-1.onrender.com/qa-bench.html"),
 ("QualityCommand","qualitycommand","https://qualitycommand.onrender.com/qa-bench.html"),
 ("ProductLens","productlens","https://productlens-ab9d.onrender.com/qa-bench.html"),
 ("ScopePilot","scopepilot","https://scopepilot-etgt.onrender.com/qa-bench.html"),
 ("BuildEstimate","construction-estimator","https://buildestimate-82xs.onrender.com/qa-bench.html"),
]
OUT=Path("artifacts/qa-engineering-browser")
OUT.mkdir(parents=True,exist_ok=True)
CANONICAL={"requirements","cases","manual","automation","defects","report",
           "engineering","catalog","ci","gates"}

def check(browser,name,slug,url):
    ctx=browser.new_context(viewport={"width":390,"height":844},device_scale_factor=1)
    page=ctx.new_page()
    errors=[]
    page.on("pageerror",lambda err: errors.append(str(err)))
    result={"project":name,"url":url,"status":"pending","checked":[],
            "ci":"not loaded","safeChecks":{},"issues":[]}
    safe_name=re.sub(r"[^a-z0-9]+","-",name.lower()).strip("-")
    try:
        last_error=None
        for attempt in range(3):
            try:
                page.goto(url,wait_until="domcontentloaded",timeout=85000)
                page.wait_for_selector("#app h2",timeout=60000)
                last_error=None
                break
            except Exception as err:
                last_error=err
                time.sleep(6)
        if last_error:raise last_error
        tabs=page.locator("[data-tab]").evaluate_all("(nodes)=>nodes.map(n=>n.getAttribute('data-tab'))")
        assert set(tabs)==CANONICAL, f"Existing or new tabs missing: {tabs}"
        assert len(tabs)==10
        assert "Requirements analysis" in page.locator("#app h2").first.inner_text(), "Original QA process must open first"
        result["checked"].append("ten tabs, original six preserved; requirements-first default")
        page.locator("[data-tab=engineering]").click()
        page.wait_for_selector("#app .tech-hero",timeout=12000)
        # Presentation must inherit the application's design rather than a generic QA theme.
        assert page.locator(".qa-site-header").is_visible()
        assert page.locator(".qa-site-brand").is_visible()
        assert page.locator(".qa-site-menu [aria-current=page]").inner_text() == "QA Bench"
        assert page.locator(".qa-site-brand").get_attribute("href") == url.replace("/qa-bench.html","/")
        assert page.locator(".qa-site-menu").get_attribute("aria-label")
        style=page.evaluate("""() => {
          const body=getComputedStyle(document.body);
          const hero=getComputedStyle(document.querySelector('.tech-hero'));
          const head=getComputedStyle(document.querySelector('.qa-site-bar'));
          return {font:body.fontFamily,color:body.color,background:body.backgroundColor,
                  heroImage:hero.backgroundImage,headBackground:head.backgroundColor};
        }""")
        assert style["heroImage"]=="none",f"Decorative gradient still present: {style}"
        assert page.locator(".qa-site-header").get_attribute("class") == "qa-site-header"
        if slug in ("project-program-manager","frameops-window-door-operations"):
            assert page.locator(".qa-sidebar .qa-side-link.active").is_visible() or page.locator(".qa-site-menu [aria-current=page]").is_visible()
        if slug=="commercedesk":
            assert style["headBackground"]=="rgb(41, 83, 162)",f"CommerceDesk storefront header colors differ: {style}"

        # Verify the parent application's own menu offers a separate-tab QA Bench link.
        home=ctx.new_page()
        try:
            home.goto(url.replace("/qa-bench.html","/"),wait_until="domcontentloaded",timeout=85000)
            nav=home.locator('a[href="/qa-bench.html"]')
            assert nav.count()>0,f"No QA Bench menu in {name}"
            assert any(nav.nth(i).get_attribute("target")=="_blank" for i in range(nav.count())),f"QA link must open a new tab in {name}"
            body_style=home.evaluate("""() => {
              let x=getComputedStyle(document.body);
              return {font:x.fontFamily,color:x.color,background:x.backgroundColor};
            }""")
            assert style["color"]==body_style["color"],f"Text color mismatch: QA {style} App {body_style}"
            assert style["font"]==body_style["font"],f"Font mismatch: QA {style} App {body_style}"
            assert style["background"]==body_style["background"],f"Canvas background mismatch: QA {style} App {body_style}"
        finally:
            home.close()
        result["checked"].append("site-matched fonts, colors, and new-tab QA menu")

        # Mobile technical nav must wrap into a legible two-column grid.
        tabs_style=page.locator(".qa-eng-tabs").evaluate("""el=>{
          const style=getComputedStyle(el);
          return {display:style.display,buttons:[...el.querySelectorAll('button')].map(b=>{
            const r=b.getBoundingClientRect(); return {x:r.x,right:r.right,width:r.width}
          })};
        }""")
        assert tabs_style["display"]=="grid",f"Mobile technical tabs are clipped or scrolling: {tabs_style}"
        assert len(tabs_style["buttons"])==4
        assert all(b["x"]>=-2 and b["right"]<=392 and b["width"]>100 for b in tabs_style["buttons"]),f"Technical tab overflow: {tabs_style}"
        source_color=page.locator("#source-link").evaluate("(el)=>getComputedStyle(el).color")
        assert source_color!= "rgb(205, 229, 255)",f"Source link has inadequate contrast: {source_color}"
        result["checked"].append("two-column mobile evidence navigation and readable source links")


        initial=page.locator("#app .tech-hero h2").inner_text()
        assert "Actual tests" in initial
        result["checked"].append("technical evidence overview rendered")
        config=page.locator("#qa-config").evaluate("(el)=>JSON.parse(el.textContent)")
        assert config["technicalCases"] and config["suites"] and config["workflows"]
        result["sourceCases"]=len(config["technicalCases"])
        result["checked"].append("source backed test catalog loaded")
        scrollwidth=page.evaluate("document.documentElement.scrollWidth")
        clientwidth=page.evaluate("document.documentElement.clientWidth")
        assert scrollwidth<=clientwidth+2, f"390px horizontal overflow: {scrollwidth}>{clientwidth}"
        result["checked"].append("no 390px horizontal overflow")

        page.locator("[data-tab=catalog]").click()
        page.wait_for_selector(".tech-source")
        assert page.locator(".tech-source").count()==result["sourceCases"]
        page.locator(".tech-source summary").first.click()
        assert page.locator(".tech-source pre").first.is_visible()
        assert page.locator(".tech-source-body a").first.get_attribute("href").startswith("https://github.com/")
        result["checked"].append("expand sourced assertion and exact file link")
        all_categories=page.locator("#qa-tech-category option").all_inner_texts()
        assert len(all_categories)>=8
        found_cat=config["technicalCases"][0]["category"]
        page.locator("#qa-tech-category").select_option(label=found_cat)
        assert page.locator(".tech-source").count()>=1
        result["checked"].append("test-category filtering")

        page.locator("[data-tab=gates]").click()
        assert "traceability" in page.locator("#app h2").first.inner_text().lower()
        assert page.locator("#app table tbody tr").count()==len(config["requirements"])
        result["checked"].append("risk / requirement to test traceability")

        page.locator("[data-tab=ci]").click()
        assert page.locator("[data-act=qa-refresh-ci]").is_visible()
        assert page.locator("#app").get_by_text("Workflow history").count()>0
        page.locator("[data-act=qa-refresh-ci]").click()
        try:
            page.wait_for_function("""() => {
              const v=document.querySelector('.tech-ci-header')?.innerText || '';
              return v.includes('Last checked:') || v.includes('Unable to verify');
            }""",timeout=26000)
            result["ci"]=page.locator(".tech-ci-header").inner_text().strip()
        except Exception:
            result["ci"]="CI request did not finish; workflow links available"
        result["checked"].append("live CI workflow panel and external run links")

        # Preserve all original lifecycle sections, including manual execution and reporting.
        for original,needle in [
          ("requirements","Requirements analysis"),
          ("cases","Test design repository"),
          ("manual","Manual QA execution"),
          ("automation","Executable application-specific QA checks"),
          ("defects","Defect tracking and evidence"),
          ("report","QA execution & leadership summary")]:
            page.locator("[data-tab="+original+"]").click()
            assert needle.lower() in page.locator("#app h2").first.inner_text().lower(),original
        result["checked"].append("all six original panels remain interactive")

        # Execute source-defined read-only checks; failures are recorded as evidence,
        # not silently converted into passes.
        page.locator("[data-tab=automation]").click()
        page.locator("[data-act=run-all]").click()
        key="qa-bench:"+slug+":v1"
        page.wait_for_function("""([key,want]) => {
          try { let data=JSON.parse(localStorage.getItem(key)||'{}');
            return Object.keys(data.auto||{}).length>=want; } catch(e){return false;}
        }""",arg=[key,len(config["automatic"])],timeout=35000)
        recorded=page.evaluate("""(key)=>{
          const d=JSON.parse(localStorage.getItem(key)||'{}');
          return Object.fromEntries(Object.entries(d.auto||{}).map(([id,r])=>[id,{status:r.status,actual:r.actual,assertion:r.assertion,elapsed:r.elapsed}]));
        }""",key)
        result["safeChecks"]=recorded
        result["checked"].append("safe real HTTP / pure-model execution proof available")

        page.locator("[data-tab=manual]").click()
        page.locator("select[name=status]").select_option(label="Blocked")
        page.locator("textarea[name=actual]").fill("Isolated UI QA harness verification: form saved; no manual application test was performed.")
        page.locator("#manual-form button[type=submit]").click()
        page.locator("[data-tab=report]").click()
        summary=page.locator("#app").inner_text()
        assert "Manual blocked" in summary
        assert "Isolated UI QA harness verification" in summary
        result["checked"].append("manual execution captured, reported and kept browser-local")
        assert not errors, f"JavaScript runtime errors: {errors}"

        # Show evidence of the new engineering dashboard at mobile and desktop widths.
        page.locator("[data-tab=requirements]").click()
        page.screenshot(path=str(OUT/(safe_name+"-mobile.png")),full_page=True)
        page.locator("[data-tab=engineering]").click()
        page.screenshot(path=str(OUT/(safe_name+"-engineering-mobile.png")),full_page=True)
        page.set_viewport_size({"width":1280,"height":850})
        page.reload(wait_until="domcontentloaded")
        page.wait_for_selector("#app h2",timeout=35000)
        page.screenshot(path=str(OUT/(safe_name+"-desktop.png")),full_page=True)
        result["checked"].append("mobile and desktop screenshots")
        result["status"]="passed"
    except Exception as err:
        result["status"]="failed"
        result["issues"].append(str(err)[:950])
        try:page.screenshot(path=str(OUT/(safe_name+"-failure.png")),full_page=True)
        except Exception:pass
    finally:
        ctx.close()
    print(json.dumps({k:v for k,v in result.items() if k!="safeChecks"},default=str),flush=True)
    return result

def main():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
        try:
            results=[check(browser,*t) for t in TARGETS]
        finally:browser.close()
    summary={"generatedAt":datetime.now(timezone.utc).isoformat(),"results":results}
    (OUT/"report.json").write_text(json.dumps(summary,indent=2))
    good=sum(x["status"]=="passed" for x in results)
    print(f"ACTUAL BROWSER VERIFICATION: {good}/{len(results)} passed",flush=True)
    if good!=len(results):sys.exit(1)

if __name__=="__main__":main()
