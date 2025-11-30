import '../App.css'
import type { Page } from "../api/type";
import ManageFlights from '../pages/ManageFlights';
import ManagePassengers from '../pages/ManagePassengers';
import Home from '../pages/Home';
import About from '../pages/About';


interface MainBodyProps {
    currentPage: Page;
}

export default function MainBody({ currentPage }: MainBodyProps) {
    return (
        <main className="main-body">
            {currentPage === "home" && <Home />}
            {currentPage === "flights" && <ManageFlights />}
            {currentPage === "passengers" && <ManagePassengers />}
            {currentPage === "about" && <About />}
        </main>
    );
}