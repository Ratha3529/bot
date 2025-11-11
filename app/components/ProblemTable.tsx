"use client";
import { useEffect, useState } from "react";

type Problem = {
  id: number;
  name: string;
  name_telegram: string;
  created_at: string;
  problem: string;
  status: number;
  problem_number: number;
};

type FilterType = {
  label: string;
  value: number;
};

const filterData: FilterType[] = [
  { label: "All", value: 0 },
  { label: "Pending", value: 1 },
  { label: "Success", value: 2 },
];

export default function ProblemTable() {
  const [search, setSearch] = useState("");
  const [selectedFilterValue, setSelectedFilterValue] = useState<number>(0);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPageOne, setTotalPageOne] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: rowsPerPage.toString(),
          search,
          status:
            selectedFilterValue === 0 ? "" : selectedFilterValue.toString(),
        });

        const URL = `https://bot.ezegroup.store/api/telegram-problems?${params}`;
        const res = await fetch(URL);
        if (!res.ok) throw new Error("Failed to fetch problems");

        const data = await res.json();
        setTotalPageOne(data.pagination.total_pages);
        setProblems(data.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [page, search, selectedFilterValue, rowsPerPage]);

  const filtered = problems?.filter(
    (p) =>
      p?.name_telegram?.toLowerCase()?.includes(search?.toLowerCase()) &&
      (selectedFilterValue === 0 || p.status === selectedFilterValue)
  );

  const handleSend = async (id: number) => {
    try {
      setLoadingId(id);
      const res = await fetch(
        `https://bot.ezegroup.store/api/telegram-problems/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: 2 }),
        }
      );

      if (!res.ok) throw new Error("Failed to update problem status");

      setProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 2 } : p))
      );
    } catch (err) {
      console.error("Error while sending:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const displayStatus = (status: number) => {
    switch (status) {
      case 0:
        return "All";
      case 1:
        return "Pending";
      case 2:
        return "Success";
      default:
        return "All";
    }
  };

  // Open modal
  const openDetailModal = (problem: Problem) => {
    setSelectedProblem(problem);
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-2 sm:p-2 h-screen flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Telegram Bot</h2>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial"> 
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm hover:border-gray-400 outline-none shadow-sm transition-all duration-200"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
          

          {/* Filter */}
          <div className="relative">
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm hover:border-gray-400 outline-none appearance-none pr-8 transition-all cursor-pointer"
              value={
                filterData.find((item) => selectedFilterValue === item.value)
                  ?.label!
              }
              onChange={(e) => {
                setSelectedFilterValue(
                  filterData.find((item) => e.target.value === item.label)
                    ?.value!
                );
                setPage(1);
              }}
            >
              {filterData.map((item) => (
                <option key={item.label}>{item.label}</option>
              ))}
            </select>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute right-3 top-2.5 text-gray-500 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative flex flex-col border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-orange-500 text-gray-800 uppercase text-xs font-semibold sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-left rounded-tl-xl">No</th>
              <th className="py-3 px-4 text-left">Problem Number</th>
              <th className="py-3 px-4 text-left">Name Problem</th>
              <th className="py-3 px-4 text-left">Created At</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center rounded-tr-xl">Action</th>
            </tr>
          </thead>
        </table>
        <div className="overflow-auto" style={{ maxHeight: "75vh" }}>
          <table className="min-w-full border-collapse">
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center text-red-500 py-6">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-6">
                    No problems found.
                  </td>
                </tr>
              ) : (
                filtered.map((p, index) => (
                  <tr
                    key={p.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-b border-gray-200 hover:bg-blue-50 transition-all`}
                  >
                    <td className="p-3 text-blue-600  text-center font-medium">{p.id}</td>
                    <td className="p-3 text-gray-800 text-center font-semibold">
                      {p.problem_number}
                    </td>
                    <td className="p-3 font-semibold text-center text-gray-800 truncate max-w-xs">
                      {p.problem}
                    </td>
                    <td className="p-3 text-center text-gray-600">{p.created_at}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs  font-semibold ${p.status === 2
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {displayStatus(p.status)}
                      </span>

                    </td>
                    <td className="p-3 text-center space-x-1">
                      {p.status === 1 ? (
                        <button
                          onClick={() => handleSend(p.id)}
                          disabled={loadingId === p.id}
                          className={`${loadingId === p.id
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                            } text-white px-3 py-1 rounded-full text-xs font-semibold transition`}
                        >
                          {loadingId === p.id ? "Sending..." : "Send"}
                        </button>
                      ) : (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Done
                        </span>
                      )}

                      {/* Detail button */}
                      <button
                        onClick={() => openDetailModal(p)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold transition"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-end text-sm text-gray-700">
          {/* Rows per page */}
          <div className="flex items-center gap-1 mr-4">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="border-none bg-transparent focus:ring-0 cursor-pointer text-gray-700"
            >
              {[10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* Pagination info */}
          <div className="mr-4">
            {(page - 1) * rowsPerPage + 1}–
            {Math.min(page * rowsPerPage, totalPageOne * rowsPerPage)} of{" "}
            {totalPageOne * rowsPerPage}
          </div>
          {/* Arrows */}
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className={`p-1.5 rounded-md transition ${page === 1
                  ? "text-gray-300 cursor-default"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              disabled={page === totalPageOne}
              onClick={() => setPage((p) => Math.min(p + 1, totalPageOne))}
              className={`p-1.5 rounded-md transition ${page === totalPageOne
                  ? "text-gray-300 cursor-default"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedProblem && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-50">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn">
            {/* Header */}
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              🧾 Problem Detail
            </h3>

            {/* Detail Content */}
            <div className="space-y-3 text-gray-700 text-sm">
              <div>
                <span className="font-semibold text-gray-900">Problem Number:</span>{" "}
                <span>{selectedProblem.problem_number}</span>
              </div>

              <div>
                <span className="font-semibold text-gray-900">Created At:</span>{" "}
                <span>{new Date(selectedProblem.created_at).toLocaleString()}</span>
              </div>

              <div>
                <span className="font-semibold text-gray-900">Status:</span>{" "}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedProblem.status === 2
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                  {selectedProblem.status === 2 ? "Success" : "Pending"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Name Problem:</span>
                <div className="mt-2 p-3 rounded-md text-gray-900 border bg-gray-50 border-gray-200 whitespace-pre-wrap">
                  {selectedProblem.problem}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 hover:bg-gray-200 text-white px-5 py-2 rounded-md text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

