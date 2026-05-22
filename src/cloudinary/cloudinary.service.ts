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

        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true,
        });

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

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadImage(params: {
    file: Express.Multer.File;
    folder: string;
    publicId?: string;
  }): Promise<{ secureUrl: string; publicId: string }> {
    const { file, folder, publicId } = params;

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Solo se permiten imágenes.');
    }

    const pid = publicId ?? `img_${Date.now()}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, public_id: pid, resource_type: 'image' },
        (error, result) => {
          if (error || !result?.secure_url) {
            return reject(new InternalServerErrorException('Error al subir imagen a Cloudinary.'));
          }
          resolve({ secureUrl: result.secure_url, publicId: result.public_id });
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async uploadFile(params: {
    file: Express.Multer.File;
    folder: string;
    publicId?: string;
  }): Promise<{ secureUrl: string; publicId: string }> {
    const { file, folder, publicId } = params;

    const isImage = file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf';
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
          resolve({ secureUrl: result.secure_url, publicId: result.public_id });
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: resourceType });
    } catch {
      throw new InternalServerErrorException('Error al eliminar archivo de Cloudinary.');
    }
  }
}
