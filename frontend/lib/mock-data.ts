export interface Car {
    id: string
    title: string
    description: string
    images: string[]
    tags: string[]
    owner: {
      name: string
      email: string
    }
  }
  
  export const mockCars: Car[] = [
    {
      id: '1',
      title: '2022 Tesla Model 3',
      description: 'Sleek electric sedan with impressive range and performance.',
      images: [
        '/placeholder.svg?height=300&width=400',
        '/placeholder.svg?height=300&width=400',
        '/placeholder.svg?height=300&width=400',
      ],
      tags: ['electric', 'sedan', 'tesla'],
      owner: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
    {
      id: '2',
      title: '2021 Ford Mustang GT',
      description: 'Powerful muscle car with iconic design and thrilling performance.',
      images: [
        '/placeholder.svg?height=300&width=400',
        '/placeholder.svg?height=300&width=400',
      ],
      tags: ['muscle', 'sports', 'ford'],
      owner: {
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
    },
    {
      id: '3',
      title: '2023 Toyota RAV4 Hybrid',
      description: 'Efficient and spacious hybrid SUV for eco-conscious drivers.',
      images: [
        '/placeholder.svg?height=300&width=400',
        '/placeholder.svg?height=300&width=400',
        '/placeholder.svg?height=300&width=400',
        '/placeholder.svg?height=300&width=400',
      ],
      tags: ['hybrid', 'suv', 'toyota'],
      owner: {
        name: 'Bob Johnson',
        email: 'bob@example.com',
      },
    },
  ]