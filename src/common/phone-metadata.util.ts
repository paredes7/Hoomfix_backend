import { BadRequestException } from '@nestjs/common';

export function normalizePhoneCountryIso(value: string): string {
  const iso = (value ?? '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(iso)) {
    throw new BadRequestException('El país telefónico es inválido');
  }
  return iso;
}

export function normalizePhoneNationalNumber(value: string): string {
  const normalized = (value ?? '').replace(/\D/g, '');
  if (normalized.length < 6 || normalized.length > 15) {
    throw new BadRequestException('Número de teléfono inválido');
  }
  return normalized;
}
