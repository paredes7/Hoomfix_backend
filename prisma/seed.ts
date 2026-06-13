import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const countries = [
  { iso: 'AR', name: 'Argentina',          dialCode: '+54',  currency: 'ARS' },
  { iso: 'BO', name: 'Bolivia',            dialCode: '+591', currency: 'BOB' },
  { iso: 'BR', name: 'Brasil',             dialCode: '+55',  currency: 'BRL' },
  { iso: 'CL', name: 'Chile',              dialCode: '+56',  currency: 'CLP' },
  { iso: 'CO', name: 'Colombia',           dialCode: '+57',  currency: 'COP' },
  { iso: 'CR', name: 'Costa Rica',         dialCode: '+506', currency: 'CRC' },
  { iso: 'CU', name: 'Cuba',               dialCode: '+53',  currency: 'CUP' },
  { iso: 'DO', name: 'República Dominicana', dialCode: '+1', currency: 'DOP' },
  { iso: 'EC', name: 'Ecuador',            dialCode: '+593', currency: 'USD' },
  { iso: 'SV', name: 'El Salvador',        dialCode: '+503', currency: 'USD' },
  { iso: 'GT', name: 'Guatemala',          dialCode: '+502', currency: 'GTQ' },
  { iso: 'HN', name: 'Honduras',           dialCode: '+504', currency: 'HNL' },
  { iso: 'MX', name: 'México',             dialCode: '+52',  currency: 'MXN' },
  { iso: 'NI', name: 'Nicaragua',          dialCode: '+505', currency: 'NIO' },
  { iso: 'PA', name: 'Panamá',             dialCode: '+507', currency: 'PAB' },
  { iso: 'PY', name: 'Paraguay',           dialCode: '+595', currency: 'PYG' },
  { iso: 'PE', name: 'Perú',               dialCode: '+51',  currency: 'PEN' },
  { iso: 'PR', name: 'Puerto Rico',        dialCode: '+1',   currency: 'USD' },
  { iso: 'UY', name: 'Uruguay',            dialCode: '+598', currency: 'UYU' },
  { iso: 'VE', name: 'Venezuela',          dialCode: '+58',  currency: 'VES' },
  { iso: 'US', name: 'Estados Unidos',     dialCode: '+1',   currency: 'USD' },
  { iso: 'ES', name: 'España',             dialCode: '+34',  currency: 'EUR' },
];

async function main() {
  console.log('Seeding countries...');
  for (const country of countries) {
    await prisma.country.upsert({
      where: { iso: country.iso },
      update: country,
      create: { ...country, active: true },
    });
  }
  console.log(`Seeded ${countries.length} countries.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
