import { useEffect, useState } from "react";
import type { PassengerResponseDTO } from "../models/models";
import { apiGetById } from "../api/api";

type DetailViewsProps = {
  flightId: number;
  onClose: () => void;
};

export default function DetailViews({ flightId, onClose }: DetailViewsProps) {
  const [passengers, setPassengers] = useState<PassengerResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  async function loadPassengers() {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGetById("/flights", flightId, "/passengers");
      setPassengers(data as PassengerResponseDTO[]);

    } catch (err) {
      console.error(err);
      setError("Failed to load passengers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPassengers();
  }, [flightId]);


  // Pagination logic
  const lastIndex = currentPage * perPage;
  const firstIndex = lastIndex - perPage;
  const currentPassengers = passengers.slice(firstIndex, lastIndex);

  const totalPages = Math.ceil(passengers.length / perPage);

  function nextPage() {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  }

  function prevPage() {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  }

  return (
    <div className="detailView-container">
      <div className="detailView-header">
        <h2>Passengers for Flight {flightId} ({passengers.length})</h2>

        <button className="close-detail-btn" onClick={onClose}>
          ✕ Hide Details
        </button>
      </div>

      {loading && <p className="loading">Loading passenger list…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && passengers.length === 0 && (
        <p className="empty">No passengers for this flight.</p>
      )}

      {!loading && passengers.length > 0 && (
        <table className="detailView-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First</th>
              <th>Last</th>
              <th>Flight</th>
            </tr>
          </thead>

          <tbody>
            {currentPassengers.map((p) => (
              <tr key={p.passengerId}>
                <td>{p.passengerId}</td>
                <td>{p.firstName}</td>
                <td>{p.lastName}</td>
                <td>{p.flightId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {passengers.length > perPage && (
        <div className="detailView-pagination">
          <button onClick={prevPage} disabled={currentPage === 1}>
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button onClick={nextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
