OLHO DA BEATA PLATFORM V3
=========================

Ficheiros incluídos
-------------------
index.html          Página de download
style.css           Estilos comuns
script.js           Download, validação e encaminhamento para Instagram
success.html        Página final com botão para @by.iapmei
upload.html         Página de upload
upload.js           Upload Cloudinary + envio EmailJS
config.js           Configuração central
email-template.html Corpo do template EmailJS

CONFIGURAÇÃO OBRIGATÓRIA
------------------------
1. Abrir config.js.
2. Substituir:
   COLOQUE_AQUI_A_PUBLIC_KEY
   pela Public Key real do EmailJS.

3. O Cloudinary já está configurado:
   cloudName: lim5fdgq
   uploadPreset: olhodabeata_upload

4. O Instagram está configurado para:
   https://www.instagram.com/by.iapmei/

5. workerUrl está vazio.
   O download funciona, mas ainda não grava numa base de dados nem envia
   a notificação de confirmação. Essa ligação será feita na fase seguinte.

PUBLICAÇÃO
----------
Carregar todos estes ficheiros para a raiz do novo repositório GitHub.
Depois ligar o repositório ao Cloudflare Pages.

TESTE
-----
Abrir /upload.html
Selecionar fotografia
Introduzir email
Enviar

ATENÇÃO
-------
Enquanto a Public Key do EmailJS não estiver configurada, o upload e a criação
do link funcionam, mas o email ao cliente não é enviado.
