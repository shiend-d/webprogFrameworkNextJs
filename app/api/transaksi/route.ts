import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const db = getDB();
    const id = req.nextUrl.searchParams.get("id");

    const [rows] = (await db.query(
      id ? "SELECT * FROM transaksi WHERE id = ?" : "SELECT * FROM transaksi",
      id ? [id] : []
    )) as any;

    return NextResponse.json(
      {
        success: true,
        message: "Transaksi fetched successfully",
        data: rows,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/transaksi error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transaksi",
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

    const [result] = (await db.query("INSERT INTO transaksi SET ?", [
      body,
    ])) as any;

    return NextResponse.json(
      {
        success: true,
        message: "Transaksi created successfully",
        data: {
          id: result.insertId,
          ...body,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/transaksi error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create transaksi",
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

    await db.query("UPDATE transaksi SET ? WHERE id = ?", [body, id]);

    return NextResponse.json(
      {
        success: true,
        message: "Transaksi updated successfully",
        data: {
          id,
          ...body,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/transaksi error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update transaksi",
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

    await db.query("DELETE FROM transaksi WHERE id = ?", [id]);

    return NextResponse.json(
      {
        success: true,
        message: "Transaksi deleted successfully",
        data: { id },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/transaksi error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete transaksi",
        error: error.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

