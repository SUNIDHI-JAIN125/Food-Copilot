// app/user-info/page.jsx
"use client"

import { useUser } from '@auth0/nextjs-auth0/client'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import {ModeToggle} from "@/components/ui/modetoggle"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UserInfo() {
  const { user, error, isLoading } = useUser()

  const [schedule, setSchedule] = useState([
    { id: 1, className: "Mathematics", day: "Monday", time: "09:00 AM" },
    { id: 2, className: "Physics", day: "Tuesday", time: "10:30 AM" }
  ])
  const [favoriteRecipes, setFavoriteRecipes] = useState([
    { id: 1, name: "French Toast" },
    { id: 2, name: "Sandwitch" }
  ])
  const [dietaryRestrictions, setDietaryRestrictions] = useState("No restrictions set.")

  const saveDietaryRestrictions = (restrictions: string) => {
    setDietaryRestrictions(restrictions)
  }

  const addNewClass = (className: string, day: string, time: string) => {
    const newClass = { id: Date.now(), className, day, time }
    setSchedule((prev) => [...prev, newClass])
  }

  const addFavoriteRecipe = (recipe: string) => {
    const newRecipe = { id: Date.now(), name: recipe }
    setFavoriteRecipes((prev) => [...prev, newRecipe])
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  return (
    <div className="flex flex-col items-center bg-gray-50 dark:bg-black min-h-screen p-6 space-y-8">
      {user ? (
        <>
          {/* Profile Section with ModeToggle */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center space-y-4 w-full max-w-md">
            <div className="absolute top-4 right-4">
              <ModeToggle />
            </div>
            <Image
              src={user.picture || '/default-picture.png'}
              alt={user.name || 'User'}
              width={100}
              height={100}
              className="rounded-full border-4 border-gray-300 dark:border-gray-700 shadow-sm"
            />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{user.name || 'User'}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            <a href="/api/auth/logout" className="w-full">
              <Button variant="destructive" className="w-full flex items-center justify-center space-x-2 mt-4 dark:bg-gray-700 dark:text-white">
                Logout
              </Button>
            </a>
          </div>

          {/* Information Sections */}
          <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Class Schedule */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Class Schedule</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {schedule.map((classItem) => (
                  <li key={classItem.id} className="flex items-center space-x-2">
                    <span>•</span>
                    <span>{classItem.className} - {classItem.day} at {classItem.time}</span>
                  </li>
                ))}
              </ul>
              {/* Add Class Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 dark:text-gray-300 dark:border-gray-700">Add New Class</Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">Add New Class</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.target as HTMLFormElement)
                      addNewClass(formData.get('className') as string, formData.get('day') as string, formData.get('time') as string)
                    }}
                  >
                    <Label htmlFor="className" className="dark:text-gray-300">Class Name</Label>
                    <Input name="className" placeholder="Enter class name" required className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300" />
                    <Label htmlFor="day" className="mt-4 dark:text-gray-300">Day</Label>
                    <Input name="day" placeholder="Enter day" required className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300" />
                    <Label htmlFor="time" className="mt-4 dark:text-gray-300">Time</Label>
                    <Input name="time" type="time" required className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300" />
                    <DialogFooter>
                      <Button type="submit" className="dark:bg-gray-700 dark:text-white">Add Class</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Favorite Recipes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Favorite Recipes</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {favoriteRecipes.map((recipe) => (
                  <li key={recipe.id} className="flex items-center space-x-2">
                    <span>•</span>
                    <span>{recipe.name}</span>
                  </li>
                ))}
              </ul>
              {/* Add Recipe Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 dark:text-gray-300 dark:border-gray-700">Add Favorite Recipe</Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">Add Favorite Recipe</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.target as HTMLFormElement)
                      addFavoriteRecipe(formData.get('recipe') as string)
                    }}
                  >
                    <Label htmlFor="recipe" className="dark:text-gray-300">Recipe Name</Label>
                    <Input name="recipe" placeholder="Enter recipe name" required className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300" />
                    <DialogFooter>
                      <Button type="submit" className="dark:bg-gray-700 dark:text-white">Add Recipe</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Dietary Restrictions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Dietary Restrictions</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{dietaryRestrictions}</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 dark:text-gray-300 dark:border-gray-700">Set Dietary Restrictions</Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">Set Dietary Restrictions</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.target as HTMLFormElement)
                      saveDietaryRestrictions(formData.get('restrictions') as string)
                    }}
                  >
                    <Label htmlFor="restrictions" className="dark:text-gray-300">Dietary Restrictions</Label>
                    <textarea
                      name="restrictions"
                      placeholder="Enter any dietary restrictions"
                      required
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 p-2"
                    />
                    <DialogFooter>
                      <Button type="submit" className="dark:bg-gray-700 dark:text-white">Save Restrictions</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      ) : (
        <div className="text-gray-800 dark:text-gray-200">Please log in to view your profile information.</div>
      )}
    </div>
  )
}
