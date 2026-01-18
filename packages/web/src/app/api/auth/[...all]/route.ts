import { NextResponse } from 'next/server';

export const GET = async () => {
  return NextResponse.json({ message: 'Auth mock endpoint' });
};

export const POST = async () => {
  return NextResponse.json({ message: 'Auth mock endpoint' });
};