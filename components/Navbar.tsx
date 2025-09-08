import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Earning engine</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Link href="/courses">
              <Button variant="ghost">Manage Courses</Button>
            </Link>
            <Link href="/courses/create">
              <Button>Create Course</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
