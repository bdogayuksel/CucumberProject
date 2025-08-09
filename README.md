# AI Ürün Görseli — MVP (UI Sürümü)

Basit bir web arayüzü: görsel yükle, prompt yaz, sahte (placeholder) bir sonuç görüntüle.

Entegrasyon daha sonra `lib/fal.js` üzerinden eklenecektir.

## Çalıştırma

Statik dosyaları herhangi bir HTTP sunucusu ile servis edebilirsiniz.

```bash
# proje kökünde
python3 -m http.server 5173
# ardından tarayıcıda: http://localhost:5173/
```

Alternatif:

```bash
npx serve .
```

## Dosyalar
- `index.html`: Arayüz iskeleti
- `styles.css`: Basit stiller
- `app.js`: UI davranışı ve placeholder çıktı üretimi (canvas)
- `lib/fal.js`: FAL.AI entegrasyonu için yer tutucular

## Notlar
- Şu an gerçek model çağrısı yapılmıyor.
- Gerçekleştiğinde, `@fal-ai/client` ile `removeBackground` ve `replaceBackground` fonksiyonlarını bağlayacağız.

## Sunucu (IC-Light proxy)

Fal.ai anahtarınızı `.env` içine ekleyin:

```
cp .env.example .env
# .env dosyasını açıp FAL_KEY değerini girin
```

Bağımlılıkları yükleyin ve sunucuyu başlatın:

```bash
npm install
npm run dev
# Sunucu: http://localhost:8787
```

İstemciden çağırma (örnek):

```js
import { generateICLightViaServer } from './lib/fal.js';

// URL ile
await generateICLightViaServer({
  imageFileOrUrl: 'https://example.com/image.png',
  prompt: 'light grey seamless studio background',
  imageSize: 'square',
  outputFormat: 'png',
});

// Dosya ile
const file = new File([/* ... */], 'product.png', { type: 'image/png' });
await generateICLightViaServer({ imageFileOrUrl: file, prompt: 'soft shadow studio' });
```