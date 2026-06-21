import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) { }

  // METODO PARA COMPLETAR EL PERFIL DEL USUARIO, SE PERMITE AGREGAR HASTA 3 NUMEROS DE CONTACTO
  async completeProfile(userId: string, dto: CompleteProfileDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Perfil no encontrado');

    await this.prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { userId },
        data: { firstName: dto.firstName, lastName: dto.lastName },
      });

      if (dto.phones && dto.phones.length > 0) {
        const existing = await tx.contact.findMany({
          where: {
            profileId: profile.id
          }

        });
        if (existing.length + dto.phones.length > 3) {
          throw new BadRequestException('Máximo 3 números de contacto');
        }
        await tx.contact.createMany({
          data: dto.phones.map((phone) => ({ profileId: profile.id, phone: phone.trim() })),
          skipDuplicates: true,
        });
      }
    });

    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
        isActive: true,
        profile: {
          select: {
            id: true,
            countryIso: true,
            firstName: true,
            lastName: true,
            avatar: true,
            contacts: { select: { id: true, phone: true } },
            wallet: { select: { currency: true, balance: true } },
          },
        },
      },
    });
  }
}
