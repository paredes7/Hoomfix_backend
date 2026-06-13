import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CountryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.country.findMany({
      where: { active: true },
      select: { iso: true, name: true, dialCode: true, currency: true },
      orderBy: { name: 'asc' },
    });
  }
}
