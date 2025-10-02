import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Telegram Bot Token - 这应该从环境变量获取
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * 验证 Telegram Login Widget 数据的有效性
 *
 * 这是关键的安全验证函数，用于确保从前端接收的用户数据确实来自 Telegram
 * 并且没有被篡改。验证算法遵循 Telegram 官方文档规范。
 *
 * 验证步骤：
 * 1. 从用户数据中提取 hash 字段
 * 2. 将剩余字段按键名排序，构建验证字符串
 * 3. 使用机器人 token 创建 SHA256 密钥
 * 4. 使用 HMAC-SHA256 计算预期哈希值
 * 5. 比较计算出的哈希与接收到的哈希
 *
 * ⚠️ 注意：这与 Telegram Web App 的验证方法不同！
 *
 * @param userData - 从 Telegram Widget 返回的用户数据
 * @param botToken - Telegram 机器人的 token
 * @returns 如果数据有效返回 true，否则返回 false
 */
function verifyTelegramLoginWidget(userData: TelegramUser, botToken: string): boolean {
  try {
    // 🔐 第一步：分离哈希值和需要验证的数据
    const { hash, ...dataToCheck } = userData;

    console.log('🔐 开始验证数据:', {
      receivedHash: hash,
      dataToVerify: dataToCheck
    });

    // 🔤 第二步：构建验证字符串
    // 按照 Telegram 规范，需要将所有字段按键名排序，然后用换行符连接
    const dataCheckArr = Object.keys(dataToCheck)
      .sort()  // 按字母顺序排序键名
      .map(key => `${key}=${dataToCheck[key as keyof typeof dataToCheck]}`)
      .join('\n');  // 用换行符连接

    console.log('🔤 构建的验证字符串:');
    console.log(dataCheckArr);

    // 🔑 第三步：创建密钥
    // 使用 SHA256 哈希机器人 token 作为 HMAC 密钥
    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    console.log('🔑 密钥信息:', {
      botTokenLength: botToken.length,
      secretKeyLength: secretKey.length
    });

    // 🧮 第四步：计算预期的哈希值
    // 使用 HMAC-SHA256 算法计算验证字符串的哈希
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckArr)
      .digest('hex');

    console.log('🧮 哈希比较:', {
      expected: expectedHash,
      received: hash,
      match: hash === expectedHash
    });

    // 🎯 第五步：比较哈希值
    return hash === expectedHash;

  } catch (error) {
    // 🚨 验证过程中的任何错误都应该导致验证失败
    console.error('❌ 验证 Telegram Login Widget 数据时出错:', error);
    return false;
  }
}

/**
 * 检查数据是否在有效时间范围内（1小时）
 */
function isDataFresh(authDate: number): boolean {
  const authTimestamp = authDate * 1000;
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  return (now - authTimestamp) < oneHour;
}

/**
 * POST /api/auth/telegram-widget
 *
 * 处理官方 Telegram Login Widget 的认证请求
 *
 * 流程：
 * 1. 接收前端发送的用户数据
 * 2. 验证数据完整性和有效性
 * 3. 验证 Telegram 签名哈希
 * 4. 检查数据时效性
 * 5. 返回认证结果和用户信息
 *
 * @param request - Next.js 请求对象
 * @returns 认证响应
 */
export async function POST(request: NextRequest) {
  try {
    // 📥 解析请求体
    const body = await request.json();
    const { user } = body;

    // 🔍 详细打印接收到的请求数据
    console.group('🔷 Telegram Widget API 收到请求');
    console.log('📊 请求体完整数据:', JSON.stringify(body, null, 2));
    console.log('👤 用户数据:', JSON.stringify(user, null, 2));
    console.log('⏰ 服务器处理时间:', new Date().toISOString());
    console.groupEnd();

    // ✅ 基础数据验证
    if (!user) {
      console.error('❌ 错误：缺少用户数据');
      return NextResponse.json(
        { error: '缺少用户数据' },
        { status: 400 }
      );
    }

    // 🔑 检查环境变量配置
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('❌ 严重错误：TELEGRAM_BOT_TOKEN 未配置');
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      );
    }

    // 📋 验证必要的用户字段
    const requiredFields = ['id', 'first_name', 'auth_date', 'hash'];
    const missingFields = requiredFields.filter(field => !user[field]);

    if (missingFields.length > 0) {
      console.error('❌ 用户数据字段缺失:', missingFields);
      return NextResponse.json(
        { error: `用户数据不完整，缺少字段: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // ⏰ 检查数据新鲜度（1小时内有效）
    const isStillFresh = isDataFresh(user.auth_date);
    console.log('⏰ 数据时效性检查:', {
      authDate: user.auth_date,
      authTime: new Date(user.auth_date * 1000).toLocaleString(),
      currentTime: new Date().toLocaleString(),
      isValid: isStillFresh
    });

    if (!isStillFresh) {
      console.error('❌ 认证数据已过期');
      return NextResponse.json(
        { error: '认证数据已过期，请重新登录' },
        { status: 401 }
      );
    }

    // 🔐 验证 Telegram 签名（关键安全步骤）
    console.log('🔐 开始验证 Telegram 签名...');
    const isValidSignature = verifyTelegramLoginWidget(user, TELEGRAM_BOT_TOKEN);
    console.log('🔐 签名验证结果:', isValidSignature);

    if (!isValidSignature) {
      console.error('❌ Telegram 签名验证失败');
      return NextResponse.json(
        { error: '无效的认证数据，签名验证失败' },
        { status: 401 }
      );
    }

    // 🎉 构建标准化的用户信息对象
    const telegramUser = {
      telegramId: user.id.toString(),
      firstName: user.first_name,
      lastName: user.last_name || '',
      username: user.username || '',
      photoUrl: user.photo_url || '',
      authDate: user.auth_date
    };

    // 📝 在实际项目中，这里可以实现：
    // 1. 保存用户信息到数据库（如 PostgreSQL、MongoDB）
    // 2. 生成安全的 JWT token（使用 jsonwebtoken 库）
    // 3. 创建用户会话（如 Redis 会话存储）
    // 4. 与认证系统集成（如 Clerk、Auth0、NextAuth.js）
    // 5. 发送欢迎邮件或通知

    // 🔒 生成示例会话令牌（生产环境应使用更安全的方法）
    const sessionData = {
      userId: telegramUser.telegramId,
      username: telegramUser.username,
      firstName: telegramUser.firstName,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24小时过期
      iat: Math.floor(Date.now() / 1000), // 签发时间
      platform: 'telegram-widget'
    };

    // ⚠️ 警告：生产环境应使用真实的JWT密钥和签名
    const token = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    // 🎉 记录成功认证
    console.group('✅ Telegram Widget 认证成功');
    console.log('👤 用户信息:', telegramUser);
    console.log('🎫 生成的令牌长度:', token.length);
    console.log('⏰ 令牌过期时间:', new Date(sessionData.exp * 1000).toLocaleString());
    console.groupEnd();

    // 📤 返回成功响应
    return NextResponse.json({
      success: true,
      user: telegramUser,
      token: token,
      message: 'Telegram 登录成功',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // 🚨 全局错误处理
    console.group('❌ Telegram Widget API 错误');
    console.error('🔥 错误对象:', error);
    console.error('📋 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    console.error('⏰ 错误时间:', new Date().toISOString());
    console.groupEnd();

    return NextResponse.json(
      {
        error: '服务器内部错误',
        timestamp: new Date().toISOString()
      },
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