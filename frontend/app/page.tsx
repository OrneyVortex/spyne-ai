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
          setCars(data);
          setFilteredCars(data); // Set filtered cars initially
        } catch (error) {
          console.error('Error fetching car data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCars();
    }
  }, [router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const newFilteredCars = cars.filter((car) =>
      car.title.toLowerCase().includes(query.toLowerCase()) ||
      car.description.toLowerCase().includes(query.toLowerCase()) ||
      car.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredCars(newFilteredCars);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Car Dealership Dashboard</h1>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search cars..."
          value={searchQuery}
          onChange={handleSearchChange} // Real-time search filtering
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
          <div key={car.id} className="border dark:border-gray-600 rounded-lg p-4 shadow-md dark:bg-gray-900">
            <Link href={`/cars/${car.id}`} className="block">
              <h2 className="text-xl font-bold mb-2">{car.title}</h2>
              <p className="mb-2">{car.description}</p>
              <div className="mb-2">
                {car.tags && car.tags.length > 0
                  ? car.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                      >
                        {tag.replace(/[\[\]"]/g, '')}
                      </span>
                    ))
                  : 'No tags available'}
              </div>
              <p className="text-sm text-gray-500">
                Owner: {car.owner?.name || 'unknown'} ({car.owner?.email || 'unknown'})
              </p>
            </Link>
            <div className="flex justify-end">
              <Link href={`/cars/${car.id}`}>
                <button className="px-2 py-1 my-2 text-sm bg-slate-700 dark:bg-slate-300 dark:text-black text-white rounded-md hover:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500">
                  View Details
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
