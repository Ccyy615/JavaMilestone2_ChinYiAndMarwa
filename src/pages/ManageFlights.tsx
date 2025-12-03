import DetailViews from "../components/DetailViews"
import { useState, useEffect, use } from "react";
import { apiGet, apiDelete, apiPost, apiPut, apiGetById } from "../api/api";
import type { 
    FlightsResponsetDTO, 
    FlightsRequestDTO, PassengerResponseDTO } from "../models/models"
type Mode = "create" | "edit";

function FlightsPage() {
    const [flights, setFlights] = useState<FlightsResponsetDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formMode, setFormMode] = useState<Mode>("create");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [passengers, setPassengers] = useState<PassengerResponseDTO[]>([])
    const [selectedFlightId, setSelectedFlightId] = useState<number | null>();
    const [showSelectedFlight,setShowSelectedFlight]=useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [postperPage, setPostperpage] = useState(3);

    const[showmodalEdit,setShowModalEdit]=useState(false);

    const [formData, setFormData] = useState<FlightsRequestDTO>(
        {
            airline: "",
            placeDepart: "",
            departDate: "",
            departTime: "",
            destination: "",
            arrivalDate: "",
            arrivalTime: "",
            price: 0,
        }
    );


    const filteredFlights = flights.filter((f) =>
        search === "" ? true : (
            f.airline.toLowerCase().includes(search.toLowerCase()) ||
            f.placeDepart.toLowerCase().includes(search.toLowerCase()) ||
            f.destination.toLowerCase().includes(search.toLowerCase())
        )
    );
    
    const lastPostIndex = currentPage * postperPage;
    const firstPostIndex = lastPostIndex - postperPage;
    const currentPosts = filteredFlights.slice(firstPostIndex, lastPostIndex);

    function goToNextPage() {
        const totalPages = Math.ceil(flights.length / postperPage);
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    }

    function goToPreviousPage() {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }


    async function loadFlights() {
        try {
            setLoading(true);
            setError(null);
            const data = await apiGet("/flights");
            const sorted = (data as FlightsResponsetDTO[]).sort(
                (a, b) => a.flightId - b.flightId
            );
            setFlights(sorted);
            setFlights(data as FlightsResponsetDTO[]);
        } catch (err) {
            console.error(err);
            setError("Failed to load flight");
        } finally {
            setLoading(false);
        }
    }



    function handleChange(e: any) {
        const { name, value } = e.target;
        setFormData((prev: FlightsRequestDTO) => ({
            ...prev,
            [name]: name === "price" ? Number(value) : value
        })
        );
    }


    async function handleDelete(id: number) {
        if (!window.confirm("Are you sure you want to delete this flight?")) return;
        try {
            setError(null);
            await apiDelete(`/flights/${id}`);
            setFlights((prev) => prev.filter((f) => f.flightId !== id));
        } catch (err) {
            console.error(err);
            setError("Failed to delete flight.");
        }
    }

    async function loadPassengerDetails() {
        if (!selectedFlightId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await apiGetById("/flights", selectedFlightId, "/passengers");
            setPassengers(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load passengers of the flight.");
        } finally {
            setLoading(false);
        }
    }


        async function handleEdit(flights: FlightsResponsetDTO){
            setFormMode("edit");
            setEditingId(flights.flightId);

            setFormData({
                airline: flights.airline,
                placeDepart: flights.placeDepart,
                destination: flights.destination,
                departDate: flights.departDate,
                arrivalDate: flights.arrivalDate,
                departTime: flights.departTime,
                arrivalTime: flights.arrivalTime,
                price: flights.price
            });
        }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            console.log("Submitting form data:", formData);
            await apiPost("/flights", formData);
            await loadFlights();
            setFormData({
                airline: "",
                placeDepart: "",
                departDate: "",
                departTime: "",
                destination: "",
                arrivalDate: "",
                arrivalTime: "",
                price: 0
            });
            setShowModal(false);

            console.log("Flight added successfully!");

        } catch (err) {
            console.error("Error adding flight:", err);
            setError("Failed to add flight. Please try again.");
        }
    }

    async function handleSubmitEdit(e: React.FormEvent) {
    e.preventDefault();

    try {
        console.log("Editing flight:", formData);

        await apiPut(`/flights/${editingId}`, formData);

        await loadFlights();
        setShowModalEdit(false);
        setFormData({
            airline: "",
            placeDepart: "",
            departDate: "",
            departTime: "",
            destination: "",
            arrivalDate: "",
            arrivalTime: "",
            price: 0
        });

        console.log("Flight edited successfully!");
    } catch (err) {
        console.error("Error editing flight:", err);
        setError("Failed to edit flight.");
    }
}




    useEffect(() => {
        loadPassengerDetails()
        loadFlights();
    }, [selectedFlightId]);

    return (
        <div className="flights-page">
            <input
                type="text"
                placeholder="Search by airline or city..."
                value={search}
                className="flight-search"
                onChange={(e) => (setSearch(e.target.value))}
            />
            <button className="btn" onClick={() => setShowModal(true)}>Add</button>
            <button onClick={goToPreviousPage}>previous</button>
            <button onClick={goToNextPage}>next</button>


            {showModal && (
                <div className="modal">
                    <div className="modal-content">

                        <h3>Enter the information of the flight</h3>
                        <form className="formFlights" onSubmit={handleSubmit}>

                            <label>Enter the Airline:</label>
                            <input name="airline" type="text" onChange={handleChange} value={formData.airline} />

                            <label>Enter the place of Depart:</label>
                            <input name="placeDepart" type="text" onChange={handleChange} value={formData.placeDepart} />

                            <label>Enter Depart Date:</label>
                            <input name="departDate" type="date" onChange={handleChange} value={formData.departDate} />

                            <label>Enter Depart Time:</label>
                            <input name="departTime" type="time" onChange={handleChange} value={formData.departTime} />

                            <label>Enter Destination:</label>
                            <input name="destination" type="text" onChange={handleChange} value={formData.destination} />

                            <label>Enter Arrival Date:</label>
                            <input name="arrivalDate" type="date" onChange={handleChange} value={formData.arrivalDate} />

                            <label>Enter Arrival Time:</label>
                            <input name="arrivalTime" type="time" onChange={handleChange} value={formData.arrivalTime} />

                            <label>Enter Price:</label>
                            <input name="price" type="number" onChange={handleChange} value={formData.price} />

                            <button className="close-modal" type="submit">Submit</button>
                            <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                        </form>

                    </div>

                </div>
            )

            }
            <div className="flights-container">
                {currentPosts.map((flight) => (
                    <div key={flight.flightId} className="flight-card-purple">

                        <div className="flight-card-header">
                            <div className="flight-circle">{flight.flightId}</div>
                            <span className="flight-airline">{flight.airline}</span>
                        </div>

                        <table className="flight-table">
                            <tbody>

                                <tr>
                                    <th>From</th>
                                    <td>{flight.placeDepart}</td>
                                </tr>

                                <tr>
                                    <th>Departure Date</th>
                                    <td>{flight.departDate}</td>
                                </tr>

                                <tr>
                                    <th>Departure Time</th>
                                    <td>{flight.departTime}</td>
                                </tr>

                                <tr>
                                    <th>To</th>
                                    <td>{flight.destination}</td>
                                </tr>

                                <tr>
                                    <th>Arrival Date</th>
                                    <td>{flight.arrivalDate}</td>
                                </tr>

                                <tr>
                                    <th>Arrival Time</th>
                                    <td>{flight.arrivalTime}</td>
                                </tr>

                                <tr>
                                    <th>Price</th>
                                    <td>${flight.price}</td>
                                </tr>

                            </tbody>
                        </table>

                        <div className="actions-cell">
                            <button className="edit-btn" onClick={()=>{handleEdit(flight);
                                setShowModalEdit(true);
                            } }>Edit</button>


                        {showmodalEdit && (
                <div className="modal">
                    <div className="modal-content">

                        <h3>Enter the information of the flight</h3>
                        <form className="formFlights" onSubmit={handleSubmitEdit}>

                            <label>Enter the Airline:</label>
                            <input name="airline" type="text" onChange={handleChange} value={formData.airline} />

                            <label>Enter the place of Depart:</label>
                            <input name="placeDepart" type="text" onChange={handleChange} value={formData.placeDepart} />

                            <label>Enter Depart Date:</label>
                            <input name="departDate" type="date" onChange={handleChange} value={formData.departDate} />

                            <label>Enter Depart Time:</label>
                            <input name="departTime" type="time" onChange={handleChange} value={formData.departTime} />

                            <label>Enter Destination:</label>
                            <input name="destination" type="text" onChange={handleChange} value={formData.destination} />

                            <label>Enter Arrival Date:</label>
                            <input name="arrivalDate" type="date" onChange={handleChange} value={formData.arrivalDate} />

                            <label>Enter Arrival Time:</label>
                            <input name="arrivalTime" type="time" onChange={handleChange} value={formData.arrivalTime} />

                            <label>Enter Price:</label>
                            <input name="price" type="number" onChange={handleChange} value={formData.price} />

                            <button className="close-modal" type="submit">Submit</button>
                            <button className="btn" onClick={() => setShowModalEdit(false)}>Cancel</button>
                        </form>

                    </div>

                </div>
            )
        }

                            <button className="remove-btn" onClick={() => handleDelete(flight.flightId)}>Remove</button>
                            <button className="viewDetails.btn" onClick={()=> showSelectedFlight? (setShowSelectedFlight(false),setSelectedFlightId(null)): (setSelectedFlightId(flight.flightId),setShowSelectedFlight(true))}>View Details</button>
                        </div>

                    </div>
                ))}

                {selectedFlightId && (
                    <DetailViews
                        flightId={selectedFlightId}
                        onClose={() => setSelectedFlightId(null)}
                    />
                )}
            </div>
        </div>

    );
}


export default FlightsPage

