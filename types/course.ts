export interface Course {
  id?: string
  title: string
  category: string
  description: string
  price: string
  rating?: number
  imageUrl?: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  lessonCount: number
  durationHours: number
  createdAt?: Date
  updatedAt?: Date
  instructorId?: string
  instructorName?: string
}

export interface CourseFormData {
  title: string
  category: string
  description: string
  price: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  lessonCount: number
  durationHours: number
  image?: File
}
