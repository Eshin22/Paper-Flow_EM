"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminStudyLeavePanel() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Fetch all requests
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/reviewer/studyleave");
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Review request (Admin only)
  const handleReview = async (id: string, status: string, comment: string = "") => {
    try {
      await axios.put("/api/reviewer/studyleave", { 
        id, 
        status, 
        reviewerComment: comment || `${status.charAt(0).toUpperCase() + status.slice(1)} by admin.`
      });
      await fetchRequests(); // Refresh the list
      alert(`Request ${status} successfully!`);
    } catch (error) {
      alert("Failed to update request");
    }
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Filter requests based on status
  const filteredRequests = requests.filter(r => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  // Get status counts
  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
      {/* ✅ Top Bar with Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
          Study Leave Management (Admin)
        </h1>
        <div className="flex gap-4 mt-4 md:mt-0">
          {/* ✅ Back to Admin Dashboard Button */}
          <Link href="/dashboard/admin">
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transition text-sm">
              ← Back to Admin Dashboard
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition text-sm"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ✅ Status Filter and Stats */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-blue-400">Filter Requests</h2>
          <button 
            onClick={fetchRequests}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition"
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "all", label: "All Requests", color: "bg-gray-600" },
            { key: "pending", label: "Pending", color: "bg-yellow-600" },
            { key: "approved", label: "Approved", color: "bg-green-600" },
            { key: "rejected", label: "Rejected", color: "bg-red-600" },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-4 rounded-lg transition ${
                filter === key ? `${color} ring-2 ring-white` : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <div className="text-2xl font-bold">{statusCounts[key as keyof typeof statusCounts]}</div>
              <div className="text-sm">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Requests List */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-green-400">
          {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)} Leave Requests 
          ({filteredRequests.length})
        </h2>
        
        {filteredRequests.length === 0 ? (
          <p className="text-gray-400">No {filter === "all" ? "" : filter} requests found.</p>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(r => (
              <div key={r._id} className="bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{r.reason}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-300">
                      <p><span className="font-medium">Duration:</span> {new Date(r.fromDate).toLocaleDateString()} to {new Date(r.toDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Requested by:</span> {r.userId}</p>
                      <p><span className="font-medium">Submitted:</span> {new Date(r.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">Days:</span> {Math.ceil((new Date(r.toDate).getTime() - new Date(r.fromDate).getTime()) / (1000 * 60 * 60 * 24))} days</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      r.status === 'pending' ? 'bg-yellow-600 text-yellow-100' :
                      r.status === 'approved' ? 'bg-green-600 text-green-100' :
                      'bg-red-600 text-red-100'
                    }`}>
                      {r.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* ✅ Admin Actions */}
                {r.status === "pending" && (
                  <div className="mt-4 space-y-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReview(r._id, "approved")}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition flex items-center gap-2"
                      >
                        ✅ Approve
                      </button>
                      <button 
                        onClick={() => handleReview(r._id, "rejected")}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition flex items-center gap-2"
                      >
                        ❌ Reject
                      </button>
                    </div>
                    
                    {/* Quick Comment Options */}
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleReview(r._id, "approved", "Approved - Valid reason for academic purposes")}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-xs transition"
                      >
                        ✅ Approve with academic reason
                      </button>
                      <button 
                        onClick={() => handleReview(r._id, "rejected", "Rejected - Insufficient documentation provided")}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-xs transition"
                      >
                        ❌ Reject - Need docs
                      </button>
                      <button 
                        onClick={() => handleReview(r._id, "rejected", "Rejected - Too many days requested")}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-xs transition"
                      >
                        ❌ Reject - Too many days
                      </button>
                    </div>
                  </div>
                )}

                {/* ✅ Admin Comment */}
                {r.reviewerComment && (
                  <div className="mt-3 p-3 bg-gray-600 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-blue-400">Admin Comment:</span> {r.reviewerComment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}