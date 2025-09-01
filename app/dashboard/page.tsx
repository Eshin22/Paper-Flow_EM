"use client";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminPanel from "./admin/page";
import TeacherPanel from "./teacher/page";
import ReviewerPanel from "./reviewer/page";

export default function Dashboard() {
  interface RootState {
    user: {
      userInfo: {
        name: string;
        role: string;
      } | null;
    };
  }

  const user = useSelector((state: RootState) => state.user.userInfo);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return <p className="text-center text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}</h1>
      {user.role === "admin" && <AdminPanel />}
      {user.role === "teacher" && <TeacherPanel />}
      {user.role === "reviewer" && <ReviewerPanel />}
    </div>
  );
}
