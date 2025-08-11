import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const token = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

  if (token && global.sessions?.has(token)) {
    global.sessions.delete(token);
  }

  const res = NextResponse.json({ message: "Đăng xuất thành công" });
  res.cookies.set("session", "", { path: "/", maxAge: 0 });
  return res;
}
