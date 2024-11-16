'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockCars, Car } from '../lib/mock-data'

export default function Dashboard() {
  const [cars, setCars] = useState<Car[]>(mockCars)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    const filteredCars = mockCars.filter(car =>
      car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setCars(filteredCars)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Car Dealership Dashboard</h1>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search cars..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-slate-700 text-white rounded-md hover:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Search
        </button>
      </div>
      <Link href="/cars/add">
        <button className="mb-4 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500">
          Add New Car
        </button>
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <Link href={`/cars/${car.id}`} key={car.id} className="border dark:border-gray-600 rounded-lg p-4 shadow-md dark:bg-gray-900">
            <h2 className="text-xl font-bold mb-2">{car.title}</h2>
            <p className="mb-2">{car.description}</p>
            <div className="mb-2">
              {car.tags.map((tag) => (
                <span key={tag} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Owner: {car.owner.name} ({car.owner.email})
            </p>
            <Link href={`/cars/${car.id}`}>
              <button className="px-2 py-1 my-2 text-sm bg-slate-700 dark:bg-slate-300 dark:text-black text-white rounded-md hover:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500">
                View Details
              </button>
            </Link>
          </Link>
        ))}
      </div>
    </div>
  )
}