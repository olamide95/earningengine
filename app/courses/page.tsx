// app/courses/page.tsx
"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Edit, Trash2, BookOpen } from "lucide-react"
import Link from "next/link"
import type { Course } from "@/types/course"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCourses(filtered)
  }, [courses, searchTerm])

  const fetchCourses = async () => {
    try {
      const q = query(collection(db, "courses"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const coursesData: Course[] = []

      querySnapshot.forEach((doc) => {
        coursesData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        } as Course)
      })

      setCourses(coursesData)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      await deleteDoc(doc(db, "courses", courseId))
      setCourses(courses.filter((course) => course.id !== courseId))
    } catch (error) {
      console.error("Error deleting course:", error)
      alert("Failed to delete course")
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manage Courses</h1>
              <p className="text-muted-foreground mt-2">View and manage all published courses</p>
            </div>
            <Link href="/courses/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="mb-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Total: {courses.length} courses</span>
            <span>Showing: {filteredCourses.length} courses</span>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {courses.length === 0 ? "No courses yet" : "No courses found"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {courses.length === 0 ? "Get started by creating your first course" : "Try adjusting your search terms"}
              </p>
              {courses.length === 0 && (
                <Link href="/courses/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Course
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {course.imageUrl && (
                    <img
                      src={course.imageUrl || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="mt-1">{course.category}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(course.difficulty)}>{course.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{course.description}</p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{course.lessonCount} lessons</span>
                    <span>{course.durationHours}h duration</span>
                    <span className="font-semibold text-primary">{course.price}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/courses/${course.id}/lessons`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Edit className="mr-2 h-4 w-4" />
                        Manage Lessons
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => course.id && handleDeleteCourse(course.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}