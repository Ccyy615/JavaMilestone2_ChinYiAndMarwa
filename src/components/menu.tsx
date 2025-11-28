import type { Page } from "../api/type";
import '../App.css'
interface MenuProps {
    currentPage: Page;
    onChangePage: (page: Page) => void;
}
export default function Menu({ currentPage, onChangePage }: MenuProps) {
    return (
        <nav className="menu">
            <ul>
                <li>
                    <button
                        className={currentPage === "home" ? "active" : ""}
                        onClick={() => onChangePage("home")}
                    >
                        Home
                    </button>
                </li>
                <li>
                    <button
                        className={currentPage === "flights" ? "active" : ""}
                        onClick={() => onChangePage("flights")}
                    >
                        Manage Flights
                    </button>
                </li>
                <li>
                    <button
                        className={currentPage === "passengers" ? "active" : ""}
                        onClick={() => onChangePage("passengers")}
                    >
                        Manage Passengers
                    </button>
                </li>
                <li>
                    <button
                        className={currentPage === "about" ? "active" : ""}
                        onClick={() => onChangePage("about")}
                    >
                        About
                    </button>
                </li>
            </ul>
        </nav>
    );
} 
