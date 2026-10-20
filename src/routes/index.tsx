import { createFileRoute } from '@tanstack/react-router';
import { SiteShell } from '@/components/site/site-shell';
import { Hero, AboutSection, TreatmentsSection, InstagramSection, Principles, ClinicSection, CtaBand, ContactSection } from '@/components/site/sections';
import { pageHead, address, email } from '@/lib/site-data';
export const Route = createFileRoute('/')({ head:()=>({...pageHead('Dentista em Piracaia — cuidado de verdade','Conheça a Dra. Rebeca Galdino e os tratamentos odontológicos em Piracaia — SP. Atendimento individualizado. Agende sua consulta pelo WhatsApp.'),scripts:[{type:'application/ld+json',children:JSON.stringify({'@context':'https://schema.org','@type':'Dentist',name:'Dra. Rebeca Galdino',telephone:'+5511996514034',email,address:{'@type':'PostalAddress',streetAddress:'Av. Jan Antonin Bata, 121',addressLocality:'Piracaia',addressRegion:'SP',postalCode:'12970-000',addressCountry:'BR'}})}]}), component:Home });
function Home() { return <SiteShell><Hero/><AboutSection/><TreatmentsSection/><InstagramSection/><Principles/><ClinicSection/><Principles process/><CtaBand/><ContactSection/></SiteShell>; }
