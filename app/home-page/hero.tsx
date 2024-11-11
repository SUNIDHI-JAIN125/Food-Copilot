"use client";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


import Balancer from "react-wrap-balancer";
import { LogOut, User } from "lucide-react";


import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/modetoggle";

import Logo from "/public/logo.svg";
import Logo2 from "/public/mealmate.svg";

const Hero = () => {
    const router = useRouter();

   
    const user = { name: "Guest User" };

    useEffect(() => {
       
        if (!user) {
            router.push("/user-home");
        }
    }, [user, router]);

    return (
        <Section>
            <header className="flex justify-between  items-center">
                <div className="flex items-center space-x-2">
                    <Image src={Logo} width={200} height={100} alt="Company Logo" className="dark:invert" />
                    <Image src={Logo2} width={200} height={100} alt="Company Logo" className="dark:invert" />
                </div> 
                <div className="flex items-center space-x-2">
                    
                </div> 
                <div>
                </div>
                <div className="flex items-center space-x-4">
                    <ModeToggle />
                </div>
            </header>
            <Container className="flex flex-col items-center  text-center   ">
                <h1 className="!mb-0 font-sans">
                    <Balancer>   Food-copilot </Balancer>
                </h1>
                <h3 className="text-muted-foreground">
                    <Balancer>
                    Food-Copilot uses smart AI to make meal planning simple and stress-free. Tailor recipes to what’s in your fridge, avoid waste, and effortlessly manage dietary needs—all in one place.
                 </Balancer>
                </h3>
                <div className="not-prose mt-6 flex gap-2 md:mt-12 bg-black text-white rounded-xl p-3">
                    <Button variant="ghost" asChild>
                        <a href="/user-home" className="text-xl">
                            <LogOut className="mr-2" />
                            Go to Dashboard
                        </a>
                    </Button>
                </div>
            </Container>
        </Section>
    );
};

export default Hero;
