import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
// Yusuf Abdurrahman - 247006111102
export async function GET(req: NextRequest) {
  try {
    const db = getDB();
    const id = req.nextUrl.searchParams.get("id");

    const [rows] = (await db.query(
      id ? "SELECT * FROM produk WHERE id = ?" : "SELECT * FROM produk",
      id ? [id] : []
    )) as any;

    return NextResponse.json(
      {
        success: true,
        message: "Produk fetched successfully",
        data: rows,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/produk error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch produk",
        error: error.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDB();
    const body = await req.json();

    const [result] = (await db.query("INSERT INTO produk SET ?", [body])) as any;

    return NextResponse.json(
      {
        success: true,
        message: "Produk created successfully",
        data: {
          id: result.insertId,
          ...body,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/produk error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create produk",
        error: error.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    await db.query("UPDATE produk SET ? WHERE id = ?", [body, id]);

    return NextResponse.json(
      {
        success: true,
        message: "Produk updated successfully",
        data: {
          id,
          ...body,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/produk error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update produk",
        error: error.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = getDB();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      throw new Error("Missing required query parameter: id");
    }

    await db.query("DELETE FROM produk WHERE id = ?", [id]);

    return NextResponse.json(
      {
        success: true,
        message: "Produk deleted successfully",
        data: { id },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/produk error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete produk",
        error: error.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

