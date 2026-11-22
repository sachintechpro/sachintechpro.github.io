# DemoGuide — Installable product demo recorder

DemoGuide is an installable, browser-based recording studio for customer walkthroughs. It records a live desktop screen with webcam and microphone, or re-narrates an imported screen recording with a selfie-camera bubble on supported mobile browsers.

## Open and install

Live web app (once this folder is published from GitHub Pages): https://sachintechpro.github.io/demoguide/

- **iPhone Safari or Chrome:** Open the website → Share → **Add to Home Screen** → Add.
- **Android Chrome:** Open the website → ⋮ menu → **Install app** / Add to Home screen.
- **Desktop Chrome / Edge:** Use the Install icon in the address bar, or browser menu → Install DemoGuide.
- **Mac Safari:** File → **Add to Dock**.

It opens with an app icon and standalone window. The app shell can load offline after first visit; recording still needs browser/device support, and opening online demo URLs needs a connection.

## Record a live desktop walkthrough

1. Paste the product demo URL and choose **Open**.
2. Keep DemoGuide in a separate visible window when practical (not minimized). Press **Start recording**.
3. Allow camera and microphone, and select your browser tab, app window, or screen from the system picker.
4. Walk through the demo and narrate. Return to DemoGuide and choose **Stop & finish**.
5. Preview the final video and choose **Save video** or **Share video**.

Browser screen-recording requires HTTPS and an explicit selection for every recording. Recording quality may decrease when the recorder window is hidden or minimized; test on the target browser.

## Record from a phone

1. Use the phone's built-in **Screen Recording** control while walking through the demo.
2. Save the clip to Photos / Files.
3. In DemoGuide select **Narrate a recording** and import that saved clip.
4. Press **Start recording**, allow selfie camera and microphone, and speak over the video as it plays.
5. Keep DemoGuide foregrounded; then save/share the composite.

On iOS 26 and most Android browsers, `getDisplayMedia` screen capture of another app/tab is not available to websites. Importing a pre-recorded screen clip is the web workaround. Mobile video composition and export are browser/phone dependent and should be tested on target devices. Original imported audio is muted; the exported soundtrack is new microphone narration.

## Privacy & limitations

- No account, server upload, analytics, or backend. Clips exist only in browser memory until you save/share; closing the page discards unsaved clips.
- The app saves the *most recently typed demo URL* in local browser preferences, but not video or camera footage.
- Permission prompts are mandatory. HTTPS hosting is required, except localhost development.
- Imported long/4K footage can use significant memory; aim for short clips (2–5 minutes) on phones.
- Some mobile Safari configurations may fail simultaneous camera/video playback or MediaRecorder export. When that happens, a native recorder such as the included iOS project is required for reliable live screen + facecam recording.
- Recording third-party apps or customer information should only happen with permission.

## Local development

Serve these files on a local server (camera access works on localhost):

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/ . Directly opening `index.html` with `file://` may prevent recording and PWA installation.

This is a static PWA: HTML, CSS, JS, service worker, and manifest, deployable to GitHub Pages, Render Static Site, Vercel, or another HTTPS host.