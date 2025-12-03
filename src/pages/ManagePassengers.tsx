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
    const [availableFlights, setAvailableFlights] = useState<number[]>([]);

    const [showModal, setShowModal] = useState(false);
    const [formMode, setFormMode] = useState<Mode>("create");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<PassengerRequestDTO>(emptyPassenger);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 5;

    useEffect(() => {
        loadPassengers();
        loadAvailableFlights();
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
                phoneNumber: d.phoneNumber || "",
                email: d.email || "",
                passportNumber: d.passportNumber || "",
                passportExpiryDate: d.passportExpiryDate || "",
                creditCardNumber: d.creditCardNumber || "",
                numOfBaggage: d.numOfBaggage || 0,
                flightId: d.flightId,
            })) as PassengerResponseDTO[];

            setPassengers(passengersData);

        } catch (err) {
            console.error(err);
            setError("Failed to load passengers.");
        } finally {
            setLoading(false);
        }
    }

    async function loadAvailableFlights() {
        try {
            const flights = await apiGet("/flights");
            const flightIds = flights.map((f: any) => f.flightId);
            setAvailableFlights(flightIds);
            console.log("Available flight IDs:", flightIds);
        } catch (err) {
            console.error("Failed to load flights:", err);
        }
    }

    const filteredPassengers = passengers.filter(
        (p) =>
            p.firstName.toLowerCase().includes(search.toLowerCase()) ||
            p.lastName.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredPassengers.length / rowsPerPage);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) setPage(totalPages);
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

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "numOfBaggage" || name === "flightId" 
                ? Number(value) 
                : value,
        }));
    }

    async function handleSubmitAdd(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            console.log("Submitting form data:", formData);
            
            // Validate required fields
            if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.flightId) {
                setError("First name, last name, and flight ID are required");
                setLoading(false);
                return;
            }
            
            // Validate flight ID exists
            if (!availableFlights.includes(Number(formData.flightId))) {
                setError(`Flight ID ${formData.flightId} not found. Available IDs: ${availableFlights.join(', ')}`);
                setLoading(false);
                return;
            }
            
            // Prepare data - ensure no nulls for required backend validation
            const today = new Date().toISOString().split('T')[0];
            const defaultBirthDate = new Date();
            defaultBirthDate.setFullYear(defaultBirthDate.getFullYear() - 25);
            const defaultBirthDateStr = defaultBirthDate.toISOString().split('T')[0];
            
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 5);
            const futureDateStr = futureDate.toISOString().split('T')[0];
            
            const formattedData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : defaultBirthDateStr,
                gender: formData.gender || "Not Specified",
                address: formData.address || "",
                phoneNumber: formData.phoneNumber || "",
                email: formData.email || "user@example.com",
                passportNumber: formData.passportNumber || "NOT_PROVIDED",
                passportExpiryDate: formData.passportExpiryDate ? formData.passportExpiryDate.split('T')[0] : futureDateStr,
                creditCardNumber: formData.creditCardNumber || "",
                numOfBaggage: Number(formData.numOfBaggage) || 0,
                flightId: Number(formData.flightId),
            };
            
            console.log("Sending to backend:", formattedData);
            
            const response = await apiPost("/passengers", formattedData);
            console.log("Success! Response:", response);
            
            // Add to state immediately
            const newPassenger: PassengerResponseDTO = {
                passengerId: response.passengerId,
                firstName: response.firstName,
                lastName: response.lastName,
                phoneNumber: response.phoneNumber || "",
                email: response.email || "",
                passportNumber: response.passportNumber || "",
                passportExpiryDate: response.passportExpiryDate || "",
                creditCardNumber: response.creditCardNumber || "",
                numOfBaggage: response.numOfBaggage || 0,
                flightId: response.flightId,
            };
            
            setPassengers(prev => [...prev, newPassenger]);
            setFormData(emptyPassenger);
            setShowModal(false);

            console.log("Passenger added successfully!");

        } catch (err: any) {
            console.error("Error adding passenger:", err);
            
            let errorMessage = "Failed to add passenger.";
            if (err.message.includes("Passport is expired")) {
                errorMessage = "Passport expiry date must be in the future.";
            } else if (err.message.includes("Invalid Age")) {
                errorMessage = "Passenger must be at least 18 years old.";
            } else if (err.message.includes("Flight not found")) {
                errorMessage = "Invalid Flight ID. Please enter a valid flight ID.";
            } else if (err.message.includes("First name is required") || 
                       err.message.includes("Last name is required") ||
                       err.message.includes("Flight ID is required")) {
                errorMessage = err.message;
            } else if (err.message.includes("400")) {
                errorMessage = `Server validation error: ${err.message}`;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    async function handleEdit(passengerRow: PassengerResponseDTO) {
        try {
            setLoading(true);
            setError(null);

            const full = await apiGet(`/passengers/${passengerRow.passengerId}`);
            
            // Format dates for frontend (YYYY-MM-DD to date input format)
            const payload: PassengerRequestDTO = {
                firstName: full.firstName ?? "",
                lastName: full.lastName ?? "",
                dateOfBirth: full.dateOfBirth ? full.dateOfBirth.split('T')[0] : "",
                gender: full.gender ?? "",
                address: full.address ?? "",
                phoneNumber: full.phoneNumber ?? "",
                email: full.email ?? "",
                passportNumber: full.passportNumber ?? "",
                passportExpiryDate: full.passportExpiryDate ? full.passportExpiryDate.split('T')[0] : "",
                creditCardNumber: full.creditCardNumber ?? "",
                numOfBaggage: full.numOfBaggage ?? 0,
                flightId: full.flightId ?? 0,
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

    async function handleSubmitEdit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            console.log("Editing passenger:", formData);
            
            // Validate required fields
            if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.flightId) {
                setError("First name, last name, and flight ID are required");
                setLoading(false);
                return;
            }
            
            // Format dates for backend
            const formattedData = {
                ...formData,
                dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : null,
                passportExpiryDate: formData.passportExpiryDate ? formData.passportExpiryDate.split('T')[0] : null,
                flightId: Number(formData.flightId),
                numOfBaggage: Number(formData.numOfBaggage) || 0,
            };
            
            await apiPut(`/passengers/${editingId}`, formattedData);
            await loadPassengers();
            setShowModal(false);
            setFormData(emptyPassenger);

            console.log("Passenger edited successfully!");
        } catch (err: any) {
            console.error("Error editing passenger:", err);
            
            let errorMessage = "Failed to edit passenger.";
            if (err.message.includes("Passport is expired")) {
                errorMessage = "Passport expiry date must be in the future.";
            } else if (err.message.includes("Invalid Age")) {
                errorMessage = "Passenger must be at least 18 years old.";
            } else if (err.message.includes("Flight not found")) {
                errorMessage = "Invalid Flight ID. Please enter a valid flight ID.";
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
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
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Flight ID</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedPassengers.map((p) => (
                        <tr key={p.passengerId}>
                            <td>{p.passengerId}</td>
                            <td>{p.firstName}</td>
                            <td>{p.lastName}</td>
                            <td>{p.email}</td>
                            <td>{p.phoneNumber}</td>
                            <td>{p.flightId}</td>
                            <td>
                                <button onClick={() => handleEdit(p)} 
                                        style={{ color: "#d8c2ff" }}>
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(p.passengerId)}
                                    style={{ color: "#ff8fb3" }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {paginatedPassengers.length === 0 && (
                        <tr>
                            <td colSpan={7} style={{ textAlign: "center", padding: 15 }}>
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
                    &nbsp;&nbsp;Page {page} / {totalPages || 1}&nbsp;&nbsp;
                </span>
                <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)}>
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
                                    setFormData(emptyPassenger);
                                }}
                                disabled={loading}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={formMode === "edit" ? handleSubmitEdit : handleSubmitAdd}>
                            <div className="Pmodal-form-row">
                                <input
                                    className="Pmodal-input"
                                    name="firstName"
                                    placeholder="First Name *"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                                <input
                                    className="Pmodal-input"
                                    name="lastName"
                                    placeholder="Last Name *"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                                <input
                                    className="Pmodal-input"
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="Pmodal-form-row">
                                <input
                                    className="Pmodal-input"
                                    name="gender"
                                    placeholder="Gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <input
                                    className="Pmodal-input"
                                    name="address"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <input
                                    className="Pmodal-input"
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="Pmodal-form-row">
                                <input
                                    className="Pmodal-input"
                                    name="email"
                                    placeholder="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <input
                                    className="Pmodal-input"
                                    name="passportNumber"
                                    placeholder="Passport Number"
                                    value={formData.passportNumber}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <input
                                    className="Pmodal-input"
                                    type="date"
                                    name="passportExpiryDate"
                                    value={formData.passportExpiryDate}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="Pmodal-form-row">
                                <input
                                    className="Pmodal-input"
                                    name="creditCardNumber"
                                    placeholder="Credit Card Number"
                                    value={formData.creditCardNumber}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <input
                                    className="Pmodal-input"
                                    name="flightId"
                                    type="number"
                                    placeholder={`Flight ID * (Available: ${availableFlights.join(', ') || 'none'})`}
                                    value={formData.flightId}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    list="flightIds"
                                />
                                <datalist id="flightIds">
                                    {availableFlights.map(id => (
                                        <option key={id} value={id} />
                                    ))}
                                </datalist>
                                <input
                                    className="Pmodal-input"
                                    type="number"
                                    name="numOfBaggage"
                                    min={0}
                                    max={4}
                                    placeholder="Number of Baggage"
                                    value={formData.numOfBaggage}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="Pmodal-actions">
                                <button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : (formMode === "edit" ? "Save" : "Add Passenger")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData(emptyPassenger);
                                    }}
                                    disabled={loading}
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