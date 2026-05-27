import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async completeProfile(userId: string, role: Role, dto: CompleteProfileDto) {
    if (role === Role.CLIENT) {
      return this.completeClientProfile(userId, dto);
    } else if (role === Role.PROVIDER) {
      return this.completeProviderProfile(userId, dto);
    }
    throw new BadRequestException('Rol no válido para completar perfil');
  }

  private async completeClientProfile(userId: string, dto: CompleteProfileDto) {
    const profile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Perfil de cliente no encontrado');

    await this.prisma.$transaction(async (tx) => {
      await tx.clientProfile.update({
        where: { userId },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      if (dto.phones && dto.phones.length > 0) {
        const existing = await tx.contact.findMany({
          where: { clientProfileId: profile.id },
        });
        if (existing.length + dto.phones.length > 3) {
          throw new BadRequestException('Máximo 3 números de contacto');
        }
        await tx.contact.createMany({
          data: dto.phones.map((phone) => ({
            clientProfileId: profile.id,
            phone: phone.trim(),
          })),
          skipDuplicates: true,
        });
      }
    });

    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        clientProfile: {
          select: {
            id: true,
            countryIso: true,
            firstName: true,
            lastName: true,
            avatar: true,
            contacts: { select: { id: true, phone: true } },
            clientWallet: { select: { currency: true, balance: true } },
          },
        },
      },
    });
  }

  private async completeProviderProfile(userId: string, dto: CompleteProfileDto) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Perfil de provider no encontrado');

    await this.prisma.providerProfile.update({
      where: { userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        providerProfile: {
          select: {
            id: true,
            countryIso: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }
}
