import '../App.css'
import type { Page } from "../api/type";
import ManageResouce1 from '../pages/ManageResouce1';
import ManageResouce2 from '../pages/ManageResouce2';
import Home from '../pages/Home';
import About from '../pages/About';


interface MainBodyProps {
    currentPage: Page;
}

export default function MainBody({ currentPage }: MainBodyProps) {
    return (
        <main className="main-body">
            {currentPage === "home" && <Home />}
            {currentPage === "flights" && <ManageResouce1 />}
            {currentPage === "passengers" && <ManageResouce2 />}
            {currentPage === "about" && <About />}
        </main>
    );
}