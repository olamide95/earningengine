"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, TrendingUp, Star, DollarSign } from "lucide-react"
import type { Course } from "@/types/course"

interface AnalyticsData {
  coursesByDifficulty: { [key: string]: number }
  coursesByCategory: { [key: string]: number }
  totalRevenue: number
  averageRating: number
  totalCourses: number
  revenueByMonth: { [key: string]: number }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    coursesByDifficulty: {},
    coursesByCategory: {},
    totalRevenue: 0,
    averageRating: 0,
    totalCourses: 0,
    revenueByMonth: {},
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      const coursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"))
      const coursesSnapshot = await getDocs(coursesQuery)

      const coursesByDifficulty: { [key: string]: number } = {}
      const coursesByCategory: { [key: string]: number } = {}
      const revenueByMonth: { [key: string]: number } = {}
      let totalRevenue = 0
      let totalRating = 0
      let ratingCount = 0

      coursesSnapshot.forEach((doc) => {
        const courseData = doc.data() as Course

        // Count by difficulty
        coursesByDifficulty[courseData.difficulty] = (coursesByDifficulty[courseData.difficulty] || 0) + 1

        // Count by category
        coursesByCategory[courseData.category] = (coursesByCategory[courseData.category] || 0) + 1

        // Calculate revenue
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

        // Revenue by month (simulated)
        const createdAt = courseData.createdAt?.toDate?.() || new Date()
        const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`
        if (price && price !== "Free" && price.startsWith("$")) {
          const numericPrice = Number.parseFloat(price.replace("$", ""))
          if (!isNaN(numericPrice)) {
            revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + numericPrice * 10
          }
        }
      })

      setAnalytics({
        coursesByDifficulty,
        coursesByCategory,
        totalRevenue,
        averageRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0,
        totalCourses: coursesSnapshot.size,
        revenueByMonth,
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setIsLoading(false)
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
          <p className="text-muted-foreground">Loading analytics...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-2">Detailed insights into your course performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageRating || "N/A"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue/Course</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.totalCourses > 0 ? formatCurrency(analytics.totalRevenue / analytics.totalCourses) : "$0"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Courses by Difficulty */}
          <Card>
            <CardHeader>
              <CardTitle>Courses by Difficulty</CardTitle>
              <CardDescription>Distribution of courses across difficulty levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.coursesByDifficulty).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{difficulty}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(count / analytics.totalCourses) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Courses by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Courses by Category</CardTitle>
              <CardDescription>Popular course categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.coursesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-secondary h-2 rounded-full"
                            style={{
                              width: `${(count / analytics.totalCourses) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Month</CardTitle>
              <CardDescription>Monthly revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(analytics.revenueByMonth).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No revenue data available yet</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(analytics.revenueByMonth)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([month, revenue]) => (
                      <div key={month} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{month}</span>
                        <span className="text-sm font-semibold text-primary">{formatCurrency(revenue)}</span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
