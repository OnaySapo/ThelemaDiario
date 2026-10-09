import { NextResponse } from "next/server";
import { getAllTodos, createTodo, updateTodo, deleteTodo } from "@/lib/db";

export async function GET() {
  try {
    const todos = getAllTodos();
    return NextResponse.json({ success: true, todos });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ success: false, error: "Texto da tarefa não informado." }, { status: 400 });
    }
    const todo = createTodo(text.trim());
    return NextResponse.json({ success: true, todo });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, completed } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID não informado." }, { status: 400 });
    }
    updateTodo(id, Boolean(completed));
    return NextResponse.json({ success: true, message: "Tarefa atualizada." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID não informado." }, { status: 400 });
    }
    deleteTodo(id);
    return NextResponse.json({ success: true, message: "Tarefa excluída." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
