"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, Users, TrendingUp, Star, Clock, DollarSign } from "lucide-react"
import type { Course } from "@/types/course"

interface DashboardStats {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  averageRating: number
  recentCourses: Course[]
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    recentCourses: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const coursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"))
      const coursesSnapshot = await getDocs(coursesQuery)

      const courses: Course[] = []
      let totalRevenue = 0
      let totalRating = 0
      let ratingCount = 0

      coursesSnapshot.forEach((doc) => {
        const courseData = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        } as Course

        courses.push(courseData)

        // Calculate revenue (assuming price format like "$99" or "Free")
        const price = courseData.price
        if (price && price !== "Free" && price.startsWith("$")) {
          const numericPrice = Number.parseFloat(price.replace("$", ""))
          if (!isNaN(numericPrice)) {
            totalRevenue += numericPrice * 10 // Simulate 10 students per course
          }
        }

        // Calculate average rating
        if (courseData.rating) {
          totalRating += courseData.rating
          ratingCount++
        }
      })

      const recentCourses = courses.slice(0, 5)
      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0

      setStats({
        totalCourses: courses.length,
        totalStudents: courses.length * 10, // Simulate 10 students per course
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        recentCourses,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-600"
      case "Intermediate":
        return "text-yellow-600"
      case "Advanced":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Course Creator Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Upload and manage courses for your crypto & trading education platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">courses published</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">enrolled students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">total earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating || "N/A"}</div>
              <p className="text-xs text-muted-foreground">course rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with creating and managing your courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/courses/create">
                <Button className="w-full justify-start" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Course
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Courses
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Courses */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Courses</CardTitle>
              <CardDescription>Your latest published courses</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="mb-4">No courses yet. Start by creating your first course!</p>
                  <Link href="/courses/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Course
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl || "/placeholder.svg"}
                          alt={course.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.category}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span className={getDifficultyColor(course.difficulty)}>{course.difficulty}</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {course.durationHours}h
                          </span>
                          <span className="flex items-center">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {course.lessonCount} lessons
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{course.price}</p>
                        {course.rating && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                            {course.rating}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <Link href="/courses">
                      <Button variant="outline" className="w-full bg-transparent">
                        View All Courses
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Key metrics for your course performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">{stats.totalCourses}</div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary mb-2">{stats.totalStudents}</div>
                  <p className="text-sm text-muted-foreground">Total Enrollments</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-2">{formatCurrency(stats.totalRevenue)}</div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
