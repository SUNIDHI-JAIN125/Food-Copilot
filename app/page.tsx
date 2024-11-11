import Feature from "@/app/home-page/features"
import Hero from "@/app/home-page/hero"

import { useUser } from "@auth0/nextjs-auth0/client"
import { Container, Main, Section } from "@/components/craft" 
import Footer from "@/app/home-page/footer"

export default function Page() {
  return (
    <Main className="main-container">
      <Section>
        <Container>
          <Hero />
          <Feature />
          <Footer />
        </Container>
      </Section>
    </Main>
  )
}
