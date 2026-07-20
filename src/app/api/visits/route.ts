import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  if (!page) {
    return NextResponse.json({ error: 'Missing page parameter' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('site_visits')
    .select('visit_count')
    .eq('page_path', page)
    .single();

  if (error) {
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: data.visit_count });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const page = body.page;
    if (!page) {
      return NextResponse.json({ error: 'Missing page parameter' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Fetch current count
    const { data: selectData } = await supabase
      .from('site_visits')
      .select('visit_count')
      .eq('page_path', page)
      .single();

    const currentCount = selectData ? selectData.visit_count : 0;
    const newCount = currentCount + 1;

    // Update count
    await supabase
      .from('site_visits')
      .upsert({ 
        page_path: page, 
        visit_count: newCount, 
        updated_at: new Date().toISOString() 
      });

    return NextResponse.json({ count: newCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
