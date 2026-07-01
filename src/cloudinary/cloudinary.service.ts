import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (cloudinaryUrl) {
      try {
        const u = new URL(cloudinaryUrl);
        const cloudName = u.hostname;
        const apiKey = decodeURIComponent(u.username);
        const apiSecret = decodeURIComponent(u.password);

        if (!cloudName || !apiKey || !apiSecret)
          throw new Error('Invalid CLOUDINARY_URL');

        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
        return;
      } catch {
        throw new InternalServerErrorException('CLOUDINARY_URL inválida.');
      }
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'Faltan variables de Cloudinary. Usa CLOUDINARY_URL o CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET.',
      );
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  }

  // SUBE UN ARCHIVO (IMAGEN O PDF) A CLOUDINARY
  async uploadFile(params: {
    file: Express.Multer.File;
    folder: string;
    publicId?: string;
  }): Promise<{ secureUrl: string; publicId: string; resourceType: 'image' | 'raw' }> {
    const { file, folder, publicId } = params;

    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    const isImage = file.mimetype.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
    const isPdf = file.mimetype === 'application/pdf' || ext === 'pdf';

    if (!isImage && !isPdf) {
      throw new BadRequestException('Tipo de archivo no soportado. Solo imágenes o PDF.');
    }

    const resourceType: 'image' | 'raw' = isImage ? 'image' : 'raw';
    const pid = publicId ?? `file_${Date.now()}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, public_id: pid, resource_type: resourceType },
        (error, result) => {
          if (error || !result?.secure_url) {
            return reject(new InternalServerErrorException('Error al subir archivo a Cloudinary.'));
          }
          resolve({ secureUrl: result.secure_url, publicId: result.public_id, resourceType });
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  // ELIMINA UN ARCHIVO DE CLOUDINARY
  async deleteFile(publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: resourceType });
    } catch {
      throw new InternalServerErrorException('Error al eliminar archivo de Cloudinary.');
    }
  }
}
