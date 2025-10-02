import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Telegram Bot Token - 这应该从环境变量获取
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * 验证 Telegram Web App 数据的有效性
 */
function verifyTelegramWebAppData(authData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(authData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // 按键名排序参数
    const sortedParams = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // 计算预期的哈希值
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const expectedHash = crypto.createHmac('sha256', secretKey).update(sortedParams).digest('hex');

    return hash === expectedHash;
  } catch (error) {
    console.error('验证 Telegram 数据时出错:', error);
    return false;
  }
}

/**
 * 检查数据是否在有效时间范围内（5分钟）
 */
function isDataFresh(authDate: string): boolean {
  const authTimestamp = parseInt(authDate) * 1000;
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  return (now - authTimestamp) < fiveMinutes;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authData } = body;

    if (!authData) {
      return NextResponse.json(
        { error: '缺少认证数据' },
        { status: 400 }
      );
    }

    if (!TELEGRAM_BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN 未配置');
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      );
    }

    // 验证数据有效性
    if (!verifyTelegramWebAppData(authData, TELEGRAM_BOT_TOKEN)) {
      return NextResponse.json(
        { error: '无效的认证数据' },
        { status: 401 }
      );
    }

    // 解析用户数据
    const urlParams = new URLSearchParams(authData);
    const userStr = urlParams.get('user');
    const authDate = urlParams.get('auth_date');

    if (!userStr || !authDate) {
      return NextResponse.json(
        { error: '缺少用户信息或认证时间' },
        { status: 400 }
      );
    }

    // 检查数据新鲜度
    if (!isDataFresh(authDate)) {
      return NextResponse.json(
        { error: '认证数据已过期' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userStr);

    // 验证必要的用户字段
    if (!user.id || !user.first_name) {
      return NextResponse.json(
        { error: '用户数据不完整' },
        { status: 400 }
      );
    }

    // 构建用户信息
    const telegramUser = {
      telegramId: user.id.toString(),
      firstName: user.first_name,
      lastName: user.last_name || '',
      username: user.username || '',
      photoUrl: user.photo_url || '',
      languageCode: user.language_code || 'en',
      isPremium: user.is_premium || false,
      authDate: parseInt(authDate)
    };

    // 这里你可以：
    // 1. 保存用户信息到数据库
    // 2. 生成JWT token
    // 3. 创建会话
    // 4. 与 Clerk 集成

    // 示例：创建一个简单的JWT token
    const sessionData = {
      userId: telegramUser.telegramId,
      username: telegramUser.username,
      firstName: telegramUser.firstName,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
    };

    // 在实际项目中，你应该使用更安全的JWT签名
    const token = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    return NextResponse.json({
      success: true,
      user: telegramUser,
      token: token,
      message: '认证成功'
    });

  } catch (error) {
    console.error('Telegram 认证 API 错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: '方法不允许' },
    { status: 405 }
  );
}