// Live Render smoke verification for application-specific QA Benches.
// Makes read-only GET requests and validates real HTML. No application mutations.
const targets = [
  ["Project-Program-Manager", "https://project-program-manager.onrender.com/qa-bench.html", "Project / Program Manager"],
  ["FrameOps", "https://frameops-operations.onrender.com/qa-bench.html", "FrameOps"],
  ["CommerceDesk", "https://commercedesk.onrender.com/qa-bench.html", "CommerceDesk"],
  ["IdentityFlow", "https://identityflow.onrender.com/qa-bench.html", "IdentityFlow"],
  ["DeliveryCommand", "https://deliverycommand.onrender.com/qa-bench.html", "DeliveryCommand"],
  ["IntegrationCommand", "https://integrationcommand-1.onrender.com/qa-bench.html", "IntegrationCommand"],
  ["QualityCommand", "https://qualitycommand.onrender.com/qa-bench.html", "QualityCommand"],
  ["ProductLens", "https://productlens-ab9d.onrender.com/qa-bench.html", "ProductLens"],
  ["ScopePilot", "https://scopepilot-etgt.onrender.com/qa-bench.html", "ScopePilot"],
  ["BuildEstimate", "https://buildestimate-82xs.onrender.com/qa-bench.html", "BuildEstimate"]
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = new Map();
async function check([name, url, configName]) {
  try {
    const response = await fetch(url, {
      headers: { "Cache-Control":"no-cache", "User-Agent":"QA-Portfolio-CI/1.0" },
      signal: AbortSignal.timeout(75000),
      redirect: "follow"
    });
    const html = (await response.text()).slice(0, 120000);
    const match = html.match(/<script id="qa-config" type="application\/json">([\s\S]*?)<\/script>/);
    if (!response.ok) throw Error("HTTP " + response.status);
    if (!match) throw Error("QA configuration absent (stale or misrouted page)");
    const config = JSON.parse(match[1]);
    if (config.name !== configName) throw Error("QA configuration belongs to " + config.name);
    if (!html.includes("data-tab=\"automation\"") || !html.includes("Manual execution")) throw Error("QA lifecycle UI incomplete");
    if (config.requirements.length < 4 || config.cases.length < 5 || config.automatic.length < 4) throw Error("Incomplete app-specific test inventory");
    return {name,status:"LIVE",http:response.status,requirements:config.requirements.length,manualCases:config.cases.length,automatedChecks:config.automatic.length,url};
  } catch (err) {
    return {name,status:"NOT VERIFIED",error:String(err.message).slice(0,170),url};
  }
}
for(let round=1;round<=3;round++){
  const pending=targets.filter(t=>results.get(t[0])?.status!=="LIVE");
  if(!pending.length) break;
  console.log("Deployment verification round "+round+" — "+pending.length+" remaining");
  // Verify independent Render services in parallel; each check is a safe GET.
  const checked=await Promise.all(pending.map(check));
  for(const r of checked){results.set(r.name,r);console.log(JSON.stringify(r));}
  if([...results.values()].every(x=>x.status==="LIVE"))break;
  if(round<3)await sleep(10000);
}
const list=targets.map(t=>results.get(t[0])||{name:t[0],status:"NOT VERIFIED",error:"No result"});
console.log("\nFINAL RESULT\n"+JSON.stringify(list,null,2));
const fs=await import("node:fs");
fs.mkdirSync("artifacts",{recursive:true});
fs.writeFileSync("artifacts/qa-live-deploy-verification.json",JSON.stringify({verifiedAt:new Date().toISOString(),results:list},null,2));
const ok=list.filter(x=>x.status==="LIVE").length;
console.log("Verified "+ok+"/"+list.length+" deployed QA Benches");
if(ok!==list.length) process.exitCode=1;
