import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: 実際のデータベースクエリに置き換え
    // 現在はモックデータを返す
    const mockSeminars = [
      {
        id: '1',
        name: 'AI研究セミナー',
        university: '東京大学',
        professor: '山田 太郎',
        field: 'AI・機械学習',
        description: '最新のAI技術について議論します',
        members: 15,
        tags: ['AI', '機械学習', 'ディープラーニング']
      },
      {
        id: '2',
        name: '量子コンピューティング研究室',
        university: '京都大学',
        professor: '佐藤 花子',
        field: '量子技術',
        description: '量子コンピューティングの基礎と応用',
        members: 12,
        tags: ['量子', 'コンピューティング']
      }
    ];

    let filteredSeminars = mockSeminars;

    if (search) {
      filteredSeminars = mockSeminars.filter(
        (seminar) =>
          seminar.name.toLowerCase().includes(search.toLowerCase()) ||
          seminar.field.toLowerCase().includes(search.toLowerCase()) ||
          seminar.professor.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      seminars: filteredSeminars.slice(0, limit),
      total: filteredSeminars.length
    });
  } catch (error) {
    console.error('Failed to fetch seminars:', error);
    return NextResponse.json({ error: 'Failed to load seminars' }, { status: 500 });
  }
}
