# Matriz Oficial de Plataformas & Limitações Reais de APIs

Em conformidade com as regras do sistema, não são utilizadas técnicas de scraping, webdrivers ou endpoints não documentados. Recursos indisponíveis são marcados com `UNSUPPORTED`.

| Plataforma | API Oficial Utilizada | Vídeo Padrão | Vídeo Curto / Reel | Imagem | Carrossel | Agendamento Nativo | Comentários & Resposta | Observações de Quota & Escopos |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **YouTube** | YouTube Data API v3 | SIM | SIM (Shorts) | NÃO | NÃO | SIM | SIM | Upload consome 1.600 das 10.000 unidades diárias da cota padrão. |
| **Instagram** | Meta Graph API (Instagram Pro) | SIM | SIM (Reel) | SIM | SIM | SIM | SIM | Requer conta Business/Creator vinculada a Página Facebook. Stories diretos não são suportados. |
| **Facebook** | Meta Graph API (Páginas) | SIM | SIM (Reels) | SIM | NÃO | SIM | SIM | Requer permissão `pages_manage_posts`. Cada Página é um destino isolado. |
| **TikTok** | Content Posting API v2 | SIM | SIM | NÃO | NÃO | SIM | NÃO (Standard) | Distinção entre Direct Post (`video.publish`) e Draft (`video.upload`). |
| **Kwai** | Kwai Open API | SIM | SIM | NÃO | NÃO | NÃO (Agendador interno) | NÃO | Sujeito a aprovação prévia no programa de parceiros corporativos. |
