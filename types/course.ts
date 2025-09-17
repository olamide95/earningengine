// types/course.ts
export interface Course {
  id?: string;
  title: string;
  category: string;
  description: string;
  price: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lessonCount: number;
  durationHours: number;
  imageUrl: string;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
  instructorName: string;
}

export interface Lesson {
  id?: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  order: number;
  content?: string; // For text-based lessons
  resources?: string[]; // URLs to additional resources
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseFormData {
  title: string;
  category: string;
  description: string;
  price: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lessonCount: number;
  durationHours: number;
  image?: File;
}

export interface LessonFormData {
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  order: number;
  content?: string;
  resources?: string[];
}