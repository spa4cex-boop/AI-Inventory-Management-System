import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { firebaseStorage } from '../firebase/firebaseClient'

export async function uploadProductImage(file: File) {
  if (!firebaseStorage) {
    throw new Error('Firebase storage is not initialized')
  }

  const imageRef = ref(firebaseStorage, `product-images/${Date.now()}-${file.name}`)
  const uploadTask = uploadBytesResumable(imageRef, file)

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      undefined,
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        resolve(url)
      }
    )
  })
}
