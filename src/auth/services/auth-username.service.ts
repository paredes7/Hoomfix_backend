import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuthUsernameService {
  constructor(private readonly prisma: PrismaService) {}

  buildBase(source: string): string {
    return source
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  // METODO PARA GENERAR UN NOMBRE DE USUARIO ÚNICO A PARTIR DEL EMAIL O TELÉFONO DEL USUARIO, SI YA EXISTE SE AGREGA UN NÚMERO AL FINAL
  async generate(emailOrPhone: string): Promise<string> {
    const base = this.buildBase(emailOrPhone);
    let username = base;
    let counter = 1;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${base}${counter}`;
      counter++;
    }
    return username;
  }

  // METODO PARA GENERAR SUGERENCIAS DE NOMBRES DE USUARIO A PARTIR DE UNA BASE
  async suggestions(base: string): Promise<string[]> {
    const candidates = [`${base}1`, `${base}2`, `${base}_ok`];
    const results: string[] = [];
    for (const candidate of candidates) {
      const exists = await this.prisma.user.findUnique({
        where: { username: candidate },
      });
      if (!exists) results.push(candidate);
    }
    return results;
  }
}
