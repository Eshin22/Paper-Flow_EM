"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [newCollection, setNewCollection] = useState("");
  const [newPaper, setNewPaper] = useState({
    title: "",
    subject: "",
    collectionId: "",
    driveLink: "",
  });
  const [assignReviewer, setAssignReviewer] = useState({
    paperId: "",
    reviewer: "",
  });
  const [reviewers, setReviewers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchCollections();
    fetchPapers();
    fetchReviewers();
  }, []);

  const fetchCollections = async () => {
    const res = await axios.get("/api/admin/collections");
    setCollections(res.data);
  };

  const fetchPapers = async () => {
    const res = await axios.get("/api/admin/papers");
    setPapers(res.data);
  };

  const fetchReviewers = async () => {
    const res = await axios.get("/api/admin/users");
    setReviewers(res.data.reviewers);
  };

  const handleAddCollection = async () => {
    if (!newCollection.trim()) return alert("Collection name is required");
    await axios.post("/api/admin/collections", { name: newCollection });
    setNewCollection("");
    fetchCollections();
  };

  const handleAddPaper = async () => {
    if (!newPaper.title || !newPaper.subject || !newPaper.collectionId) {
      alert("Please fill in title, subject, and select a collection");
      return;
    }
    const formData = new FormData();
    formData.append("title", newPaper.title);
    formData.append("subject", newPaper.subject);
    formData.append("collectionId", newPaper.collectionId);
    formData.append("driveLink", newPaper.driveLink);

    await axios.post("/api/admin/papers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setNewPaper({ title: "", subject: "", collectionId: "", driveLink: "" });
    fetchPapers();
  };

  const handleAssignReviewer = async () => {
    if (!assignReviewer.paperId || !assignReviewer.reviewer)
      return alert("Please select a paper and reviewer");
    await axios.put("/api/admin/assign-reviewer", assignReviewer);
    setAssignReviewer({ paperId: "", reviewer: "" });
    fetchPapers();
  };

  const handleMarkPrinted = async (paperId: string) => {
    await axios.put("/api/admin/mark-printed", { paperId });
    fetchPapers();
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user session
    router.push("/login"); // Redirect to login
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
      {/* ✅ TOP SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-800 p-5 rounded-lg shadow-lg">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-lg">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage papers, assign reviewers, track progress & print papers.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <Link
            href="/dashboard/admin/manage-users"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm"
          >
            👥 Manage Users
          </Link>
          <Link
            href="/dashboard/admin/review-papers"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-500 hover:to-teal-400 text-sm"
          >
            ✅ Review Papers
          </Link>
          <Link
            href="/dashboard/admin/printed-papers"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-sm"
          >
            🖨 Printed Papers
          </Link>
          <Link
            href="/dashboard/admin/work-estimation"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-sm"
          >
            📊 Work Estimation
          </Link>
          <Link
            href="/dashboard/admin/work-progress"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm"
          >
            ⏳ Work Progress
          </Link>
          <Link
  href="/dashboard/admin/studyleave"
  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm"
>
  📝 Reviewer Requests
</Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-sm"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ✅ CREATE COLLECTION */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-3 border-l-4 border-indigo-500 pl-3">
          Create Paper Collection
        </h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="e.g., 2025 A/L"
            value={newCollection}
            onChange={(e) => setNewCollection(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddCollection}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Add
          </button>
        </div>
        <ul className="mt-3 text-gray-300 space-y-1">
          {collections.map((c) => (
            <li key={c._id}>{c.name}</li>
          ))}
        </ul>
      </div>

      {/* ✅ ADD PAPER */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-3 border-l-4 border-indigo-500 pl-3">
          Add Paper
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Paper Title"
            value={newPaper.title}
            onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
          />
          <input
            type="text"
            placeholder="Paper Subject"
            value={newPaper.subject}
            onChange={(e) => setNewPaper({ ...newPaper, subject: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
          />
          <select
            value={newPaper.collectionId}
            onChange={(e) =>
              setNewPaper({ ...newPaper, collectionId: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
          >
            <option value="">Select Collection</option>
            {collections.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="url"
            placeholder="Google Drive Link"
            value={newPaper.driveLink}
            onChange={(e) =>
              setNewPaper({ ...newPaper, driveLink: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
          />
          <button
            onClick={handleAddPaper}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Add Paper
          </button>
        </div>
      </div>

      {/* ✅ MANAGE PAPERS COLLECTION-WISE */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-3 border-l-4 border-indigo-500 pl-3">
          Manage Papers (Collection-wise)
        </h2>
        {collections.length === 0 ? (
          <p className="text-gray-400">No collections found.</p>
        ) : (
          collections.map((collection) => {
            const collectionPapers = papers.filter(
              (p) => p.collectionId?._id === collection._id
            );
            return (
              <div key={collection._id} className="mb-6">
                <h3 className="text-xl font-bold text-indigo-400 mb-2">
                  📂 {collection.name}
                </h3>
                {collectionPapers.length === 0 ? (
                  <p className="text-gray-500 text-sm ml-2">
                    No papers in this collection.
                  </p>
                ) : (
                  collectionPapers.map((p) => (
                    <div
                      key={p._id}
                      className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition mb-2"
                    >
                      <p className="font-bold text-lg">{p.title}</p>
                      <p className="text-sm text-gray-300">
                        Subject: {p.subject}
                      </p>
                      <p className="text-sm text-gray-300">
                        Status:{" "}
                        <span
                          className={`font-semibold ${
                            p.status === "printed"
                              ? "text-green-400"
                              : p.status === "reviewed"
                              ? "text-yellow-400"
                              : "text-gray-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </p>
                      <p className="text-sm text-gray-300">
                        Reviews: {p.reviewCount || 0} / 3
                      </p>
                      {p.driveLink && (
                        <a
                          href={p.driveLink}
                          target="_blank"
                          className="text-blue-400 hover:underline text-sm"
                        >
                          📄 View Original Paper
                        </a>
                      )}
                      {p.status !== "printed" && (
                        <div className="mt-3 space-y-2">
                          <select
                            value={
                              assignReviewer.paperId === p._id
                                ? assignReviewer.reviewer
                                : p.reviewer || ""
                            }
                            onChange={(e) =>
                              setAssignReviewer({
                                paperId: p._id,
                                reviewer: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                          >
                            <option value="">Select Reviewer</option>
                            {reviewers.map((rev) => (
                              <option key={rev._id} value={rev.name}>
                                {rev.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleAssignReviewer}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                          >
                            {p.reviewer ? "Change Reviewer" : "Assign Reviewer"}
                          </button>
                        </div>
                      )}
                      {p.status === "reviewed" && (
                        <div className="mt-2">
                          <button
                            onClick={() => handleMarkPrinted(p._id)}
                            className="mt-2 w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                          >
                            Mark Printed
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
