# Venta Catalog Studio. Supabase Setup

Bu uygulama yalnızca `venta-catalog-studio` Supabase projesini kullanır.

## Vercel environment variables

Vercel Dashboard > venta-catalog-studio > Settings > Environment Variables bölümüne şu değişkenleri ekleyin:

```text
VITE_SUPABASE_URL=https://idtsgmeljnfbydbsfspb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=Supabase Dashboard > Project Settings > API > Publishable key
```

Bu değişkenleri Production, Preview ve Development ortamlarına ekleyin. Değerler eklendikten sonra yeni bir deployment başlatın.

## Güvenlik

- Service role key'i istemciye, GitHub'a veya Vercel'in VITE_ önekli değişkenlerine eklemeyin.
- Katalog yetkileri Supabase RLS ile sınırlandırılır.
- `catalog_members` tablosuna kullanıcı rolü atanmadıkça giriş yapan kullanıcı katalog verilerine erişemez.

## İlk ekip üyesi

İlk yönetici hesabı Supabase Auth'ta oluşturulduktan sonra aynı kullanıcının UUID'siyle `catalog_members` tablosuna `manager` rolü eklenmelidir.
