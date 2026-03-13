import { NextRequest, NextResponse } from "next/server";
import { comparePassword, generateToken, hashPassword } from "@/lib/auth";
import { getDB } from "@/lib/db";

type UserRow = {
  id: number;
  username: string;
  password: string;
  role: string;
};

function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username =
      typeof body?.username === "string" ? body.username.trim() : "";
    const password = body?.password;

    if (!username || typeof password !== "string" || password.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Username dan password wajib diisi",
        },
        { status: 400 },
      );
    }

    const db = getDB();
    const [rows] = (await db.query(
      "SELECT id, username, password, role FROM users WHERE username = ? LIMIT 1",
      [username],
    )) as [UserRow[], unknown];

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Username atau password salah",
        },
        { status: 401 },
      );
    }

    let isPasswordValid = false;

    if (isBcryptHash(user.password)) {
      isPasswordValid = await comparePassword(password, user.password);
    } else {
      // Backward compatibility for legacy plaintext passwords.
      isPasswordValid = password === user.password;

      if (isPasswordValid) {
        const newHashedPassword = await hashPassword(password);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [
          newHashedPassword,
          user.id,
        ]);
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Username atau password salah",
        },
        { status: 401 },
      );
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role ?? "admin",
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        data: {
          id: user.id,
          username: user.username,
          role: user.role ?? "admin",
        },
      },
      { status: 200 },
    );

    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat login",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
