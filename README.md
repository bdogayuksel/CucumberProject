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