"use strict";

const CONFIG = window.APP_CONFIG;

const fileInput = document.getElementById("uploadPhoto");
const emailInput = document.getElementById("recipientEmail");
const uploadButton = document.getElementById("uploadButton");
const uploadStatus = document.getElementById("uploadStatus");
const resultBox = document.getElementById("resultBox");
const resultLink = document.getElementById("resultLink");
const copyButton = document.getElementById("copyButton");

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function inicializarEmailJS() {
  const cfg = CONFIG.emailjs;
  if (!cfg.enabled || !cfg.publicKey || cfg.publicKey.includes("COLOQUE_AQUI")) return false;
  emailjs.init({ publicKey: cfg.publicKey });
  return true;
}

const emailjsReady = inicializarEmailJS();

async function enviarEmail(email, downloadLink) {
  if (!emailjsReady) {
    console.warn("EmailJS não configurado. O link foi criado, mas o email não foi enviado.");
    return false;
  }

  await emailjs.send(
    CONFIG.emailjs.serviceId,
    CONFIG.emailjs.templateId,
    {
      to_email: email,
      customer_email: email,
      download_link: downloadLink
    }
  );

  return true;
}

uploadButton.addEventListener("click", async () => {
  const file = fileInput.files[0];
  const email = emailInput.value.trim().toLowerCase();

  uploadStatus.textContent = "";
  resultBox.classList.remove("visible");

  if (!file) {
    uploadStatus.textContent = "Selecione uma fotografia.";
    return;
  }

  if (!validarEmail(email)) {
    uploadStatus.textContent = "Introduza um email válido.";
    emailInput.focus();
    return;
  }

  uploadButton.disabled = true;
  uploadButton.textContent = "A enviar...";

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CONFIG.cloudinary.uploadPreset);
    formData.append("folder", CONFIG.event.code);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CONFIG.cloudinary.cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Cloudinary ${response.status}: ${detail}`);
    }

    const data = await response.json();
    const downloadLink =
      `${CONFIG.download.baseUrl}/?photo=${encodeURIComponent(data.public_id)}`;

    resultLink.href = downloadLink;
    resultLink.textContent = downloadLink;
    resultBox.classList.add("visible");

    const sent = await enviarEmail(email, downloadLink);

    uploadStatus.textContent = sent
      ? "Fotografia enviada e email entregue ao cliente."
      : "Fotografia enviada. Falta configurar a Public Key do EmailJS para enviar o email.";
  } catch (error) {
    console.error(error);
    uploadStatus.textContent = "Não foi possível concluir o envio. Consulte a consola para mais detalhes.";
  } finally {
    uploadButton.disabled = false;
    uploadButton.textContent = "Enviar fotografia";
  }
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultLink.href);
    copyButton.textContent = "Link copiado";
    setTimeout(() => copyButton.textContent = "Copiar link", 1800);
  } catch {
    window.prompt("Copie o link:", resultLink.href);
  }
});
