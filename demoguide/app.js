/* DemoGuide: a client-side recording studio. No video is sent to a server. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const els = {
    modeScreen: $('modeScreen'), modeImport: $('modeImport'), screenSetup: $('screenSetup'), importSetup: $('importSetup'),
    demoUrl: $('demoUrl'), openDemo: $('openDemo'), videoInput: $('videoInput'), fileLabel: $('fileLabel'),
    startBtn: $('startBtn'), startText: $('startText'), stopBtn: $('stopBtn'), status: $('status'),
    canvas: $('previewCanvas'), overlay: $('previewOverlay'), screen: $('screenSource'), camera: $('cameraSource'),
    file: $('fileSource'), facePosition: $('facePosition'), faceSize: $('faceSize'), capability: $('capability'),
    timer: $('timer'), led: document.querySelector('.preview-led'), previewTitle: $('previewTitle'),
    previewDetails: $('previewDetails'), resultSection: $('resultSection'), resultVideo: $('resultVideo'),
    resultMeta: $('resultMeta'), downloadBtn: $('downloadBtn'), shareBtn: $('shareBtn'),
    installBtn: $('installBtn'), installDialog: $('installDialog'), installInstructions: $('installInstructions'),
    promptInstall: $('promptInstall'), howTitle: $('howTitle'), howIntro: $('howIntro'), howSteps: $('howSteps')
  };
  const ctx = els.canvas.getContext('2d', { alpha: false });
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
  const screenCapable = !!(window.isSecureContext && navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function');
  const recordCapable = !!(window.isSecureContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder && HTMLCanvasElement.prototype.captureStream);
  const state = { mode: screenCapable ? 'screen' : 'import', recording: false, starting: false, stopping: false,
    fileUrl: null, resultUrl: null, resultBlob: null, resultName: '', chunks: [], recorder: null,
    displayStream: null, faceStream: null, captureStream: null, outputStream: null, audioCtx: null,
    timerInterval: null, renderInterval: null, raf: 0, startedAt: 0, deferredPrompt: null, mime: '' };

  function status(message, error = false) { els.status.textContent = message; els.status.classList.toggle('error', error); }
  function formatTime(ms) { const s = Math.floor(Math.max(0, ms) / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function supportsMime(mime) { try { return MediaRecorder.isTypeSupported(mime); } catch (_) { return false; } }
  function pickMime() {
    const types = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/mp4', 'video/webm'];
    const isApple = /Safari/i.test(navigator.userAgent) && !/Chrome|CriOS|Edg|OPR/i.test(navigator.userAgent);
    const ordered = isApple ? [types[0], types[3], types[2], types[4]] : [types[1], types[2], types[4], types[0], types[3]];
    return ordered.find(supportsMime) || '';
  }
  function syncBusy() {
    const locked = state.recording || state.starting || state.stopping;
    els.modeScreen.disabled = locked; els.modeImport.disabled = locked; els.videoInput.disabled = locked;
    els.facePosition.disabled = locked; els.faceSize.disabled = locked;
    els.startBtn.hidden = state.recording;
    els.stopBtn.hidden = !state.recording;
    els.startBtn.disabled = locked || !recordCapable || (state.mode === 'screen' && !screenCapable) || (state.mode === 'import' && !state.fileUrl);
    els.startText.textContent = state.starting ? 'Preparing camera…' : 'Start recording';
  }
  function buildSteps() {
    const steps = state.mode === 'screen' ? [
      ['Open your demo', 'Open your live product URL in a separate browser window. Keep the recorder window visible if possible.'],
      ['Choose a screen', 'Press Start, grant camera and microphone access, and select a tab, window, or display to share.'],
      ['Guide & share', 'Talk through the product. Stop to generate one video with your face at the top-left.']
    ] : [
      ['Record the phone screen', 'Use the built-in iPhone or Android screen recorder while navigating your demo, then save the clip.'],
      ['Import & narrate', 'Import the clip here. Press Start and explain the video as it plays, using your selfie camera and mic.'],
      ['Save & send', 'When the video finishes, save the combined recording and share it with your customer.']
    ];
    els.howTitle.textContent = state.mode === 'screen' ? 'Three steps. One great demo.' : 'Your phone demo, with a personal touch.';
    els.howIntro.textContent = state.mode === 'screen' ? 'Best on Chrome, Edge, and desktop Safari.' : 'A practical workflow for iPhone and Android browsers.';
    els.howSteps.replaceChildren();
    steps.forEach(([heading, text], i) => {
      const card = document.createElement('article'); card.className = 'how-card';
      const n = document.createElement('span'); n.className = 'how-number'; n.textContent = String(i+1).padStart(2,'0');
      const h = document.createElement('h3'); h.textContent = heading;
      const p = document.createElement('p'); p.textContent = text;
      card.append(n, h, p); els.howSteps.append(card);
    });
  }
  function setMode(mode) {
    if (state.recording || state.starting || state.stopping) return;
    state.mode = mode;
    els.modeScreen.classList.toggle('active', mode === 'screen'); els.modeScreen.setAttribute('aria-pressed', String(mode === 'screen'));
    els.modeImport.classList.toggle('active', mode === 'import'); els.modeImport.setAttribute('aria-pressed', String(mode === 'import'));
    els.screenSetup.hidden = mode !== 'screen'; els.importSetup.hidden = mode !== 'import';
    els.overlay.hidden = mode === 'import' && !!state.fileUrl;
    if (mode === 'screen' && !screenCapable) status('This browser cannot capture your screen. Choose “Narrate a recording” instead.', true);
    else if (mode === 'import' && !state.fileUrl) status('Choose a saved screen recording to begin.');
    else status('Ready when you are.');
    buildSteps(); syncBusy(); drawPlaceholder();
  }
  function drawPlaceholder() {
    if (state.recording || state.starting) return;
    const w = els.canvas.width, h = els.canvas.height;
    ctx.fillStyle = '#0d1424'; ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w*.52,h*.5,10,w*.52,h*.5,w*.7);
    glow.addColorStop(0, '#1d2a43'); glow.addColorStop(1, '#0d1424'); ctx.fillStyle=glow; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = '#31405b'; ctx.lineWidth=2;ctx.strokeRect(w*.18,h*.2,w*.64,h*.6);
    ctx.fillStyle = '#1d2b42';ctx.fillRect(w*.18,h*.2,w*.64,h*.085);
    for(let i=0;i<3;i++){ctx.fillStyle=i===0?'#c5f381':'#53647e';ctx.beginPath();ctx.arc(w*.21+i*19,h*.244,5,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle = '#253754';ctx.fillRect(w*.22,h*.35,w*.28,h*.075);ctx.fillRect(w*.54,h*.35,w*.24,h*.075);
    ctx.fillStyle = '#273c54';ctx.fillRect(w*.22,h*.48,w*.56,h*.032);ctx.fillRect(w*.22,h*.55,w*.4,h*.032);
    ctx.fillStyle='#c5f381';ctx.fillRect(w*.22,h*.63,w*.24,h*.045);
    els.previewDetails.textContent = `${w} × ${h} preview`;
  }
  function resizeCanvas(video) {
    const vw = video.videoWidth || 1280, vh = video.videoHeight || 720;
    const maxSide = isMobile ? 1280 : 1600;
    const scale = Math.min(1, maxSide / Math.max(vw, vh));
    let w = Math.max(2, Math.round(vw * scale / 2) * 2), h = Math.max(2, Math.round(vh * scale / 2) * 2);
    if (!Number.isFinite(w) || !Number.isFinite(h)) { w=1280;h=720; }
    els.canvas.width = w; els.canvas.height = h;
    els.previewDetails.textContent = `${w} × ${h} export`;
  }
  function drawFrame() {
    const src = state.mode === 'screen' ? els.screen : els.file;
    const w=els.canvas.width,h=els.canvas.height;
    ctx.fillStyle='#060b16';ctx.fillRect(0,0,w,h);
    if(src.readyState >= 2 && src.videoWidth > 0) {
      const fit = Math.min(w/src.videoWidth,h/src.videoHeight); const dw=src.videoWidth*fit,dh=src.videoHeight*fit;
      try { ctx.drawImage(src,(w-dw)/2,(h-dh)/2,dw,dh); } catch (_) { /* wait for a valid frame */ }
    }
    const face=els.camera;
    if(face.readyState >= 2 && face.videoWidth>0) {
      const edge=Math.min(w,h), radius=Math.round(edge*(els.faceSize.value==='medium'?.145:.107));
      const pad=Math.round(edge*.036);const cx=els.facePosition.value==='tr'?w-pad-radius:pad+radius,cy=pad+radius;
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.closePath();ctx.shadowColor='#0009';ctx.shadowBlur=radius*.27;ctx.shadowOffsetY=radius*.08;ctx.fillStyle='#111b31';ctx.fill();ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.clip();
      const target=2*radius;const scale=Math.max(target/face.videoWidth,target/face.videoHeight);
      const cw=face.videoWidth*scale,ch=face.videoHeight*scale;
      ctx.translate(cx,cy);ctx.scale(-1,1);
      try { ctx.drawImage(face,-cw/2,-ch/2,cw,ch); } catch (_) { /* no camera frame yet */ }
      ctx.restore();ctx.beginPath();ctx.arc(cx,cy,radius-1,0,Math.PI*2);ctx.lineWidth=Math.max(3,edge*.006);
      ctx.strokeStyle='#ffffff';ctx.stroke();
    }
  }
  function renderLoop() {
    if (!state.recording && !state.starting) return;
    drawFrame(); state.raf=requestAnimationFrame(renderLoop);
  }
  function stopDrawing() { cancelAnimationFrame(state.raf);state.raf=0;if(state.renderInterval)clearInterval(state.renderInterval);state.renderInterval=null; }
  async function awaitVideo(video) {
    if (video.readyState >= 2 && video.videoWidth) return;
    await new Promise((resolve, reject) => {
      const t=setTimeout(()=>{cleanup();reject(new Error('The video source did not start. Please try again.'));},12000);
      const onReady=()=>{if(video.videoWidth){cleanup();resolve();}};
      const onErr=()=>{cleanup();reject(new Error('Cannot read the chosen video. Try a different MP4 or MOV file.'));};
      const cleanup=()=>{clearTimeout(t);video.removeEventListener('loadeddata',onReady);video.removeEventListener('error',onErr);};
      video.addEventListener('loadeddata',onReady);video.addEventListener('error',onErr);
    });
  }
  function stopTracks(stream) { if(stream) stream.getTracks().forEach(t=>{try{t.stop();}catch(_){}}); }
  function cleanupSources() {
    stopDrawing();stopTracks(state.displayStream);stopTracks(state.faceStream);stopTracks(state.captureStream);stopTracks(state.outputStream);
    state.displayStream=null;state.faceStream=null;state.captureStream=null;state.outputStream=null;
    els.screen.pause();els.screen.srcObject=null;els.camera.pause();els.camera.srcObject=null;
    if(state.audioCtx){state.audioCtx.close().catch(()=>{});state.audioCtx=null;}
    els.file.pause();
  }
  function finishUi() {
    state.recording=false;state.starting=false;state.stopping=false;
    clearInterval(state.timerInterval);state.timerInterval=null;
    els.led.classList.remove('live');els.previewTitle.textContent='STUDIO PREVIEW';syncBusy();
  }
  async function makeAudioStream() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      state.audioCtx=audioCtx;
      const dest=audioCtx.createMediaStreamDestination();
      if(state.faceStream.getAudioTracks().length){const mic=audioCtx.createMediaStreamSource(state.faceStream);mic.connect(dest);}
      if(state.mode==='screen' && state.displayStream && state.displayStream.getAudioTracks().length){
        try {const tab=audioCtx.createMediaStreamSource(state.displayStream);tab.connect(dest);} catch (_) { /* optional tab sound */ }
      }
      await audioCtx.resume();
      return dest.stream.getAudioTracks();
    } catch (_) {return state.faceStream.getAudioTracks();}
  }
  async function start() {
    if(state.recording||state.starting||state.stopping) return;
    if(!recordCapable){status('Camera/video recording needs HTTPS and a compatible browser.',true);return;}
    if(state.mode==='screen'&&!screenCapable){status('Screen capture is unavailable here. Import a screen recording instead.',true);return;}
    if(state.mode==='import'&&!state.fileUrl){status('Choose a video before recording.',true);return;}
    state.starting=true;syncBusy();els.resultSection.hidden=true;status('Requesting your recording permissions…');
    try {
      let src;
      if(state.mode==='screen') {
        // Must be called in the user's click activation. Browser prompts for each session.
        state.displayStream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
        src=els.screen;src.srcObject=state.displayStream;src.muted=true;await src.play();
        state.displayStream.getVideoTracks()[0].addEventListener('ended',()=>{if(state.recording)stop();});
      } else {
        src=els.file;src.currentTime=0;
        src.muted=true; // imported footage is visually re-narrated; audio comes from microphone
        // A muted play call is allowed on iPhone without an extra gesture.
        await src.play();src.pause();src.currentTime=0;
      }
      await awaitVideo(src);
      state.faceStream=await navigator.mediaDevices.getUserMedia({
        video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},
        audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}
      });
      els.camera.srcObject=state.faceStream;els.camera.muted=true;await els.camera.play();await awaitVideo(els.camera);
      resizeCanvas(src);els.overlay.hidden=true;
      const canvasStream=els.canvas.captureStream(isMobile?24:30);state.captureStream=canvasStream;
      const audioTracks=await makeAudioStream();
      state.outputStream=new MediaStream([...canvasStream.getVideoTracks(),...audioTracks]);
      const mime=pickMime(); state.mime=mime;
      const options=mime?{mimeType:mime,videoBitsPerSecond:isMobile?2400000:4200000}:{videoBitsPerSecond:isMobile?2400000:4200000};
      state.recorder=new MediaRecorder(state.outputStream,options);
      state.chunks=[];
      state.recorder.addEventListener('dataavailable',event=>{if(event.data&&event.data.size)state.chunks.push(event.data);});
      state.recorder.addEventListener('error',event=>{status('Recording encountered an error: '+(event.error?.message||'Unknown issue'),true);stop();});
      state.recorder.addEventListener('stop',onRecorded,{once:true});
      state.recording=true;state.starting=false;state.startedAt=Date.now();
      drawFrame();renderLoop();
      // A second draw timer helps on systems that reduce animation frames in an unfocused window.
      if(!isMobile)state.renderInterval=setInterval(()=>{if(state.recording&&document.hidden)drawFrame();},1000/8);
      state.recorder.start(1000);
      if(state.mode==='import') { await els.file.play();els.file.onended=()=>{if(state.recording)stop();}; }
      els.timer.textContent='00:00';state.timerInterval=setInterval(()=>{els.timer.textContent=formatTime(Date.now()-state.startedAt);},250);
      els.led.classList.add('live');els.previewTitle.textContent='RECORDING';
      status(state.mode==='import'?'Narrate as your imported video plays. Keep this app open.':'Recording. Present your demo, then return to stop. Keep this recorder window visible if possible.');
      syncBusy();
    } catch (error) {
      const msg=error?.name==='NotAllowedError'?'Permission denied or screen selection cancelled. Please allow camera, mic, and screen access.':error?.message||'Could not start recording.';
      status(msg,true);cleanupSources();finishUi();drawPlaceholder();els.overlay.hidden=state.mode!=='screen'&&!!state.fileUrl;
    }
  }
  function stop() {
    if(!state.recording||state.stopping)return;
    state.stopping=true;status('Finishing your video…');syncBusy();
    try {if(state.recorder?.state==='recording'||state.recorder?.state==='paused')state.recorder.stop();else onRecorded();}
    catch (_) {onRecorded();}
  }
  function onRecorded() {
    const mime=state.recorder?.mimeType||state.mime||'video/webm';
    const blob=new Blob(state.chunks,{type:mime});
    cleanupSources();finishUi();
    state.recorder=null;state.chunks=[];
    if(!blob.size){status('No video data was produced. Try a shorter recording or another browser.',true);return;}
    if(state.resultUrl)URL.revokeObjectURL(state.resultUrl);
    state.resultBlob=blob;state.resultUrl=URL.createObjectURL(blob);
    const ext=mime.includes('mp4')?'mp4':'webm';
    const stamp=new Date().toISOString().slice(0,19).replaceAll(':','-');
    state.resultName=`DemoGuide-${stamp}.${ext}`;
    els.resultVideo.src=state.resultUrl;
    els.resultMeta.textContent=`${(blob.size/(1024*1024)).toFixed(1)} MB · ${ext.toUpperCase()} · Saved locally when you choose`;
    els.resultSection.hidden=false;
    status('Your video is ready. Save it or share it with your customer.');
    els.resultSection.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function download() {
    if(!state.resultBlob)return;
    const a=document.createElement('a');a.href=state.resultUrl;a.download=state.resultName;document.body.append(a);a.click();a.remove();
    status('Save requested. Check your browser Downloads or Files.');
  }
  async function share() {
    if(!state.resultBlob)return;
    const file=new File([state.resultBlob],state.resultName,{type:state.resultBlob.type||'video/webm'});
    if(navigator.canShare?.({files:[file]})&&navigator.share){
      try{await navigator.share({title:'My product walkthrough',files:[file]});status('Share sheet opened.');}
      catch(e){if(e.name!=='AbortError')status('Sharing failed. Use Save video instead.',true);}
    }else{download();status('Direct file sharing is unavailable here. Save the video, then send it normally.');}
  }
  async function loadFile(file) {
    if(state.recording||state.starting||state.stopping)return;
    if(!file)return;
    if(!file.type.startsWith('video/')&&!/\.(mp4|mov|webm|m4v)$/i.test(file.name)){status('Select a supported video file (MP4, MOV, or WebM).',true);return;}
    if(state.fileUrl)URL.revokeObjectURL(state.fileUrl);
    state.fileUrl=URL.createObjectURL(file);els.file.src=state.fileUrl;els.file.load();
    els.fileLabel.textContent=`${file.name} · ${(file.size/(1024*1024)).toFixed(1)} MB`;
    els.overlay.hidden=true;status('Video imported. Press Start when you are ready to narrate.');syncBusy();
    try{
      await new Promise((resolve,reject)=>{
        if(els.file.readyState>=1)return resolve();
        const onOk=()=>{clear();resolve();};const onBad=()=>{clear();reject(new Error('This video could not be opened.'));};
        const clear=()=>{els.file.removeEventListener('loadedmetadata',onOk);els.file.removeEventListener('error',onBad);};
        els.file.addEventListener('loadedmetadata',onOk,{once:true});els.file.addEventListener('error',onBad,{once:true});
      });
      resizeCanvas(els.file);drawFrame();
    }catch(e){status(e.message,true);}
  }
  function openDemo() {
    let url=els.demoUrl.value.trim();if(!url){status('Enter the address of your live demo first.',true);return;}
    if(!/^https?:\/\//i.test(url))url='https://'+url;
    let parsed;try{parsed=new URL(url);if(!['http:','https:'].includes(parsed.protocol))throw new Error('Bad URL');}catch(_){status('Enter a valid web URL.',true);return;}
    // The saved preference contains only the typed URL, never recordings.
    try{localStorage.setItem('demoguide-last-url',parsed.href);}catch(_){}
    const tab=window.open(parsed.href,'_blank','noopener,noreferrer');
    status(tab===null?'Your browser may have blocked the new tab. Allow popups or open the URL manually.':'Demo opened. Return here to start recording.');
  }
  function installHelp() {
    els.installInstructions.replaceChildren();
    const chunks=[];
    if(/iPhone|iPad|iPod/i.test(navigator.userAgent)){
      chunks.push('In Safari or Chrome on iPhone, tap Share, then choose <strong>Add to Home Screen</strong>.');
      chunks.push('Tap <strong>Add</strong>. DemoGuide will now appear as an app icon on your home screen.');
      chunks.push('iOS 26 browsers cannot capture other apps’ screens; use <strong>Narrate a recording</strong> to create a phone walkthrough.');
    }else if(/Android/i.test(navigator.userAgent)){
      chunks.push('In Chrome, tap the <strong>⋮ menu</strong>, then <strong>Install app</strong> or <strong>Add to Home screen</strong>.');
      chunks.push('Open DemoGuide from your launcher. Use <strong>Narrate a recording</strong> if direct screen capture is unavailable.');
    }else{
      chunks.push('In desktop Chrome or Edge, use the install icon in the address bar or the browser menu → <strong>Install DemoGuide</strong>.');
      chunks.push('On a Mac using Safari, choose <strong>File → Add to Dock</strong>.');
      chunks.push('You can also bookmark the page or drag its URL to the desktop to make a shortcut.');
    }
    chunks.forEach(html=>{const div=document.createElement('div');div.className='instruction';div.innerHTML=html;els.installInstructions.append(div);});
    els.promptInstall.hidden=!state.deferredPrompt;
    if(typeof els.installDialog.showModal==='function')els.installDialog.showModal();else alert(els.installInstructions.textContent);
  }
  async function triggerInstall() {
    if(!state.deferredPrompt)return installHelp();
    try {state.deferredPrompt.prompt();await state.deferredPrompt.userChoice;}catch(_){}finally{state.deferredPrompt=null;els.installDialog.close();}
  }
  function init() {
    if(!recordCapable){els.capability.classList.add('limited');els.capability.lastChild.textContent='Preview only on this browser';}
    else if(!screenCapable){els.capability.classList.add('limited');els.capability.lastChild.textContent='Phone-friendly narration mode';}
    else {els.capability.lastChild.textContent='Live recording supported';}
    try{els.demoUrl.value=localStorage.getItem('demoguide-last-url')||'';}catch(_){}
    els.modeScreen.addEventListener('click',()=>setMode('screen'));els.modeImport.addEventListener('click',()=>setMode('import'));
    els.openDemo.addEventListener('click',openDemo);els.videoInput.addEventListener('change',e=>loadFile(e.target.files?.[0]));
    els.startBtn.addEventListener('click',start);els.stopBtn.addEventListener('click',stop);
    els.downloadBtn.addEventListener('click',download);els.shareBtn.addEventListener('click',share);
    els.installBtn.addEventListener('click',installHelp);els.promptInstall.addEventListener('click',triggerInstall);
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferredPrompt=e;});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.recording)drawFrame();});
    window.addEventListener('beforeunload',e=>{if(state.recording){e.preventDefault();e.returnValue='';}});
    setMode(state.mode);
    if('serviceWorker' in navigator && window.isSecureContext){navigator.serviceWorker.register('./service-worker.js').catch(()=>{});}
  }
  init();
})();
