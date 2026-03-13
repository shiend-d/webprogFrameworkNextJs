import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDB } from "@/lib/db";

function requireAuth(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  return null;
}

export async function GET(req: NextRequest) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  try {
    const db = getDB();
    const id = req.nextUrl.searchParams.get("id");

    const [rows] = (await db.query(
      id ? "SELECT * FROM bahan_baku WHERE id = ?" : "SELECT * FROM bahan_baku",
      id ? [id] : [],
    )) as any;

    return NextResponse.json(
      {
        success: true,
        message: "Bahan baku fetched successfully",
        data: rows,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("GET /api/bahan_baku error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bahan baku",
        error: error.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  try {
    const db = getDB();
    const body = await req.json();

    const payload = {
      nama: body.nama,
      tipe: body.tipe,
      stok: body.stok != null ? Number(body.stok) : null,
      satuan: body.satuan ?? null,
      harga_satuan:
        body.harga_satuan != null ? Number(body.harga_satuan) : null,
    };

    const [result] = (await db.query("INSERT INTO bahan_baku SET ?", [
      payload,
    ])) as any;

    return NextResponse.json(
      {
        success: true,
        message: "Bahan baku created successfully",
        data: {
          id: result.insertId,
          ...payload,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("POST /api/bahan_baku error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create bahan baku",
        error: error.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  try {
    const db = getDB();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      throw new Error("Missing required query parameter: id");
    }

    const body = await req.json();
    if ("id" in body) {
      delete body.id;
    }

    const payload = {
      nama: body.nama,
      tipe: body.tipe,
      stok: body.stok != null ? Number(body.stok) : null,
      satuan: body.satuan ?? null,
      harga_satuan:
        body.harga_satuan != null ? Number(body.harga_satuan) : null,
    };

    await db.query("UPDATE bahan_baku SET ? WHERE id = ?", [payload, id]);

    return NextResponse.json(
      {
        success: true,
        message: "Bahan baku updated successfully",
        data: {
          id,
          ...payload,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("PUT /api/bahan_baku error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update bahan baku",
        error: error.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  try {
    const db = getDB();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      throw new Error("Missing required query parameter: id");
    }

    await db.query("DELETE FROM bahan_baku WHERE id = ?", [id]);

    return NextResponse.json(
      {
        success: true,
        message: "Bahan baku deleted successfully",
        data: { id },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("DELETE /api/bahan_baku error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete bahan baku",
        error: error.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}
