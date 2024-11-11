"use client";

import * as React from "react";
import {RefreshCw, Plus, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import logo from "/public/logo.svg";
const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;
const SPOON_KEY = process.env.NEXT_PUBLIC_SPOON_KEY;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { database, ref, onValue, push, set, remove } from "@/components/firebaseconfig";

interface FoodItem {
  name: string;
  quantity: number;
  calorie: number;
}

interface ScheduleItem {
  id: string;
  className: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface Recipe {
  id: number;
  title: string;
  image: string;
}

interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  instructions: string;
}

export default function Component() {
  
  const [foodItems, setFoodItems] = React.useState<FoodItem[]>([]);
  const [schedule, setSchedule] = React.useState<ScheduleItem[]>([]);
  const [className, setClassName] = React.useState("");
  const [day, setDay] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = React.useState<RecipeDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = React.useState(false);
  const [availableTime, setAvailableTime] = React.useState("");
  const [suggestedRecipe, setSuggestedRecipe] = React.useState("");

  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  React.useEffect(() => {
    const aiResponsesRef = ref(database, "ai_responses");
    onValue(aiResponsesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const keys = Object.keys(data);
        const latestKey = keys.length > 0 ? keys[keys.length - 1] : null;
        if (latestKey && data[latestKey]) {
          const latestData = data[latestKey].foodItems;
            const foodItemsWithIds = latestData
            ? Object.keys(latestData).map((key) => ({
              id: key,
              ...latestData[key],
              }))
            : [{ id: "1", name: "Dosa", quantity: 1, calorie: 1000 }];
          setFoodItems(foodItemsWithIds);
        }
      }
    });

    const scheduleRef = ref(database, "schedule");
    onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();
      let loadedSchedule = data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [];
      loadedSchedule = loadedSchedule.sort((a, b) => {
        const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayComparison !== 0) return dayComparison;
        return new Date(`1970-01-01T${a.startTime}`).getTime() - new Date(`1970-01-01T${b.startTime}`).getTime();
      });
      setSchedule(loadedSchedule);
    });
  }, []);

  const handleAddClass = async () => {
    const newClassRef = push(ref(database, "schedule"));
    await set(newClassRef, { className, day, startTime, endTime });
    setClassName("");
    setDay("");
    setStartTime("");
    setEndTime("");
  };

  const handleDeleteClass = async (classId: string) => {
    await remove(ref(database, `schedule/${classId}`));
  };

  const fetchRecipes = async () => {
    const apiKey = SPOON_KEY;
    const ingredients = foodItems.map((item) => item.name).join(',');
    try {
      const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients`, {
        params: { ingredients, apiKey, number: 26, ranking: 2, ignorePantry: true },
      });
      const recipeData: Recipe[] = response.data.map((item: unknown) => {
        const { id, title, image } = item as { id: number; title: string; image: string };
         return { id, title, image };
        });
      setRecipes(recipeData);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handleViewRecipe = async (recipeId: number) => {
    const apiKey = SPOON_KEY;
    try {
      const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
        params: { includeNutrition: false, apiKey },
      });
      const data = response.data;
      setSelectedRecipe({
        id: data.id,
        title: data.title,
        image: data.image,
        instructions: data.instructions,
      });
      if (!GEMINI_KEY) {
        throw new Error("GEMINI_KEY is not defined");
      }
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const parsedInstructions = await model.generateContent(
        `Please itemize the following instructions using proper step numbers and also proper html tag so that it align nicely 
        on the website, make sure to also generate the numbers in from of the each step, for example: 1. Boil water
         don't generate any extra comment or sentence that you are talking to me, 
         make sure the receipe matches with the instructions if not change the instruction with correct receipe , food:${data.title} instructions: ${data.instructions}`
        );
      setSelectedRecipe({
        id: data.id,
        title: data.title,
        image: data.image,
        instructions: parsedInstructions.response.text(),
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  };

  const handlePrepareRecipe = async () => {
    if (!GEMINI_KEY) {
        throw new Error("GEMINI_KEY is not defined");
      }
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
      const response = await model.generateContent(
        `Suggest a recipe that can be prepared in ${availableTime} minutes using ingredients like ${foodItems.map(item => item.name).join(', ')}.`
      );
      setSuggestedRecipe(response.response.text());
      setIsRecipeDialogOpen(false);
    } catch (error) {
      console.error("Error fetching recipe recommendation:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black text-black dark:text-white">
      <header className="sticky top-0 z-50 w-full border-b bg-gray-100 dark:bg-gray-900 shadow-sm">
        <div className="container flex h-32 items-center justify-between px-4">
        <Link href="/" aria-label="Home">
          <div className="flex items-center  space-x-10">
            <Image src={logo} alt="Company Logo" width={100} height={100} />
          <h1 className="text-blue-800 font-sans  text-5xl font-medium">Food Copilot</h1>
          </div>
          </Link>
          <div className="flex items-center space-x-4">
           
          </div>
        </div>
      </header>
      <main className="flex-1 container py-10 px-4 space-y-10 mx-auto max-w-7xl">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 h-12  bg-gray-200 font-mono">
        <TabsTrigger value="dashboard" className="text-gray-700 dark:text-gray-300 text-xl font-semiboldf sm:text-base"><p className="text-xl font-semibold">Dashboard</p></TabsTrigger>
        <TabsTrigger value="recipes" className="text-gray-700 dark:text-gray-300 text-xl sm:text-base"> <p className="text-xl font-semibold">Recipes</p></TabsTrigger>
        <TabsTrigger value="schedules" className="text-gray-700 dark:text-gray-300 text-sm sm:text-base"><p className="text-xl font-semibold">Schedules</p></TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="space-y-6 px-0">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-black font-sans dark:text-white">Food Ingredients Available</h2>
        
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full  divide-solid divide-gray-600 dark:divide-gray-700">
            <thead className="bg-gray-300 dark:bg-gray-800">
          <tr className="border-black border-2 bg-gray-200">
            <th scope="col" className="px-3  text-center py-3  text-lg font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">No.</th>
            <th scope="col" className="px-3   text-center py-3 text-lg font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-3 py-3 text-center text-lg font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Qty</th>
            <th scope="col" className="px-3 py-3 text-center text-lg font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Cal</th>
          </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y border-2 border-black divide-gray-200 dark:divide-gray-700">
          {foodItems.map((item, index) => (
            <tr key={index} className="border-2 border-black">
              <td className="px-3  text-center py-4 whitespace-nowrap text-lg  border-2 border-black font-medium text-black-500 dark:text-gray-300">{index + 1}</td>
              <td className="px-3 py-4  text-center whitespace-nowrap text-lg border-2 border-black font-medium text-black-500 dark:text-gray-300">{item.name}</td>
              <td className="px-3 py-4   text-center whitespace-nowrap text-lg  border-2 border-black font-medium text-black-500 dark:text-gray-300">{item.quantity}</td>
              <td className="px-3 py-4  text-center whitespace-nowrap text-lg border-2 border-black font-medium text-black-500 dark:text-gray-300">{item.calorie}</td>
            </tr>
          ))}
            </tbody>
          </table>
        </div>
          </TabsContent>
          <TabsContent value="schedules" className="space-y-6  pt-8">
        <Card className="bg-gray-100 dark:bg-gray-800 mx-auto w-full lg:w-3/4">
          <CardHeader>
            <CardTitle className="text-black text-xl font-sans dark:text-white">Schedules</CardTitle>
            <CardDescription className="text-gray-600 text-lg dark:text-gray-400">Edit Your Schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-10">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {dayOrder.map((d) => (
              <Button
            key={d}
            variant={day === d ? "default" : "outline"}
            onClick={() => setDay(d)}
            className={`text-lg   text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-500 ${day === d ? "bg-gray-300 dark:bg-gray-700" : ""}`}
              >
            {d.slice(0, 3)}
              </Button>
            ))}
          </div>
          <Button
                variant="outline"
                onClick={async () => {
                  const genAI = new GoogleGenerativeAI('AIzaSyBF_DVdAwR6O69qaO42uXYUxa0nqo_4I8Q');
                  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                  try {
                    const daySchedule = schedule.filter((class_) => class_.day === day);
                    const response = await model.generateContent(
                      `Based on the following schedule for ${day}: ${daySchedule.map(class_ => `${class_.className} from ${class_.startTime} to ${class_.endTime}`).join(', ')}, suggest 4 meal times and meals that can be prepared using some of these available food items: ${foodItems.map(item => item.name).join(', ')}.
                      within that time, make sure not to class the food time with any class or activity time 
                     `
                    );
                    const suggestedText = response.response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(suggestedText, 'text/html');
                    setSuggestedRecipe(doc.body.textContent || "");
                  } catch (error) {
                    console.error("Error fetching meal suggestions:", error);
                  }
                }}
                className="text-gray-700 text-lg  p-4 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                Meal Suggestions
              </Button>
          <div className="grid gap-4">
            {schedule
              .filter((class_) => class_.day === day)
              .map((class_) => (
            <div
              key={class_.id}
              className="flex flex-col sm:flex-row items-center justify-between rounded-lg border border-gray-300 dark:border-gray-700 p-4"
            >
              <div className="text-center sm:text-left mb-2 sm:mb-0">
                <div className="font-semibold text-black dark:text-white">
              {class_.className}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
              {class_.startTime} - {class_.endTime}
                </div>
              </div>
              <Button
                variant="ghost"
                size="default"
                onClick={() => handleDeleteClass(class_.id)}
                className="text-gray-600 dark:text-gray-400"
              >
                <Trash className="h-8 w-8" />
              </Button>
            </div>
              ))}
          </div>
          <div className="flex flex-col mt-6 sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
            <Dialog>
              <DialogTrigger asChild>
            <Button variant="outline" className="text-gray-700 text-lg dark:text-gray-300 hover:text-black dark:hover:text-white w-full sm:w-auto">
              <Plus className="mr-2 h-8 w-8 font-medium text-black text-lg" /> Add Class
            </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-black text-black dark:text-white">
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class-name" className="text-gray-700 mt-4 text-lg dark:text-gray-300">Class Name</Label>
                <Input id="class-name" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Enter class name" className="bg-white dark:bg-black text-black dark:text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="day" className="text-gray-700 text-lg  dark:text-gray-300">Day</Label>
                <Select onValueChange={(value) => setDay(value)}>
              <SelectTrigger className="bg-white dark:bg-black text-black dark:text-white">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-black text-black dark:text-white">
                {dayOrder.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-gray-700 text-lg dark:text-gray-300">Start Time</Label>
                <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="Enter start time" className="bg-white dark:bg-black text-black dark:text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-gray-700 text-lg dark:text-gray-300">End Time</Label>
                <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="Enter end time" className="bg-white dark:bg-black text-black dark:text-white" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleAddClass} className="text-gray-800 dark:text-gray-300 text-lg border-black  hover:text-black dark:hover:text-white">Add Class</Button>
            </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => setIsRecipeDialogOpen(true)} className="text-gray-700 dark:text-gray-300  hover:text-black text-lg  dark:hover:text-white w-full sm:w-auto">
              Check Food Recipe
            </Button>
          </div>
          <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
            <DialogContent className="bg-white dark:bg-black text-black dark:text-white">
              <DialogHeader>
            <DialogTitle className="text-lg ">Prepare a Recipe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
            <Label htmlFor="prep-time" className="text-gray-700 text-lg dark:text-gray-300">Available Preparation Time (minutes)</Label>
            <Input id="prep-time" type="number" value={availableTime} onChange={(e) => setAvailableTime(e.target.value)} placeholder="Enter time in minutes" className="bg-white text-lg dark:bg-black text-black dark:text-white" />
              </div>
              <DialogFooter>
            <Button variant="outline" onClick={handlePrepareRecipe} className="text-gray-800 dark:text-gray-300 text-md border-black  hover:text-black dark:hover:text-white">Generate Recipe</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {suggestedRecipe && (
            <Dialog open={true} onOpenChange={() => setSuggestedRecipe("")}>
              <DialogContent className="bg-white dark:bg-black text-black dark:text-white max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="m-2 underline  text-xl  justify-center items-center text-center ">Suggested Recipe</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="font-serif text-lg font-medium">{suggestedRecipe}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSuggestedRecipe("")} className="text-gray-900 dark:text-gray-300 hover:text-black  border-black dark:hover:text-white text-lg ">Close</Button>
            </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
            </div>
          </CardContent>
        </Card>
          </TabsContent>
          <TabsContent value="recipes" className="space-y-10">
        <div className="flex items-center justify-between pt-10">
          <h2 className="text-xl font-sans sm:text-2xl font-bold text-black dark:text-white">Recipe Suggestions</h2>
          <Button variant="outline" onClick={fetchRecipes} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white p-2">
            <span className="hidden text-lg p-2 font-serif font-semibold sm:inline">Generate New Recipes</span>
            <RefreshCw className="h-4 w-4 sm:ml-2" />
          </Button>
        </div>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className=" bg-gray-200 dark:bg-gray-800 flex flex-col">
          <div className="relative pt-[56.25%]">
            <Image 
              alt={recipe.title} 
              src={recipe.image} 
              layout="fill" 
              objectFit="cover"
              className="rounded-t-lg"
            />
          </div>
          <div className="p-4 flex-grow flex flex-col justify-between mt-4">
            <CardTitle className="text-black font-medium font-mono  dark:text-white text-xl mb-2">{recipe.title}</CardTitle>
            <Button variant="outline" onClick={() => handleViewRecipe(recipe.id)} className="text-gray-800 dark:text-gray-300 hover:text-black mt-6 w-max border-2 border-gray-800 justify-center  items-center text-bold text-lg dark:hover:text-white font-sans ">View Recipe</Button>
          </div>
            </Card>
          ))}
        </div>
        {isModalOpen && selectedRecipe && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="bg-white dark:bg-black text-black dark:text-white max-w-3xl max-h-[100vh] overflow-y-auto mt-3">
          <DialogHeader>
            <DialogTitle>{selectedRecipe.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            <div className="relative pt-[56.25%]">
              <Image 
            alt={selectedRecipe.title} 
            src={selectedRecipe.image} 
            layout="fill" 
            objectFit="cover"
            className="rounded-lg"
              />
            </div>
            <div dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="text-gray-800 dark:text-gray-300 text-lg  border-black  hover:text-black dark:hover:text-white">Close</Button>
          </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
