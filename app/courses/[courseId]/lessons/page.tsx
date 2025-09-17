// app/courses/[courseId]/lessons/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Edit, Trash2, Video, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Lesson, LessonFormData } from "@/types/course"

interface LessonsPageProps {
  params: {
    courseId: string
  }
}

export default function LessonsPage({ params }: LessonsPageProps) {
  const router = useRouter()
  const { courseId } = params
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    description: "",
    duration: "",
    videoUrl: "",
    order: 1,
    content: "",
    resources: [],
  })

  useEffect(() => {
    fetchLessons()
  }, [courseId])

  const fetchLessons = async () => {
    try {
      const q = query(
        collection(db, "lessons"),
        where("courseId", "==", courseId),
        orderBy("order", "asc")
      )
      const querySnapshot = await getDocs(q)
      const lessonsData: Lesson[] = []

      querySnapshot.forEach((doc) => {
        lessonsData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as Lesson)
      })

      setLessons(lessonsData)
    } catch (error) {
      console.error("Error fetching lessons:", error)
    }
  }

  const handleInputChange = (field: keyof LessonFormData, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const lessonData = {
        courseId,
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        videoUrl: formData.videoUrl,
        order: formData.order,
        content: formData.content || "",
        resources: formData.resources || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      if (editingLesson && editingLesson.id) {
        // Update existing lesson
        await updateDoc(doc(db, "lessons", editingLesson.id), lessonData)
      } else {
        // Create new lesson
        await addDoc(collection(db, "lessons"), lessonData)
      }

      // Reset form and refresh lessons
      setFormData({
        title: "",
        description: "",
        duration: "",
        videoUrl: "",
        order: lessons.length + 1,
        content: "",
        resources: [],
      })
      setShowForm(false)
      setEditingLesson(null)
      fetchLessons()
    } catch (error) {
      console.error("Error saving lesson:", error)
      alert("Failed to save lesson. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFormData({
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl,
      order: lesson.order,
      content: lesson.content || "",
      resources: lesson.resources || [],
    })
    setShowForm(true)
  }

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    try {
      await deleteDoc(doc(db, "lessons", lessonId))
      fetchLessons()
    } catch (error) {
      console.error("Error deleting lesson:", error)
      alert("Failed to delete lesson")
    }
  }

  const cancelEdit = () => {
    setShowForm(false)
    setEditingLesson(null)
    setFormData({
      title: "",
      description: "",
      duration: "",
      videoUrl: "",
      order: lessons.length + 1,
      content: "",
      resources: [],
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/courses" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manage Lessons</h1>
              <p className="text-muted-foreground mt-2">Add and manage lessons for this course</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </div>
        </div>

        {/* Lesson Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</CardTitle>
              <CardDescription>
                {editingLesson ? "Update the lesson details" : "Fill in the details for the new lesson"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Lesson Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Introduction to Bitcoin"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this lesson covers..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration *</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 15 minutes"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="order">Order *</Label>
                    <Input
                      id="order"
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => handleInputChange("order", Number.parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://youtube.com/embed/..."
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Lesson Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Add detailed content for this lesson..."
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingLesson ? (
                      "Update Lesson"
                    ) : (
                      "Add Lesson"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lessons List */}
        {lessons.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by adding your first lesson to this course
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Lesson
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center">
                        {lesson.videoUrl ? (
                          <Video className="h-5 w-5 mr-2 text-primary" />
                        ) : (
                          <FileText className="h-5 w-5 mr-2 text-primary" />
                        )}
                        {lesson.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{lesson.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(lesson)}
                        className="h-8 px-2 bg-transparent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => lesson.id && handleDelete(lesson.id)}
                        className="h-8 px-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Duration: {lesson.duration}</span>
                    <span>Order: {lesson.order}</span>
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