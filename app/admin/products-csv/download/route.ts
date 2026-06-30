import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';

export function GET() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const csvPath = path.join(process.cwd(), 'data', 'products-us.csv');

  if (!fs.existsSync(csvPath)) {
    return new NextResponse('CSV not found', { status: 404 });
  }

  const csv = fs.readFileSync(csvPath, 'utf8');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="products-us.csv"',
    },
  });
}
