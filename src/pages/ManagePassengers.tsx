import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../api/api";
import type {
    PassengerRequestDTO,
    PassengerResponseDTO
} from "../models/models";

type Mode = "create" | "edit";

const emptyPassenger: PassengerRequestDTO = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    phoneNumber: "",
    email: "",
    passportNumber: "",
    passportExpiryDate: "",
    creditCardNumber: "",
    numOfBaggage: 0,
};

export default function ManagePassengers() {

    const [passengers, setPassengers] = useState<PassengerResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [formMode, setFormMode] = useState<Mode>("create");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<PassengerRequestDTO>(emptyPassenger);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 5;

    useEffect(() => {
        loadPassengers();
    }, []);

    async function loadPassengers() {
        try {
            setLoading(true);
            setError(null);
            const data = (await apiGet("/passengers")) as any[];

            const minimal = (data || []).map(d => ({
                passengerId: d.passengerId,
                firstName: d.firstName,
                lastName: d.lastName,
            })) as PassengerResponseDTO[];
            setPassengers(minimal);
        } catch (err) {
            console.error(err);
            setError("Failed to load passengers.");
        } finally {
            setLoading(false);
        }
    }

    /*const filteredPassengers = passengers.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
    );
  
    const totalPages = Math.max(1, Math.ceil(filteredPassengers.length / rowsPerPage));*/

    const filteredPassengers = passengers.filter(p =>
        p.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPassengers.length / rowsPerPage);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
        if (page < 1) setPage(1);
    }, [filteredPassengers.length, totalPages]);

    const paginatedPassengers = filteredPassengers.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    function openAddModal() {
        setFormMode("create");
        setFormData(emptyPassenger);
        setEditingId(null);
        setShowModal(true);
    }

    async function handleEdit(passengerRow: PassengerResponseDTO) {
        try {
            setLoading(true);
            setError(null);
            const full = (await apiGet(`/passengers/${passengerRow.passengerId}`)) as any;
            const payload: PassengerRequestDTO = {
                firstName: full.firstName ?? "",
                lastName: full.lastName ?? "",
                dateOfBirth: full.dateOfBirth ?? "",
                gender: full.gender ?? "",
                address: full.address ?? "",
                phoneNumber: full.phoneNumber ?? "",
                email: full.email ?? "",
                passportNumber: full.passportNumber ?? "",
                passportExpiryDate: full.passportExpiryDate ?? "",
                creditCardNumber: full.creditCardNumber ?? "",
                numOfBaggage: full.numOfBaggage ?? 0,
            };
            setFormMode("edit");
            setEditingId(passengerRow.passengerId);
            setFormData(payload);
            setShowModal(true);
        } catch (err) {
            console.error(err);
            setError("Failed to load passenger for editing.");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e: any) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "numOfBaggage" ? Number(value) : value
        }));
    }

    async function savePassengers() {
        setError(null);

        let response: any = null;

        if (formMode === "create") {
            response = await apiPost("/passengers", formData);
        } else if (formMode === "edit" && editingId != null) {
            response = await apiPut(`/passengers/${editingId}`, formData);
        }

        if (!response) return;

        const minimalPassenger: PassengerResponseDTO = {
            passengerId: response.passengerId,
            firstName: response.firstName,
            lastName: response.lastName,
        };

        if (formMode === "create") {
            setPassengers(prev => [...prev, minimalPassenger]);
        } else {
            setPassengers(prev =>
                prev.map(p => (p.passengerId === editingId ? minimalPassenger : p))
            );
        }
    }

    async function handleSubmit(e: any) {
        e.preventDefault();
        setError(null);
        try {
            await savePassengers();
            setShowModal(false);
            resetForm();
        } catch (err) {
            console.error(err);
            setError("Failed to save passenger.");
        }
    }

    function resetForm() {
        setFormData(emptyPassenger);
        setFormMode("create");
        setEditingId(null);
    }

    async function handleDelete(passengerId: number) {
        if (!window.confirm("Are you sure you want to delete this passenger?")) return;
        try {
            await apiDelete(`/passengers/${passengerId}`);
            setPassengers(prev => prev.filter(p => p.passengerId !== passengerId));
        } catch (err) {
            console.error(err);
            setError("Failed to delete passenger.");
        }
    }

    return (
        <section>
            <div>
                <h2>Passengers</h2>
                <button onClick={openAddModal}>
                    + Add Passenger
                </button>
            </div>

            <div className="passengerSearch">
                <input
                
                    placeholder="Search passengers..."
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
            </div>
                <div>
                    {loading && <small>Loading…</small>}
                    {error && <small >error</small>}
                </div>
            

            <table className="passengers-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedPassengers.map(p => (
                        <tr key={p.passengerId}>
                            <td>{p.passengerId}</td>
                            <td>{p.firstName}</td>
                            <td>{p.lastName}</td>
                            <td>
                                <div>
                                    <button onClick={() => handleEdit(p)} style={{ color: "green" }}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(p.passengerId)} style={{ color: "red" }}>
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {paginatedPassengers.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ padding: 12, textAlign: "center" }}>
                                No passengers
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* pagination */}
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    Previous
                </button>
                <span>
                    Page {page} / {totalPages}
                </span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    Next
                </button>
            </div>

            {showModal && (
                <div className="Pmodal-overlay">
                    <div className="Pmodal">
                        <div className="Pmodal-header">
                            <h2>Add Passenger Infomation</h2>
                            <h3>{formMode === "create" ? "Add Passenger" : "Edit Passenger"}</h3>
                            <button className="Pmodal-close-btn" onClick={() => { setShowModal(false); resetForm(); }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* Row 1 */}
                            <div className="Pmodal-form-row">
                                <input
                                    className="Pmodal-input"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    className="Pmodal-input"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    className="Pmodal-input"
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Row 2 */}
                            <div className="Pmodal-form-row">
                                <input
                                    className="Pmodal-input"
                                    name="address"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />

                                <input
                                    className="Pmodal-input"
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />

                                <input
                                    className="Pmodal-input"
                                    name="email"
                                    placeholder="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Row 3 */}
                            <div className="Pmodal-form-row">
                                <input
                                    className="modal-input"
                                    name="passportNumber"
                                    placeholder="Passport Number"
                                    value={formData.passportNumber}
                                    onChange={handleChange}
                                />

                                <input
                                    className="Pmodal-input"
                                    type="date"
                                    name="passportExpiryDate"
                                    value={formData.passportExpiryDate}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Row 4 */}
                            <div className="Pmodal-form-row">
                                <input
                                    className="Pmodal-input"
                                    name="creditCardNumber"
                                    placeholder="Credit Card Number"
                                    value={formData.creditCardNumber}
                                    onChange={handleChange}
                                />

                                <input
                                    className="Pmodal-input"
                                    name="numOfBaggage"
                                    type="number"
                                    placeholder="Baggage (0-4)"
                                    min={0}
                                    max={4}
                                    value={formData.numOfBaggage}
                                    onChange={(e) => {
                                        let n = Number(e.target.value);
                                        if (n < 0) n = 0;
                                        if (n > 4) n = 4;
                                        setFormData(prev => ({ ...prev, numOfBaggage: n }));
                                    }}
                                />
                            </div>

                            <div className="Pmodal-actions">
                                <button type="submit">
                                    {formMode === "create" ? "Add" : "Save"}
                                </button>
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}>
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </section>
    );
}
