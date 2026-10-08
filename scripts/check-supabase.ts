import { getSupabase } from '../server/supabase.ts'
import { IMAGE_BUCKET, MAX_IMAGE_BYTES } from '../src/lib/uploadRules.ts'

try {
  const client = getSupabase()
  const [products, bucket, profiles] = await Promise.all([
    client.from('products').select('id,owner_id').limit(1),
    client.storage.getBucket(IMAGE_BUCKET),
    client.from('profiles').select('id').limit(1),
  ])
  if (products.error) {
    console.error(products.error.code === 'PGRST205'
      ? 'Products table is missing. Run supabase/migrations/20261008000100_create_products.sql in SQL Editor.'
      : ['42703', 'PGRST204'].includes(products.error.code)
        ? 'Product ownership is missing. Run supabase/migrations/20261008000200_product_ownership.sql.'
        : 'Products check failed. Check the server URL/key, table grants, and network access.')
    process.exitCode = 1
  } else { console.log('Products table: reachable.') }
  if (profiles.error) {
    console.error('Private profiles table check failed. Run supabase/migrations/20261008000300_artisan_profiles.sql and check server grants.')
    process.exitCode = 1
  } else { console.log('Private profiles table: reachable.') }
  if (bucket.error || !bucket.data) {
    console.error('Image bucket is unavailable. Run the setup migration and check server credentials.')
    process.exitCode = 1
  } else if (!bucket.data.public || bucket.data.file_size_limit !== MAX_IMAGE_BYTES ||
    !bucket.data.allowed_mime_types ||
    [...bucket.data.allowed_mime_types].sort().join(',') !== ['image/jpeg', 'image/png', 'image/webp'].sort().join(',')) {
    console.error('Image bucket settings differ: expected public, 2 MiB maximum, JPEG/PNG/WebP only.')
    process.exitCode = 1
  } else { console.log('Image bucket: reachable with the expected size/type limits.') }
} catch {
  console.error('Supabase check failed. Verify .env.local and your network connection.')
  process.exitCode = 1
}
