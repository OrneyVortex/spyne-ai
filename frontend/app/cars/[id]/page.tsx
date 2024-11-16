'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { mockCars, Car } from '../../../lib/mock-data'

export default function CarDetails({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<Car | null>(null)
  const router = useRouter()

  useEffect(() => {
    const foundCar = mockCars.find(c => c.id === params.id)
    setCar(foundCar || null)
  }, [params.id])

  const handleDelete = () => {
    // In a real application, you would make an API call here
    // For now, we'll just redirect to the dashboard
    router.push('/')
  }

  if (!car) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{car.title}</h1>
      <div className="mb-4">
        <p className="text-lg mb-2">{car.description}</p>
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
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {car.images.map((image, index) => (
          <img key={index} src={image} alt={`Car image ${index + 1}`} className="w-full h-48 object-cover rounded" />
        ))}
      </div>
      <div className="flex space-x-4">
        <Link href={`/cars/${car.id}/edit`}>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Edit
          </button>
        </Link>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Delete
        </button>
        <Link href="/">
          <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  )
}