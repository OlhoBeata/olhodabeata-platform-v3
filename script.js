"use strict";

const CONFIG = window.APP_CONFIG;
const params = new URLSearchParams(window.location.search);
const photoId = params.get("photo");

const shell = document.querySelector(".shell");
const photo = document.getElementById("photo");
const loading = document.getElementById("loading");
const customerEmail = document.getElementById("customerEmail");
const emailError = document.getElementById("emailError");
const imageConsent = document.getElementById("imageConsent");
const emailConsent = document.getElementById("emailConsent");
const downloadConfirmation = document.getElementById("downloadConfirmation");
const downloadButton = document.getElementById("downloadButton");
const statusMessage = document.getElementById("statusMessage");

if (!photoId) {
  shell.innerHTML = `
    <header class="header">
      <h1>Fotografia não encontrada</h1>
      <p>O link utilizado não contém uma fotografia válida.</p>
    </header>
  `;
  throw new Error("Falta o parâmetro photo no endereço.");
}

const encodedPhotoId = photoId
  .split("/")
  .map(part => encodeURIComponent(part))
  .join("/");

const imageUrl =
  `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/f_auto,q_auto/${encodedPhotoId}`;

const downloadUrl =
  `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/fl_attachment/${encodedPhotoId}`;

photo.addEventListener("load", () => {
  loading.style.display = "none";
  photo.classList.add("visible");
});

photo.addEventListener("error", () => {
  loading.innerHTML =
    "<p>Não foi possível carregar a fotografia. Confirme se o link está correto.</p>";
  downloadButton.disabled = true;
});

photo.src = imageUrl;

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

customerEmail.addEventListener("input", () => {
  emailError.textContent = "";
});

downloadConfirmation.addEventListener("change", () => {
  downloadButton.disabled = !downloadConfirmation.checked;
});

async function registarDownload(email) {
  const response = await fetch(CONFIG.backend.workerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventCode: CONFIG.event.code,
      eventName: CONFIG.event.name,
      email,
      photoId,
      imageConsent: imageConsent.checked,
      emailConsent: emailConsent.checked,
      downloadedAt: new Date().toISOString(),
      pageUrl: window.location.href,
      userAgent: navigator.userAgent
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || `Worker respondeu ${response.status}`);
  }

  return result;
}

async function descarregarFotografia() {
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error(`Erro Cloudinary: ${response.status}`);
  }

  const blob = await response.blob();
  const temporaryUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = temporaryUrl;
  link.download = `fotografia-${photoId.split("/").pop()}.jpg`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(temporaryUrl), 5000);
}

function downloadAlternativo() {
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

downloadButton.addEventListener("click", async () => {
  const email = customerEmail.value.trim().toLowerCase();

  emailError.textContent = "";
  statusMessage.textContent = "";

  if (!email) {
    emailError.textContent = "Confirme o seu endereço de email.";
    customerEmail.focus();
    return;
  }

  if (!validarEmail(email)) {
    emailError.textContent = "Introduza um endereço de email válido.";
    customerEmail.focus();
    return;
  }

  downloadButton.disabled = true;
  downloadButton.textContent = "A preparar o download...";

  try {
    await descarregarFotografia();
  } catch (error) {
    console.warn("Download por Blob indisponível:", error);
    downloadAlternativo();
  }

  statusMessage.textContent = "Download iniciado com sucesso.";

  let downloadId = "";

  try {
    const result = await registarDownload(email);
    downloadId = result.downloadId || "";
  } catch (error) {
    console.error("O download foi feito, mas o registo falhou:", error);
  }

  setTimeout(() => {
    window.location.href = downloadId
      ? `success.html?downloadId=${encodeURIComponent(downloadId)}`
      : "success.html";
  }, 700);
});
