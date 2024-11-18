'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookie from 'js-cookie';
import type { Car } from '../lib/mock-data';

export default function Dashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookie.get('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      const fetchCars = async () => {
        try {
          const response = await fetch('https://spyne-ai-backend-production.up.railway.app/api/cars', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch car data');
          }

          const data = await response.json();
          console.log(data);
          setCars(data);
          setFilteredCars(data); // Set both the full list and filtered list
        } catch (error) {
          console.error('Error fetching car data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCars();
    }
  }, [router]);

  useEffect(() => {
    const filtered = cars.filter((car) =>
      car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredCars(filtered); // Update filtered cars based on search query
  }, [searchQuery, cars]); // Run this whenever searchQuery or cars change

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Car Dealership Dashboard</h1>
        <a
          href="https://spyne-ai-backend-production.up.railway.app/api/docs/swagger.json"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          GO TO SWAGGER API
        </a>
      </div>
      
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search cars..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
      </div>
      <Link href="/cars/add">
        <button className="mb-4 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500">
          Add New Car
        </button>
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCars.map((car) => (
          <Link href={`/cars/${car._id}`} key={car._id} className="border dark:border-gray-600 rounded-lg p-4 shadow-md dark:bg-gray-900">
            <h2 className="text-xl font-bold mb-2">{car.title}</h2>
            <p className="mb-2">{car.description}</p>
            <div className="mb-2">
              {car.tags && car.tags.length > 0
                ? car.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                  >
                    {tag.replace(/[\[\]"]/g, '')} {/* Removes unwanted characters */}
                  </span>
                ))
                : 'No tags available'}
            </div>
            <p className="text-sm text-gray-500">
              Owner: {car.user || 'Unknown'} {/* Display username */}
            </p>
            <Link href={`/cars/${car._id}`}>
              <button className="px-2 py-1 my-2 text-sm bg-slate-700 dark:bg-slate-300 dark:text-black text-white rounded-md hover:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500">
                View Details
              </button>
            </Link>
          </Link>
        ))}
      </div>
    </div>
  );
}
