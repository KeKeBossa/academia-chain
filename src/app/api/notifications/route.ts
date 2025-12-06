import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const unreadOnly = searchParams.get('unreadOnly') === 'true';

  try {
    // 現在、Notificationモデルが設定されていないため、デフォルト通知を返します
    // 将来的には、実データベースから通知を取得します
    
    let notifications = getDefaultNotifications();
    
    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.read);
    }

    return NextResponse.json({
      notifications
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json(
      {
        notifications: getDefaultNotifications()
      },
      { status: 200 }
    );
  }
}

function mapNotificationType(
  type: string
): 'proposal' | 'project' | 'paper' | 'seminar' | 'comment' | 'achievement' | 'system' {
  const typeMap: Record<string, 'proposal' | 'project' | 'paper' | 'seminar' | 'comment' | 'achievement' | 'system'> = {
    PROPOSAL: 'proposal',
    PROJECT: 'project',
    PAPER: 'paper',
    SEMINAR: 'seminar',
    COMMENT: 'comment',
    ACHIEVEMENT: 'achievement',
    SYSTEM: 'system'
  };
  return typeMap[type] || 'system';
}

function getDefaultNotifications() {
  return [
    {
      id: '1',
      type: 'proposal' as const,
      title: '新しいDAO提案が投稿されました',
      message: '「研究費配分の最適化アルゴリズム」への投票が開始されました。投票期限は3日後です。',
      timestamp: '5分前',
      read: false,
      actionLabel: '投票する',
      metadata: {
        proposalId: 'PROP-2024-003'
      }
    },
    {
      id: '2',
      type: 'project' as const,
      title: 'プロジェクトへの招待',
      message: '佐藤研究室があなたを「量子暗号通信の実用化研究」プロジェクトに招待しました。',
      timestamp: '1時間前',
      read: false,
      actionLabel: '確認する',
      metadata: {
        projectName: '量子暗号通信の実用化研究'
      }
    },
    {
      id: '3',
      type: 'paper' as const,
      title: 'あなたの論文が引用されました',
      message: '山田花子氏の論文「分散台帳技術の教育応用」があなたの論文を引用しました。',
      timestamp: '3時間前',
      read: false,
      actionLabel: '詳細を見る',
      metadata: {
        paperTitle: '分散台帳技術の教育応用',
        userName: '山田花子'
      }
    },
    {
      id: '4',
      type: 'comment' as const,
      title: '新しいコメントが投稿されました',
      message: '鈴木一郎氏があなたの論文にコメントしました。',
      timestamp: '5時間前',
      read: true,
      actionLabel: 'コメントを見る',
      metadata: {
        userName: '鈴木一郎',
        paperTitle: 'ブロックチェーンガバナンスモデル'
      }
    },
    {
      id: '5',
      type: 'proposal' as const,
      title: '投票が終了しました',
      message: '「DAO運営ガイドラインの改善」の投票が完了しました。承認可決率82%で可決されました。',
      timestamp: '1日前',
      read: true,
      actionLabel: '結果を見る'
    }
  ];
}
