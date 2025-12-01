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

    // PAGINATION
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
            setPassengers(data as PassengerResponseDTO[]);
        } catch (err) {
            console.error(err);
            setError("Failed to load passengers.");
        } finally {
            setLoading(false);
        }
    }

    // FILTER + PAGINATE
    const filteredPassengers = passengers.filter(p =>
        p.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPassengers.length / rowsPerPage);
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

    function handleChange(e: any) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: 
                name === "passengerId"
                ? Number(value) 
                : value
        }));
    }

    async function handleSubmit(e: any) {
        e.preventDefault();

        try {
            if (formMode === "create") {
                const created = await apiPost("/passengers", formData);
                setPassengers(prev => [...prev, created]);
            } else if (formMode === "edit" && editingId != null) {
                const updated = await apiPut(`/passengers/${editingId}`, formData);
                setPassengers(prev =>
                    prev.map(p =>
                        p.passengerId === editingId ? updated : p
                    )
                );
            }
            setShowModal(false);
        } catch {
            setError("Failed to save passenger.");
        }


        savePassengers().catch(err => {
            console.error(err);
            setError("Failed to save passenger.");
        });
    }


    async function savePassengers() {
    setError(null);

    if (formMode === "create") {
        const created = await apiPost("/passengers", formData);

        // Only keep passengerId, firstName, lastName
        const minimalPassenger: PassengerResponseDTO = {
            passengerId: created.passengerId,
            firstName: created.firstName,
            lastName: created.lastName
        };

        setPassengers(prev => [...prev, minimalPassenger]);
    } 
    else if (formMode === "edit" && editingId != null) {
        const updated = await apiPut(`/passengers/${editingId}`, formData);

        const minimalPassenger: PassengerResponseDTO = {
            passengerId: updated.passengerId,
            firstName: updated.firstName,
            lastName: updated.lastName
        };

        setPassengers(prev =>
            prev.map(p =>
                p.passengerId === editingId ? minimalPassenger : p
            )
        );
    }

    resetForm();
}

    /*async function savePassengers() {
        setError(null);

        if (formMode === "create") {
            const created = await apiPost("/passengers", formData);
            setPassengers(prev => [...prev, created as PassengerResponseDTO]);
        } else if (formMode === "edit" && editingId != null) {
            const updated = await apiPut(`/passengers/${editingId}`, formData);
            setPassengers(prev =>
                prev.map(p => (p.passengerId === editingId ? (updated as PassengerResponseDTO) : p))
            );
        }

        resetForm();
    }*/

    function resetForm() {
        setFormData(emptyPassenger);
        setFormMode("create");
        setEditingId(null);
    }

    function handleEdit(passengers: PassengerResponseDTO) {
        setFormMode("edit");
        setEditingId(passengers.passengerId);

        setFormData({
            firstName: passengers.firstName,
            lastName: passengers.lastName,
            dateOfBirth: "",
            gender: "",
            address: "",
            phoneNumber: "",
            email: "",
            passportNumber: "",
            passportExpiryDate: "",
            creditCardNumber: "",
            numOfBaggage: 0,
        });
        setShowModal(true);
    }

    async function handleDelete(passengerId: number) {
        if (!window.confirm("Delete this passenger?")) return;
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

            {/* TITLE + ADD BUTTON */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Passengers</h2>

                <button
                    onClick={openAddModal}
                    style={{ padding: "8px 12px", background: "blue", color: "white" }}
                >
                    + Add Passenger
                </button>
            </div>

            {/* SEARCH */}
            <input
                type="text"
                placeholder="Search passengers..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ marginBottom: "10px", marginTop: "10px", width: "200px" }}
            />

            {loading && <p>Loading…</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* TABLE */}
            <table className="passengers-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        
                    </tr>
                </thead>

                <tbody>
                    {paginatedPassengers.map(p => (
                        <tr key={p.passengerId}>
                            <td>{p.passengerId}</td>
                            <td>{p.firstName}</td>
                            <td>{p.lastName}</td>
                            

                            <td>
                                <button style={{ color: "green" }} onClick={() => handleEdit(p)}>
                                    Edit
                                </button>
                                <button style={{ color: "red", marginLeft: "10px" }}
                                    onClick={() => handleDelete(p.passengerId)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* PAGINATION */}
            <div style={{ marginTop: "10px" }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    Previous
                </button>

                <span style={{ margin: "0 10px" }}>
                    Page {page} / {totalPages || 1}
                </span>

                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    Next
                </button>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>{formMode === "create" ? "Add Passenger" : "Edit Passenger"}</h3>

                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="text"
                                name="datoOfBirth"
                                placeholder="Birth date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="gender"
                                placeholder="Male/ Female"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="text"
                                name="phoneNumber"
                                placeholder="Phone"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="text"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="text"
                                name="passportNumber"
                                placeholder="Passport number"
                                value={formData.passportNumber}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="text"
                                name="passportExpiryDate"
                                placeholder="Passport Expiry Date"
                                value={formData.passportExpiryDate}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="text"
                                name="numberOfBaggage"
                                placeholder="Baggage number"
                                value={formData.numOfBaggage}
                                onChange={handleChange}
                                required
                            />

                            

                            <div style={{ marginTop: "10px" }}>
                                <button type="submit">
                                    {formMode === "create" ? "Add" : "Save"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ marginLeft: "10px" }}
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



    /*return (
        <section>

            <div>
            <h2>Passengers Info list</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading && <p>Loading passengers...</p>}
            </div>

             {/* SEARCH */ /*
            <input
                type="text"
                placeholder="Search passengers..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ marginBottom: "10px", width: "200px" }}
            />

            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading && <p>Loading...</p>}



            {/* PASSENGERS TABLE */ /*

            <table className="passengers-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                    </tr>
                </thead>

                <tbody>
                    {paginatedPassengers.map(passenger => (
                        <tr key={passenger.passengerId}>
                            <td>{passenger.passengerId}</td>
                            <td>{passenger.firstName}</td>
                            <td>{passenger.lastName}</td>

                            <td>
                                <button
                                    className="editButton"
                                    onClick={() => handleEdit(passenger)}
                                    style={{ color: "green" }}
                                >
                                    Edit
                                </button>

                                <button
                                    className="deleteButton"
                                    onClick={() => handleDelete(passenger.passengerId)}
                                    style={{ color: "red" }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>


            {/* PAGINATION */ /*
            <div style={{ marginTop: "10px" }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    Previous
                </button>

                <span style={{ margin: "0 10px" }}>
                    Page {page} / {totalPages === 0 ? 1 : totalPages}
                </span>

                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    Next
                </button>
            </div>
                                 

            {/* FORM */ /*

            <h3>{formMode === "create" ? "Add New Passenger" : "Edit Passenger"}</h3>

            <form onSubmit={handleSubmit} className="passenger-form">
                <input
                    type="text"
                    name="PassengerFirstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="PassengerLastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />

                

                <button type="submit" className="btn-submit">
                    {formMode === "create" ? "Add Passenger" : "Update Passenger"}
                </button>
            </form>

            
        </section>
    );*/
}