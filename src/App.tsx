import { useState } from 'react'
import Header from './components/Header'
import Menu from './components/menu'
import MainBody from './components/mainBody'
import Footer from './components/Footer'
import type { Page } from './api/type'
import './App.css'
export default function App() {
    const [currentPage, setCurrentPage] = useState<Page>("home");
    return (
        <div className="container">
            <Header />
            <Menu currentPage={currentPage} onChangePage={setCurrentPage} />
            <MainBody currentPage={currentPage} />
            <Footer />
        </div>
    );
}