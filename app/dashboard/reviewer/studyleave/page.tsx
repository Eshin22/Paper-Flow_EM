"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ✅ Define types for better type safety
interface StudyLeaveRequest {
  _id: string;
  reason: string;
  fromDate: string;
  toDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerComment?: string;
  createdAt: string;
  userId: string;
}

interface FormData {
  reason: string;
  fromDate: string;
  toDate: string;
}

interface User {
  email?: string;
  name?: string;
  role?: string;
}

export default function StudyLeavePanel() {
  const [requests, setRequests] = useState<StudyLeaveRequest[]>([]);
  const [form, setForm] = useState<FormData>({
    reason: "",
    fromDate: "",
    toDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  // ✅ Memoize current user to prevent unnecessary re-renders
  const currentUser = useMemo<User | null>(() => {
    if (typeof window === "undefined" || !mounted) return null;
    
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }, [mounted]);

  // ✅ Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Memoized fetch function with stable dependencies
  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userId = currentUser.email || currentUser.name;
      if (!userId) {
        console.error("No user ID found");
        return;
      }

      const response = await axios.get(`/api/reviewer/studyleave?userId=${encodeURIComponent(userId)}`);
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ✅ Fetch requests only once when component mounts and user is available
  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser, fetchRequests]);

  // ✅ Form validation
  const validateForm = (): string | null => {
    if (!form.reason.trim()) return "Please enter a reason for leave";
    if (!form.fromDate) return "Please select a start date";
    if (!form.toDate) return "Please select an end date";
    
    const fromDate = new Date(form.fromDate);
    const toDate = new Date(form.toDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate < today) return "Start date cannot be in the past";
    if (toDate <= fromDate) return "End date must be after start date";
    
    const maxDays = 30; // Maximum leave days allowed
    const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > maxDays) return `Maximum ${maxDays} days allowed for study leave`;
    
    return null;
  };

  // ✅ Enhanced submit request with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("Please login first");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setSubmitting(true);
      
      await axios.post("/api/reviewer/studyleave", {
        userId: currentUser.email || currentUser.name,
        ...form,
      });

      // ✅ Reset form
      setForm({ reason: "", fromDate: "", toDate: "" });
      
      // ✅ Add the new request to the state optimistically
      const newRequest: StudyLeaveRequest = {
        _id: Date.now().toString(), // Temporary ID
        userId: currentUser.email || currentUser.name || '',
        reason: form.reason,
        fromDate: form.fromDate,
        toDate: form.toDate,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      setRequests(prev => [newRequest, ...prev]);
      
      alert("Study leave request submitted successfully!");
      
      // ✅ Refresh to get the actual data from server
      setTimeout(() => fetchRequests(), 1000);
      
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Manual refresh function
  const handleRefresh = useCallback(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // ✅ Calculate duration in days
  const calculateDuration = (fromDate: string, toDate: string): number => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // ✅ Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // ✅ Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600 text-yellow-100';
      case 'approved':
        return 'bg-green-600 text-green-100';
      case 'rejected':
        return 'bg-red-600 text-red-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  // ✅ Loading state for SSR
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // ✅ Redirect if no user
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-gray-400 mb-6">You need to be logged in to access this page.</p>
          <Link href="/login">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
      {/* ✅ Top Bar with Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            My Study Leave Requests
          </h1>
          <p className="text-gray-400 mt-2">
            Welcome, {currentUser.name || currentUser.email}
          </p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="/dashboard/reviewer">
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transition text-sm">
              ← Back to Dashboard
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

      {/* ✅ Request Form */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Submit New Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Leave *
            </label>
            <textarea
              placeholder="Enter reason for study leave (e.g., conference attendance, research work, family emergency)..."
              value={form.reason}
              onChange={e => handleInputChange('reason', e.target.value)}
              required
              disabled={submitting}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{form.reason.length}/500 characters</span>
              <span>Be specific about your reason</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From Date *
              </label>
              <input
                type="date"
                value={form.fromDate}
                onChange={e => handleInputChange('fromDate', e.target.value)}
                required
                disabled={submitting}
                min={getTodayDate()}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To Date *
              </label>
              <input
                type="date"
                value={form.toDate}
                onChange={e => handleInputChange('toDate', e.target.value)}
                required
                disabled={submitting}
                min={form.fromDate || getTodayDate()}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>
          </div>

          {/* ✅ Duration display */}
          {form.fromDate && form.toDate && (
            <div className="p-3 bg-gray-700 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-300">
                <span className="font-medium">Duration:</span> {calculateDuration(form.fromDate, form.toDate)} days
                {calculateDuration(form.fromDate, form.toDate) > 30 && (
                  <span className="text-red-400 ml-2">(Maximum 30 days allowed)</span>
                )}
              </p>
            </div>
          )}

          <button 
            type="submit"
            disabled={submitting || !form.reason.trim() || !form.fromDate || !form.toDate}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </span>
            ) : (
              "Submit Leave Request"
            )}
          </button>
        </form>
      </div>

      {/* ✅ My Requests List */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-green-400">
            My Leave Requests ({requests.length})
          </h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                🔄 Refresh
              </>
            )}
          </button>
        </div>

        {loading && requests.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg">No leave requests found.</p>
            <p className="text-gray-500 text-sm mt-2">Submit your first request using the form above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r._id} className="bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500 hover:bg-gray-650 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{r.reason}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-300">
                      <p>
                        <span className="font-medium">Duration:</span><br />
                        {new Date(r.fromDate).toLocaleDateString()} to {new Date(r.toDate).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Days:</span><br />
                        {calculateDuration(r.fromDate, r.toDate)} days
                      </p>
                      <p>
                        <span className="font-medium">Submitted:</span><br />
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(r.status)}`}>
                      {r.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* ✅ Admin Review Comment */}
                {r.reviewerComment && (
                  <div className="mt-3 p-3 bg-gray-600 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-blue-400">Admin Comment:</span><br />
                      {r.reviewerComment}
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