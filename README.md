Flight Management System
A full-stack web application built with React for frontend, Spring Boot for backend, and PostgreSQL for the database that allows users to manage flights and passengers.
This project was created for my The Java Web course with Haikel Hichri 


Frontend (React + TypeScript)
Search flights by airline, departure city, or destination
View passengers for each flight
Add, edit, and delete flights and passengers information
Add passengers and link them to a flight
Page navigation using custom components (Home, Flights, Passengers, About)

Backend (Spring Boot)
REST API with CRUD endpoints for:
Flights
Passengers
CRUD OPERATIONS FOR BOTH
Add (flight & passenger info)
Edit (flight & passenger info)
Delete (flight & passenger)

DTOs used for clean request/response
PostgreSQL database

Database (PostgreSQL)
-used render.com to have the PostgreSQL


Frontend
React (TypeScript)
Vite
Axios for http requests
CSS

Backend
Spring Boot
Java 17

Database
PostgreSQL

Project Structure
Components in the project

Components folder:
DetailsViews: when button View Details, in the flight page, is clicked the flight shows all their passengers on that specific class
Footer
Header
mainBody: switches the pages in our site
menu: for the navbar to go through the pages

Pages folder:
About
Home

ManageFlights
ManagePassengers

PassengersPage
FlightsPage

Hosted
Backend on render.com
Frontend render.com