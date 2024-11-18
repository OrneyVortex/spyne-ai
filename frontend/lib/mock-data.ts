import Cookie from 'js-cookie'

// Define the Car interface
export interface Car {
  _id: string
  title: string
  description: string
  images: string[]
  tags: string[]
  user: string
  
}

// Function to fetch cars data from the backend API
export const mockCars = async (): Promise<Car[]> => {
  const token = Cookie.get('accessToken') // Get the access token from cookies

  if (!token) {
    console.error('Access token not found')
    return []
  }

  try {
    const response = await fetch('https://spyne-ai-backend-production.up.railway.app/api/cars', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Attach the token in the Authorization header
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch car data')
    }

    const data = await response.json()
    console.log('Car data:', data)
    return data // Return the array of cars fetched from the API
  } catch (error) {
    console.error('Error fetching car data:', error)
    return [] // Return an empty array in case of an error
  }
}
