"use client"; 
import Image from "next/image";
import Link from "next/link";
import { ChevronUp } from "lucide-react"; // Icon for back-to-top button
import Balancer from "react-wrap-balancer";

import { Section, Container } from "../../components/craft";
import Logo from "@/public/logo.svg";

export default function Footer() {
 
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="not-prose border-t ">
      <Section>
        <Container className="">


        <div className="mt-4 ">
              <h4 className="text-4xl font-serif font-semibold mb-2">About - </h4>
              <p className="text-xl pt-3  pb-5  leading-relaxed ">
                Our project aims to revolutionize meal planning and smart kitchen management using AI. This tool offers meal recommendations based on ingredients available at home, tracks dietary needs, and optimizes food usage to reduce waste.
              </p>
            </div>
        
          <div className="flex flex-row justify-between">
           
            <p className="mt-4 text-2xl">
            <Link href="/" aria-label="Home">
              <Image
                src={Logo}
                alt="Logo"
                width={70}
                height={27.27}
                className="transition-opacity hover:opacity-75 mt-5 dark:invert"
              />
            </Link>
              <Balancer>Minor Project 2024 - BCA</Balancer>
            </p>
          
           
          <div className="mt-20">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 p-3 rounded-xl  bg-black text-white text-lg transition-all "
              aria-label="Back to Top"
            >
              <ChevronUp className="w-8 h-8" />
              Back to Top
            </button>
          </div>
          </div>

        
        </Container>
      </Section>
    </footer>
  );
}
