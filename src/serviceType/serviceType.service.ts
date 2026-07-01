import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ServiceTypeService {
    constructor(private readonly prisma: PrismaService) { }

    findAll() {
        return this.prisma.serviceType.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        });
    }
}
