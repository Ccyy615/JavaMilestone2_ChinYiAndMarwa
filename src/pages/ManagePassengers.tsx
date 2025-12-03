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
    flightId: 0,
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

            const data = await apiGet("/passengers");

            const passengersData = (data as any[]).map(d => ({
                passengerId: d.passengerId,
                firstName: d.firstName,
                lastName: d.lastName,
            })) as PassengerResponseDTO[];

            setPassengers(passengersData);

        } catch (err) {
            console.error(err);
            setError("Failed to load passengers.");
        } finally {
            setLoading(false);
        }
    }

    const filteredPassengers = passengers.filter(
        (p) =>
            p.firstName.toLowerCase().includes(search.toLowerCase()) ||
            p.lastName.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredPassengers.length / rowsPerPage);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
        if (page < 1) setPage(1);
    }, [totalPages]);

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

            const full = await apiGet(`/passengers/${passengerRow.passengerId}`);

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
                flightId: full.flightID ?? 0,
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

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "numOfBaggage" ? Number(value) : value,
        }));
    }

    async function savePassengers() {
        setError(null);

        let response: any = null;

        if (formMode === "create") {
            response = await apiPost("/passengers", formData);

            setPassengers(prev => [...prev, {
                passengerId: response.passengerId,
                firstName: response.firstName,
                lastName: response.lastName,
                flightId: response.flightId,
            }]);
        } else if (formMode === "edit" && editingId != null) {
            response = await apiPut(`/passengers/${editingId}`, formData);

            setPassengers(prev =>
                prev.map(p => p.passengerId === editingId
                    ? {
                        passengerId: response.passengerId,
                        firstName: response.firstName,
                        lastName: response.lastName,
                        flightId: response.flightId
                    }
                    : p
                )
            );
        }

        resetForm();
        setShowModal(false);
    }



    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

    async function handleSubmitAdd(e: React.FormEvent) {
        e.preventDefault();

        try {
            console.log("Submitting form data:", formData);
            await apiPost("/passengers", formData);
            await loadPassengers();
            setFormData(emptyPassenger);
            setShowModal(false);

            console.log("Passenger added successfully!");

        } catch (err) {
            console.error("Error adding passenger:", err);
            setError("Failed to add Passenger. Please try again, make sure all the informations are crrect.");
        }
    }

    async function handleDelete(passengerId: number) {
        if (!window.confirm("Are you sure you want to delete this passenger?")) return;
        try {
            await apiDelete(`/passengers/${passengerId}`);
            setPassengers((prev) => prev.filter((p) => p.passengerId !== passengerId));
        } catch (err) {
            console.error(err);
            setError("Failed to delete passenger.");
        }
    }

    return (
        <section className="passenger-content-section">
            <div className="passenger-title">
                <h2>Passengers</h2>
                <input
                    className="passengerSearch"
                    placeholder="Search passengers..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
            </div>

            {loading && <small>Loading Passengers…</small>}
            {error && <small style={{ color: "red" }}>{error}</small>}

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
                    {paginatedPassengers.map((p) => (
                        <tr key={p.passengerId}>
                            <td>{p.passengerId}</td>
                            <td>{p.firstName}</td>
                            <td>{p.lastName}</td>
                            <td>
                                <button onClick={() => handleEdit(p)} style={{ color: "green" }}>
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(p.passengerId)}
                                    style={{ color: "red" }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {paginatedPassengers.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ textAlign: "center", padding: 15 }}>
                                No passengers
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="passenger-pagination-btn">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                </button>
                <span>
                    &nbsp;&nbsp;Page {page} / {totalPages}&nbsp;&nbsp;
                </span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                </button>
            </div>

            <button className="add-passenger-btn" onClick={openAddModal}>
                + Add Passenger
            </button>

            {showModal && (
                <div className="Pmodal-overlay">
                    <div className="Pmodal">
                        <div className="Pmodal-header">
                            <h2>{formMode === "edit" ? "Edit Passenger" : "Add Passenger"}</h2>
                            <button
                                className="Pmodal-close-btn"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={formMode === "edit" ? handleSubmit : handleSubmitAdd}>
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

                            <div className="Pmodal-form-row">
                                <input
                                    className="Pmodal-input"
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
                                <input
                                    className="Pmodal-input"
                                    name="creditCardNumber"
                                    placeholder="Credit Card Number"
                                    value={formData.creditCardNumber}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="Pmodal-form-row">
                                <label className="small-title" htmlFor="flightId">Flight ID: </label>
                                <input
                                    className="Pmodal-input"
                                    name="flightId"
                                    placeholder="Choose your flight id"
                                    value={formData.flightId}
                                    onChange={handleChange}
                                />
                                <label className="small-title" htmlFor="numOfBaggage">Number of Baggage: </label>
                                <input
                                    className="Pmodal-input"
                                    type="number"
                                    name="numOfBaggage"
                                    min={0}
                                    max={4}
                                    placeholder="Number of Baggage"
                                    value={formData.numOfBaggage}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="Pmodal-actions">
                                <button type="submit">
                                    {formMode === "edit" ? "Save" : "Add Passenger"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
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
