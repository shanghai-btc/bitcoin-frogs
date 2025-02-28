import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    // Fetch the frog data from your data source (e.g., a JSON file or database)
    // This is a placeholder. Replace with your actual data fetching logic
    const frogData = {
      background: 'green',
      body: 'normal',
      eyes: 'normal',
      mouth: 'smile',
      hat: 'cowboy',
      accessory: 'glasses'
    };

    return NextResponse.json(frogData);
  } catch (error) {
    console.error('Error fetching frog data:', error);
    return NextResponse.json({ error: 'Failed to fetch frog data' }, { status: 500 });
  }
}