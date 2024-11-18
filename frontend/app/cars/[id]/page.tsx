'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookie from 'js-cookie'; // Import the Cookie library

export default function CarDetails({ params }: { params: { id: string } }) {
  interface Car {
    title: string;
    description: string;
    tags?: string[];

    images?: string[];
    _id: string;
  }

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`https://spyne-ai-backend-production.up.railway.app/api/cars/${params.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Cookie.get('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Car not found');
        }

        const data = await response.json();
        setCar(data);
      } catch (error) {
        console.error('Error fetching car details:', error);
        router.push('/'); // Redirect to dashboard if car is not found
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [params.id, router]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`https://spyne-ai-backend-production.up.railway.app/api/cars/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${Cookie.get('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the car');
      }

      router.push('/'); // Redirect to the dashboard after deletion
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!car) return <div>Car not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{car.title}</h1>
      <div className="mb-4">
        <p className="text-lg mb-2">{car.description}</p>
        <div className="mb-2">
          {car.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
            >
              {tag.replace(/[\[\]"]/g, '')}
            </span>
          ))}
        </div>
        {/* <p className="text-sm text-gray-500">
          Owner: {car.user?.name || 'unknown'} ({car.owner?.email || 'unknown'})
        </p> */}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {car.images?.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Car image ${index + 1}`}
            className="w-full h-48 object-cover rounded"
          />
        ))}
      </div>
      <div className="flex space-x-4">
        <Link href={`/cars/${car._id}/edit`}>
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
  );
}
