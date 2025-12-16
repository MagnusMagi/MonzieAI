# Cursor'da RevenueCat MCP Ekleme

Cursor'da RevenueCat MCP sunucusunu manuel olarak eklemeniz gerekiyor.

## Adım Adım Kurulum

### 1. Cursor Settings'i Açın
- Cursor'da `Cmd + ,` (Mac) veya `Ctrl + ,` (Windows/Linux) tuşlarına basın
- Veya menüden: **Cursor → Settings** (veya **Preferences**)

### 2. Tools & MCP Bölümüne Gidin
- Sol menüden **"Tools & MCP"** seçeneğine tıklayın
- Sağ tarafta **"Installed MCP Servers"** bölümünü göreceksiniz

### 3. Yeni MCP Sunucusu Ekle
- **"New MCP Server"** butonuna tıklayın (sağ altta + ikonu ile)

### 4. RevenueCat MCP Yapılandırması

Açılan formda aşağıdaki bilgileri girin:

**Server Name:**
```
revenuecat
```

**Server Type:**
```
HTTP
```

**Server URL:**
```
https://mcp.revenuecat.ai/mcp
```

**Headers:**
```json
{
  "Authorization": "Bearer sk_ttLDinvdWUQOxzTGfnVZcZrXSVUvM"
}
```

**Description (Opsiyonel):**
```
RevenueCat subscription management via MCP
```

### 5. Kaydet ve Test Et
- **"Save"** veya **"Add"** butonuna tıklayın
- Sunucu listede görünmeli ve "enabled" durumunda olmalı

### 6. Doğrulama
Cursor'da şu komutu deneyin:
```
Show me my RevenueCat project details
```

Eğer çalışıyorsa, RevenueCat MCP başarıyla eklendi!

## Alternatif: JSON Yapılandırması

Eğer Cursor JSON formatında yapılandırma istiyorsa, şu formatı kullanın:

```json
{
  "name": "revenuecat",
  "type": "http",
  "url": "https://mcp.revenuecat.ai/mcp",
  "headers": {
    "Authorization": "Bearer sk_ttLDinvdWUQOxzTGfnVZcZrXSVUvM"
  }
}
```

## Sorun Giderme

### Sunucu Görünmüyor
- Cursor'ı tamamen kapatıp yeniden başlatın
- Settings → Tools & MCP'ye tekrar gidin
- "New MCP Server" butonunun görünür olduğundan emin olun

### Bağlantı Hatası
- API key'in doğru olduğundan emin olun (`sk_` ile başlamalı)
- URL'nin doğru olduğundan emin olun: `https://mcp.revenuecat.ai/mcp`
- Headers formatının doğru olduğundan emin olun

### "Error - Show Output" Mesajı
- Sunucu yapılandırmasını kontrol edin
- API key'in geçerli olduğundan emin olun
- RevenueCat Dashboard'dan yeni bir API v2 Secret Key oluşturmayı deneyin

## Notlar

- API key güvenliği için, bu key'i asla public repository'lere commit etmeyin
- Farklı ortamlar için farklı API key'ler kullanabilirsiniz
- RevenueCat MCP HTTP tabanlıdır, bu yüzden internet bağlantısı gereklidir

