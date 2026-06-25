import { supabase } from './supabase'

const BUCKET = process.env.SUPABASE_S3_BUCKET || 'proof_of_score'

export async function uploadProofImage(
  buffer: Buffer,
  contentType: string,
  fileName: string,
): Promise<string> {
  const filePath = `proofs/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType, upsert: true })

  if (uploadError) {
    if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
      await supabase.storage.createBucket(BUCKET, { public: true })
      const { error: retryError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, { contentType, upsert: true })
      if (retryError) throw new Error(`Upload failed after bucket creation: ${retryError.message}`)
    } else {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }
  }

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return publicUrl.publicUrl
}