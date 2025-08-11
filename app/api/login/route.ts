// app/api/login/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import crypto from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tạo type cho session
declare global {
  // eslint-disable-next-line no-var
  var sessions: Map<string, { id: number; email: string }> | undefined;
}

// ------------------
// GET: Kiểm tra API
// ------------------
export async function GET() {
  return NextResponse.json({
    message: "Login API - Hãy dùng POST để đăng nhập",
  });
}

// ------------------
// POST: Đăng nhập
// ------------------
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Thiếu email hoặc mật khẩu" },
        { status: 400 }
      );
    }

    // Lấy user từ DB
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Email không tồn tại" },
        { status: 400 }
      );
    }

    const user = result.rows[0];

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Sai mật khẩu" },
        { status: 400 }
      );
    }

    // Tạo token session ngẫu nhiên
    const token = crypto.randomBytes(32).toString("hex");

    // Lưu session vào bộ nhớ server
    if (!global.sessions) {
      global.sessions = new Map();
    }
    global.sessions.set(token, { id: user.id, email: user.email });

    // Trả cookie + message
    const res = NextResponse.json({ message: "Đăng nhập thành công" });
    res.cookies.set("session", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 ngày
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
