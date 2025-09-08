"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import type { CourseFormData } from "@/types/course"

const categories = [
  "Crypto Fundamentals",
  "Wallet Setup",
  "Technical Analysis",
  "Risk Management",
  "Derivatives",
  "Algo Trading",
  "DeFi Protocols",
  "NFT Trading",
  "Portfolio Management",
]

export default function CreateCoursePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    category: "",
    description: "",
    price: "",
    difficulty: "Beginner",
    lessonCount: 1,
    durationHours: 1,
  })

  const handleInputChange = (field: keyof CourseFormData, value: string | number | File) => {
    if (field === "image" && value instanceof File) {
      setFormData((prev) => ({ ...prev, image: value }))
      // Create preview URL
      const previewUrl = URL.createObjectURL(value)
      setImagePreview(previewUrl)
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now()
    const fileName = `course-images/${timestamp}-${file.name}`
    const storageRef = ref(storage, fileName)

    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imageUrl = ""

      // Upload image if provided
      if (formData.image) {
        imageUrl = await uploadImage(formData.image)
      }

      // Create course document
      const courseData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price: formData.price,
        difficulty: formData.difficulty,
        lessonCount: formData.lessonCount,
        durationHours: formData.durationHours,
        imageUrl,
        rating: 4.0, // Default rating
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        instructorName: "Course Creator",
      }

      await addDoc(collection(db, "courses"), courseData)

      router.push("/courses?created=true")
    } catch (error) {
      console.error("Error creating course:", error)
      alert("Failed to create course. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Create New Course</h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details below to create a new course for your students
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>Basic details about your course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Bitcoin Trading Fundamentals"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what students will learn in this course..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        placeholder="e.g., $99 or Free"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Difficulty Level *</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) =>
                          handleInputChange("difficulty", value as "Beginner" | "Intermediate" | "Advanced")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lessonCount">Number of Lessons *</Label>
                      <Input
                        id="lessonCount"
                        type="number"
                        min="1"
                        value={formData.lessonCount}
                        onChange={(e) => handleInputChange("lessonCount", Number.parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="durationHours">Duration (Hours) *</Label>
                      <Input
                        id="durationHours"
                        type="number"
                        min="1"
                        step="0.5"
                        value={formData.durationHours}
                        onChange={(e) => handleInputChange("durationHours", Number.parseFloat(e.target.value) || 1)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Image</CardTitle>
                  <CardDescription>Upload a cover image for your course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Course preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-transparent"
                          onClick={() => {
                            setImagePreview(null)
                            setFormData((prev) => ({ ...prev, image: undefined }))
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">Upload course image</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleInputChange("image", file)
                          }}
                          className="cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Publish Course</CardTitle>
                  <CardDescription>Review and publish your course</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !formData.title || !formData.category || !formData.description}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Course...
                      </>
                    ) : (
                      "Create Course"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
