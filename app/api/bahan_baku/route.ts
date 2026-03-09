import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const db = getDB();
    const id = req.nextUrl.searchParams.get("id");

    const [rows] = (await db.query(
      id ? "SELECT * FROM bahan_baku WHERE id = ?" : "SELECT * FROM bahan_baku",
      id ? [id] : []
    )) as any;

    return NextResponse.json(
      {
        success: true,
        message: "Bahan baku fetched successfully",
        data: rows,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/bahan_baku error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bahan baku",
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

    const [result] = (await db.query("INSERT INTO bahan_baku SET ?", [
      body,
    ])) as any;

    return NextResponse.json(
      {
        success: true,
        message: "Bahan baku created successfully",
        data: {
          id: result.insertId,
          ...body,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/bahan_baku error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create bahan baku",
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

    await db.query("UPDATE bahan_baku SET ? WHERE id = ?", [body, id]);

    return NextResponse.json(
      {
        success: true,
        message: "Bahan baku updated successfully",
        data: {
          id,
          ...body,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/bahan_baku error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update bahan baku",
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

    await db.query("DELETE FROM bahan_baku WHERE id = ?", [id]);

    return NextResponse.json(
      {
        success: true,
        message: "Bahan baku deleted successfully",
        data: { id },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/bahan_baku error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete bahan baku",
        error: error.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

