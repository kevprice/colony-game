window.ColonyApp = (() => {
  let activeScanner = null;

  async function api(path, options = {}) {
    const response = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  }

  function sessionIdFromPath() {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[1] || "";
  }

  function text(el, value) {
    el.textContent = value;
  }

  function html(el, value) {
    el.innerHTML = value;
  }

  async function startScanner(button, outputInput) {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera access is not available in this browser. Use manual token entry.");
      return;
    }
    if (typeof window.jsQR !== "function") {
      alert("QR decoder failed to load. Refresh the page and try again.");
      return;
    }
    if (activeScanner) {
      activeScanner.stop();
    }

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.innerHTML = `
      <div style="width:min(92vw,720px);background:#071019;border:1px solid #1f3646;border-radius:8px;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;">
          <strong>Scan QR Code</strong>
          <button id="closeScanner" style="width:auto;padding:8px 12px;">Cancel</button>
        </div>
        <video autoplay playsinline muted style="width:100%;border-radius:8px;background:#000;"></video>
        <p id="scannerStatus" style="margin:12px 0 0;color:#96b7c8;">Point the camera at a QR code.</p>
      </div>
    `;
    document.body.appendChild(overlay);

    const video = overlay.querySelector("video");
    const status = overlay.querySelector("#scannerStatus");
    const closeButton = overlay.querySelector("#closeScanner");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const originalText = button.textContent;
    button.textContent = "Scanning...";

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    video.srcObject = stream;
    await video.play();

    let stopped = false;
    let frameHandle = 0;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (frameHandle) cancelAnimationFrame(frameHandle);
      stream.getTracks().forEach((track) => track.stop());
      overlay.remove();
      button.textContent = originalText || "Scan QR";
      activeScanner = null;
    };
    activeScanner = { stop };
    closeButton.addEventListener("click", stop);

    const tick = () => {
      if (stopped) return;
      if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(image.data, image.width, image.height, {
          inversionAttempts: "attemptBoth"
        });
        if (code?.data) {
          outputInput.value = code.data;
          status.textContent = "QR detected.";
          stop();
          return;
        }
      }
      frameHandle = requestAnimationFrame(tick);
    };
    tick();
  }

  return { api, sessionIdFromPath, text, html, startScanner };
})();
