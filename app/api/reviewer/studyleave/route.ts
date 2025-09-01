import { NextResponse } from "next/server";
import { connectMongoDB } from "@/utils/db";
import StudyLeaveRequest from "@/models/studyleavRequest";;

// Create a leave request
export async function POST(req: Request) {
  await connectMongoDB();
  try {
    const { userId, reason, fromDate, toDate } = await req.json();
    const leave = await StudyLeaveRequest.create({ userId, reason, fromDate, toDate });
    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json({ message: "Failed to create request" }, { status: 500 });
  }
}

// Get all leave requests (for reviewer)
export async function GET() {
  await connectMongoDB();
  try {
    const leaves = await StudyLeaveRequest.find().sort({ createdAt: -1 });
    return NextResponse.json(leaves, { status: 200 });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json({ message: "Failed to fetch requests" }, { status: 500 });
  }
}

// Review a leave request
export async function PUT(req: Request) {
  await connectMongoDB();
  try {
    const { id, status, reviewerComment } = await req.json();
    const leave = await StudyLeaveRequest.findByIdAndUpdate(
      id,
      { status, reviewerComment },
      { new: true }
    );
    return NextResponse.json(leave, { status: 200 });
  } catch (error) {
    console.error("Error updating leave request:", error);
    return NextResponse.json({ message: "Failed to update request" }, { status: 500 });
  }
}