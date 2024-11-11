import React from "react";
import Image from "next/image";


import { Section, Container } from "@/components/craft";
import Balancer from "react-wrap-balancer";
import F1 from "@/public/feature1.jpg";
import F2 from "@/public/F2.jpg";
import F3 from "@/public/F3.jpg";


type FeatureText = {
  icon: JSX.Element;
  title: string;
  description: string;
};

const featureText: FeatureText[] = [
  {
    icon: <Image src={F1} alt="Smart Food Management" width={100} height={104} />,
    title: "Smart Food Management",
    description:
      "Effortlessly manage ingredients with our smart fridge scanner, which detects what's available and alerts you when supplies are running low.",
  },
  {
    icon: <Image src={F2} alt="Personalized Recipes" width={200} height={200} />,
    title: "Personalized Recipes",
    description:
      "Receive recipe ideas tailored to what you have on hand and aligned with your dietary preferences, making every meal enjoyable and nutritious.",
  },
  {
    icon: <Image src={F3} alt="Timely Meal Reminders" width={150} height={200} />,
    title: "Timely Meal Reminders",
    description:
      "Plan your meals around your schedule and get reminders to keep you fueled throughout your busy day.",
  },
];

const Feature = () => {
  return (
    <Section className="border-b">
      <Container className="not-prose">
        <div className="flex flex-col gap-6">
          <h3 className="text-4xl font-serif font-semibold">
            <Balancer>
              Features -
            </Balancer>
          </h3>

          <div className="mt-4 grid gap-6 md:mt-8 md:grid-cols-3">
            {featureText.map(({ icon, title, description }, index) => (
              <div
                className="flex flex-col w-full gap-4 h-max-content p-10 border-2 rounded-3xl border-black 
                           hover:cursor-pointer transform transition-transform duration-200 
                           hover:scale-105 hover:shadow-xl"
                key={index}
              >
                {icon}
                <h4 className="text-2xl text-primary font-semibold">{title}</h4>
                <p className="text-base opacity-75 mt-6">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Feature;
