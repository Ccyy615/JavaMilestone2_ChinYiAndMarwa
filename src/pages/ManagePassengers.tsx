import { use, useEffect, useState } from "react";
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

    const [formMode, setFormMode] = useState<Mode>("create");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<PassengerRequestDTO>(emptyPassenger);

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
    ////// name===age
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

    function handleSubmit(e: any) {
        e.preventDefault();
        savePassengers().catch(err => {
            console.error(err);
            setError("Failed to save owner.");
        });
    }

    async function savePassengers() {
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
    }

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
            <h2>Passengers Info list</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading && <p>Loading passengers...</p>}

            {/* PASSENGERS TABLE */}
                                 

            {/* FORM */}
            
        </section>
    );
}