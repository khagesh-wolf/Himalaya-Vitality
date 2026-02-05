
import React, { useState } from 'react';
import { 
  ShieldCheck, Globe, Truck, Beaker, FileText, Mail, Phone, MapPin, 
  ChevronDown, ChevronUp, Search, ArrowRight, Sun, Coffee, Droplet, Clock, PlayCircle, Loader2, Circle, CheckCircle, Package, Mountain, Heart, Zap, Brain, Activity, HelpCircle, AlertTriangle, AlertCircle
} from 'lucide-react';
import { Container, Button, Card, Reveal, LazyImage, Badge } from '../components/UI';
import { Link } from 'react-router-dom';
import { BLOG_POSTS, MAIN_PRODUCT, FAQ_DATA } from '../constants';
import { trackOrder, sendContactMessage } from '../services/api';

// --- Shared Components ---
const PageHeader = ({ title, subtitle, image }: { title: string, subtitle?: string, image?: string }) => (
    <div className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-brand-dark pt-32 pb-20">
        {/* Background */}
        <div className="absolute inset-0 z-0">
            {image && (
                <LazyImage src={image} alt="Background" className="w-full h-full object-cover opacity-30 animate-zoom-slow" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        <Container className="relative z-10 text-center text-white">
            <Reveal>
                <div className="inline-block mb-4 border border-white/20 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-brand-gold-400">
                    Himalaya Vitality
                </div>
                <h1 className="font-heading text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none drop-shadow-2xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed px-4 drop-shadow-lg">
                        {subtitle}
                    </p>
                )}
            </Reveal>
        </Container>
    </div>
);

const ContentBlock = ({ children, title }: { children?: React.ReactNode, title: string }) => (
    <section className="py-20 md:py-24 bg-white border-b border-gray-100">
        <Container>
            <Reveal>
                <h2 className="font-heading text-3xl font-bold text-brand-dark mb-8 pb-4 border-b border-gray-100">{title}</h2>
                <div className="prose prose-lg prose-red text-gray-600 max-w-none">
                    {children}
                </div>
            </Reveal>
        </Container>
    </section>
);

// Define static data outside component to avoid re-creation
const SCIENCE_BENEFITS = [
    { title: "ATP Production", icon: Zap, text: "Shilajit enhances mitochondrial function, directly increasing Adenosine Triphosphate (ATP) production—the body's primary energy currency." },
    { title: "Testosterone Support", icon: Activity, text: "Clinical studies show a significant increase in total testosterone, free testosterone, and DHEAS in healthy men after 90 days." },
    { title: "Cognitive Health", icon: Brain, text: "Fulvic acid prevents the aggregation of tau protein, potentially protecting against cognitive decline and improving memory." }
];

const FULVIC_BENEFITS = [
    "Enhances nutrient absorption by making cell walls more permeable.",
    "Combats free radicals with potent antioxidant properties.",
    "Chelates heavy metals and aids in detoxification.",
    "Supports gut health and immune function."
];

const PROCESS_STEPS = [
    { 
        title: "Collection", 
        icon: Mountain,
        desc: "Harvested by hand from high-altitude cliffs in the pristine Dolpa region.",
        color: "bg-stone-100 text-stone-600"
    },
    { 
        title: "Purification", 
        icon: Droplet,
        desc: "Dissolved in pure spring water and filtered through cotton layers to remove impurities.",
        color: "bg-blue-50 text-blue-600"
    },
    { 
        title: "Sun Drying", 
        icon: Sun,
        desc: "Exposed to sunlight for 60-90 days. This slow process concentrates the minerals without damaging them.",
        color: "bg-amber-50 text-amber-600"
    }
];

// --- About Page (Story) ---
export const AboutPage = () => {
    return (
      <div className="bg-white">
        <PageHeader 
            title="The Gold of Nepal" 
            subtitle="Sourced from the pristine Himalayan landscape, our Shilajit is the result of centuries of geological alchemy."
            image="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop"
        />

        <Container className="py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
            <Reveal>
                <div>
                    <span className="text-brand-red font-bold text-sm uppercase tracking-widest mb-4 block">The Origin</span>
                    <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-brand-dark mb-6 leading-tight">Conqueror of Mountains</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                        The term "Shilajit" is derived from Sanskrit, meaning <span className="font-bold text-brand-dark">"Conqueror of Rocks"</span>. 
                        It is a rare, tar-like substance that oozes from rocks in the high Himalayas during the summer months.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-lg mb-8">
                        Formed over centuries by the gradual decomposition of specific plants by microorganisms, Shilajit is a potent dietary supplement used in Ayurveda for millennia. 
                        Our resin comes exclusively from the <strong>Dolpa, Mugu, and Humla</strong> districts of Nepal, at altitudes exceeding 18,000 feet.
                    </p>
                    
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-brand-dark bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                            <MapPin size={18} className="text-brand-red"/> 18,000ft Altitude
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-brand-dark bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                            <Sun size={18} className="text-brand-gold-500"/> Sun Dried
                        </div>
                    </div>
                </div>
            </Reveal>
            <Reveal delay={200}>
                <div className="relative">
                    <div className="absolute inset-0 bg-brand-red rounded-3xl rotate-3 opacity-10 blur-xl"></div>
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[500px] bg-stone-100">
                        <LazyImage src={MAIN_PRODUCT.images[0]} alt="Himalaya Shilajit Source" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8">
                            <div className="text-white font-heading font-bold text-2xl">Ethically Sourced</div>
                            <div className="text-gray-300 text-sm">Direct partnership with local Sherpa communities</div>
                        </div>
                    </div>
                </div>
            </Reveal>
          </div>

          {/* Process Section */}
          <div className="mb-32">
              <Reveal>
                  <div className="text-center max-w-3xl mx-auto mb-16">
                      <span className="text-brand-red font-bold text-sm uppercase tracking-widest mb-2 block">The Method</span>
                      <h2 className="font-heading text-4xl font-extrabold text-brand-dark mb-4">The Surya Tapi Process</h2>
                      <p className="text-gray-500 text-lg">
                          We reject modern heat extraction. We use the traditional sun-drying method described in the <em>Charaka Samhita</em> to preserve 100% of bioactive compounds.
                      </p>
                  </div>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {PROCESS_STEPS.map((step, i) => {
                      const StepIcon = step.icon;
                      return (
                          <Reveal key={i} delay={i*150}>
                              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group h-full">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${step.color} group-hover:scale-110 transition-transform`}>
                                        {StepIcon && <StepIcon size={28} />}
                                    </div>
                                    <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">{step.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                              </div>
                          </Reveal>
                      );
                  })}
              </div>
          </div>

          {/* Mission */}
          <Reveal>
              <div className="bg-brand-dark rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="relative z-10 max-w-3xl mx-auto">
                      <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-6">Our Mission</h2>
                      <p className="text-xl text-gray-300 leading-relaxed mb-10">
                          To empower high performers by providing the purest, most potent natural fuel available on Earth, while supporting the indigenous communities that preserve this ancient wisdom.
                      </p>
                      <Link to="/product/himalaya-shilajit-resin">
                          <Button size="lg" className="shadow-lg shadow-brand-red/20 border-none bg-brand-red hover:bg-white hover:text-brand-dark">
                              Experience Vitality
                          </Button>
                      </Link>
                  </div>
              </div>
          </Reveal>
        </Container>
      </div>
    );
};

// --- Science Page ---
export const SciencePage = () => (
    <div className="bg-gray-50">
        <PageHeader 
            title="Backed by Science" 
            subtitle="Used for centuries in Ayurveda, validated by modern biochemistry."
            image="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1200&auto=format&fit=crop"
        />
        
        <Container className="py-24">
            {/* Intro Stats */}
            <Reveal>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="text-5xl font-heading font-extrabold text-brand-red mb-2">85+</div>
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Trace Minerals</div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="text-5xl font-heading font-extrabold text-brand-dark mb-2">80%</div>
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Fulvic Acid</div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="text-5xl font-heading font-extrabold text-brand-gold-500 mb-2">100%</div>
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Bioavailable</div>
                    </div>
                </div>
            </Reveal>

            {/* Deep Dive Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
                <Reveal>
                    <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-dark mb-6">The Fulvic Acid Advantage</h2>
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                        Fulvic acid is the key bioactive compound in Shilajit. It acts as a powerful electrolyte and carrier molecule, transporting minerals directly into cells and removing toxins.
                    </p>
                    <ul className="space-y-4">
                        {FULVIC_BENEFITS.map((item, i) => (
                            <li key={`sci-list-${i}`} className="flex items-start gap-3">
                                <CheckCircle className="text-brand-red shrink-0 mt-1" size={20} />
                                <span className="text-gray-700 font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </Reveal>
                <Reveal delay={200}>
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Beaker size={100} />
                        </div>
                        <h3 className="font-bold text-xl text-brand-dark mb-6">Chemical Composition</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <span className="font-bold text-gray-600">Humic Substances</span>
                                <span className="font-bold text-brand-dark">60-80%</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <span className="font-bold text-gray-600">Fulvic Acid</span>
                                <span className="font-bold text-brand-dark">> 60%</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <span className="font-bold text-gray-600">Dibenzo-alpha-pyrones</span>
                                <span className="font-bold text-brand-dark">High Conc.</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <span className="font-bold text-gray-600">Trace Minerals</span>
                                <span className="font-bold text-brand-dark">Ionic Form</span>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* Benefits Grid */}
            <div className="mb-24">
                <Reveal>
                    <h2 className="font-heading text-3xl font-extrabold text-brand-dark mb-12 text-center">Mechanism of Action</h2>
                </Reveal>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {SCIENCE_BENEFITS.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <Reveal key={`benefit-${i}`} delay={i*150}>
                                <Card className="p-8 h-full hover:-translate-y-2 transition-transform duration-300 border-t-4 border-t-brand-red">
                                    <div className="mb-6 text-brand-red bg-red-50 w-14 h-14 rounded-full flex items-center justify-center">
                                        {Icon && <Icon size={28} />}
                                    </div>
                                    <h3 className="font-bold text-xl text-brand-dark mb-3">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{item.text}</p>
                                </Card>
                            </Reveal>
                        );
                    })}
                </div>
            </div>

            {/* References */}
            <Reveal>
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                    <h3 className="font-bold text-lg text-brand-dark mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-brand-red" /> Clinical References
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li className="flex gap-3">
                            <span className="font-bold text-brand-dark shrink-0">[1]</span>
                            Pandit, S., et al. "Clinical evaluation of purified Shilajit on testosterone levels in healthy volunteers." Andrologia 48.5 (2016): 570-575.
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-brand-dark shrink-0">[2]</span>
                            Carrasco-Gallardo, C., et al. "Shilajit: a natural phytocomplex with potential procognitive activity." International Journal of Alzheimer's Disease 2012 (2012).
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-brand-dark shrink-0">[3]</span>
                            Stohs, S. J. "Safety and efficacy of shilajit (mumie, moomiyo)." Phytotherapy Research 28.4 (2014): 475-479.
                        </li>
                    </ul>
                </div>
            </Reveal>
        </Container>
    </div>
);

// --- How To Use Page ---
export const HowToUsePage = () => (
    <div className="bg-white">
        <PageHeader 
            title="Your Daily Ritual" 
            subtitle="Master the art of consumption for maximum potency."
            image="https://images.unsplash.com/photo-1544212975-6f4e69b009df?q=80&w=1200&auto=format&fit=crop"
        />
        
        <Container className="py-24">
            {/* Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative mb-24">
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gray-100 -z-10"></div>

                {[
                    { 
                        step: "01", 
                        title: "Measure", 
                        desc: "Using the included golden spoon, scoop a pea-sized amount (approx 300-500mg) of resin.", 
                        icon: Circle 
                    },
                    { 
                        step: "02", 
                        title: "Dissolve", 
                        desc: "Stir the resin into a cup of warm water, herbal tea, or coffee. Avoid boiling water to preserve enzymes.", 
                        icon: Droplet 
                    },
                    { 
                        step: "03", 
                        title: "Consume", 
                        desc: "Drink on an empty stomach first thing in the morning for optimal absorption.", 
                        icon: Coffee 
                    }
                ].map((item, i) => (
                    <Reveal key={i} delay={i*200}>
                        <div className="bg-white text-center relative group">
                            <div className="w-24 h-24 bg-white border-4 border-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:border-brand-red transition-colors duration-300">
                                <span className="font-heading font-extrabold text-3xl text-brand-dark">{item.step}</span>
                            </div>
                            <h3 className="font-heading font-bold text-2xl text-brand-dark mb-4">{item.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-medium px-4">{item.desc}</p>
                        </div>
                    </Reveal>
                ))}
            </div>

            {/* Pro Tips */}
            <Reveal>
                <div className="bg-[#FDFBF7] border border-brand-gold-100 rounded-3xl p-8 md:p-12">
                    <h3 className="font-heading font-bold text-2xl text-brand-dark mb-8 text-center flex items-center justify-center gap-3">
                        <Sun className="text-brand-gold-500" /> Pro Tips for Optimization
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand-gold-100 flex items-center justify-center shrink-0 font-bold text-brand-gold-600">A</div>
                            <div>
                                <h4 className="font-bold text-brand-dark mb-1">Consistency is Key</h4>
                                <p className="text-sm text-gray-600">Shilajit works cumulatively. Most users report significant benefits after 2-3 weeks of daily use.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand-gold-100 flex items-center justify-center shrink-0 font-bold text-brand-gold-600">B</div>
                            <div>
                                <h4 className="font-bold text-brand-dark mb-1">Cycle It (Optional)</h4>
                                <p className="text-sm text-gray-600">Some Ayurveda practitioners recommend taking it for 3 months, then taking a 1-week break.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand-gold-100 flex items-center justify-center shrink-0 font-bold text-brand-gold-600">C</div>
                            <div>
                                <h4 className="font-bold text-brand-dark mb-1">Stacking</h4>
                                <p className="text-sm text-gray-600">Stacks well with Ashwagandha for stress relief or Honey for enhanced taste and delivery.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand-gold-100 flex items-center justify-center shrink-0 font-bold text-brand-gold-600">D</div>
                            <div>
                                <h4 className="font-bold text-brand-dark mb-1">Texture Changes</h4>
                                <p className="text-sm text-gray-600">Pure resin hardens in cold and softens in heat. If hard, warm the jar in your hands or warm water.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Reveal>
        </Container>
    </div>
);

// --- FAQ Page ---
export const FAQPage = () => {
    // Generate FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ_DATA.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <PageHeader title="Frequently Asked Questions" subtitle="Everything you need to know about Himalaya Vitality." />
            <script type="application/ld+json">
                {JSON.stringify(faqSchema)}
            </script>
            <Container className="py-24">
                 <div className="max-w-3xl mx-auto space-y-6">
                    {FAQ_DATA.map((item, i) => (
                        <Reveal key={i} delay={i * 100}>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <h3 className="font-bold text-lg text-brand-dark mb-3 flex items-start gap-4">
                                    <span className="bg-brand-red/10 text-brand-red p-2 rounded-lg shrink-0"><HelpCircle size={20}/></span>
                                    <span className="mt-1">{item.question}</span>
                                </h3>
                                <p className="text-gray-600 pl-[3.25rem] leading-relaxed">{item.answer}</p>
                            </div>
                        </Reveal>
                    ))}
                 </div>
                 
                 <div className="text-center mt-16">
                     <p className="text-gray-500 mb-4">Still have questions?</p>
                     <Link to="/contact">
                        <Button variant="outline-dark">Contact Support</Button>
                     </Link>
                 </div>
            </Container>
        </div>
    );
};

// --- Contact Page ---
export const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            await sendContactMessage(formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Failed to send message. Please try again.');
        }
    };

    return (
    <div className="bg-white">
         <PageHeader title="Contact Us" subtitle="Our team is ready to support your journey." />
         <Container className="py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-start">
                <Reveal>
                    <div>
                        <span className="text-brand-red font-bold text-sm uppercase tracking-widest mb-4 block">Get in Touch</span>
                        <h2 className="text-4xl font-heading font-extrabold text-brand-dark mb-6">We're Here To Help</h2>
                        <p className="mb-10 text-gray-600 leading-relaxed text-lg">
                            Whether you have a question about shipping, dosage, or just want to share your success story, we'd love to hear from you.
                        </p>
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 bg-brand-red text-white flex items-center justify-center rounded-xl shadow-lg shadow-brand-red/20"><Mail size={24}/></div>
                                <div>
                                    <div className="text-xs font-bold uppercase text-gray-400 mb-1">Email Support</div>
                                    <a href="mailto:support@himalayavitality.com" className="font-bold text-xl text-brand-dark hover:text-brand-red transition-colors">support@himalayavitality.com</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 bg-brand-dark text-white flex items-center justify-center rounded-xl shadow-lg"><MapPin size={24}/></div>
                                <div>
                                    <div className="text-xs font-bold uppercase text-gray-400 mb-1">Headquarters</div>
                                    <div className="font-bold text-xl text-brand-dark">Melbourne, Australia</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
                
                <Reveal delay={200}>
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
                        {status === 'success' ? (
                            <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
                                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle size={40} />
                                </div>
                                <h3 className="font-heading font-bold text-2xl text-brand-dark mb-2">Message Sent!</h3>
                                <p className="text-gray-500 mb-8">Thank you for reaching out. Our team usually responds within 24 hours.</p>
                                <Button onClick={() => setStatus('idle')} variant="outline-dark">Send Another</Button>
                            </div>
                        ) : null}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Name</label>
                                    <input 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red transition-all" 
                                        placeholder="Your Name" 
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                                    <input 
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red transition-all" 
                                        placeholder="Your Email" 
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Subject</label>
                                <input 
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red transition-all" 
                                    placeholder="How can we help?" 
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Message</label>
                                <textarea 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red transition-all" 
                                    rows={5} 
                                    placeholder="Tell us more..."
                                    required
                                ></textarea>
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                    <AlertCircle size={16} /> {errorMessage}
                                </div>
                            )}

                            <Button fullWidth size="lg" className="shadow-xl shadow-brand-red/20" disabled={status === 'loading'}>
                                {status === 'loading' ? <><Loader2 className="animate-spin mr-2" size={18}/> Sending...</> : 'Send Message'}
                            </Button>
                        </form>
                    </div>
                </Reveal>
            </div>
         </Container>
    </div>
    );
};

// --- Legal Pages ---
export const PrivacyPage = () => (
    <div className="bg-white">
        <PageHeader title="Privacy Policy" />
        <ContentBlock title="Privacy Policy">
            <p><strong>Effective Date:</strong> October 2023</p>
            <p>At Himalaya Vitality, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
            
            <h3>1. Information We Collect</h3>
            <p>We collect several types of information from and about users of our Website, including information:</p>
            <ul>
                <li>By which you may be personally identified, such as name, postal address, e-mail address, or telephone number ("personal information").</li>
                <li>About your internet connection, the equipment you use to access our Website, and usage details.</li>
            </ul>

            <h3>2. How We Use Your Information</h3>
            <p>We use information that we collect about you or that you provide to us, including any personal information:</p>
            <ul>
                <li>To present our Website and its contents to you.</li>
                <li>To provide you with information, products, or services that you request from us.</li>
                <li>To fulfill any other purpose for which you provide it.</li>
                <li>To notify you about changes to our Website or any products or services we offer or provide though it.</li>
            </ul>

            <h3>3. Data Security</h3>
            <p>We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls.</p>
        </ContentBlock>
    </div>
);

export const TermsPage = () => (
    <div className="bg-white">
        <PageHeader title="Terms of Service" />
        <ContentBlock title="Terms & Conditions">
            <p><strong>Overview</strong></p>
            <p>This website is operated by Himalaya Vitality. Throughout the site, the terms "we", "us" and "our" refer to Himalaya Vitality. Himalaya Vitality offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>
            
            <h3>1. Online Store Terms</h3>
            <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.</p>

            <h3>2. General Conditions</h3>
            <p>We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices.</p>

            <h3>3. Accuracy of Information</h3>
            <p>We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information.</p>
        </ContentBlock>
    </div>
);

export const ShippingReturnsPage = () => (
    <div className="bg-white">
        <PageHeader title="Shipping & Returns" />
        <Container className="py-24 max-w-4xl mx-auto">
            <div className="space-y-16">
                <Reveal>
                    <div className="flex gap-6 items-start">
                        <div className="p-4 bg-brand-red/5 rounded-2xl text-brand-red"><Truck size={32} /></div>
                        <div>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">Shipping Policy</h2>
                            <div className="prose text-gray-600">
                                <p>We are proudly Australian operated. All orders are dispatched from our Melbourne warehouse within 24 hours of purchase.</p>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 not-prose mb-4">
                                    <h4 className="font-bold text-brand-dark mb-2">Delivery Times</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex justify-between"><span>Australia (AusPost Express)</span> <span className="font-bold">2-5 Business Days</span></li>
                                        <li className="flex justify-between"><span>New Zealand</span> <span className="font-bold">5-8 Business Days</span></li>
                                        <li className="flex justify-between"><span>USA & UK</span> <span className="font-bold">6-12 Business Days</span></li>
                                    </ul>
                                </div>
                                <p><strong>Free Shipping:</strong> Available on all multi-jar bundles (2+ jars) worldwide.</p>
                            </div>
                        </div>
                    </div>
                </Reveal>
                
                <hr className="border-gray-100"/>

                <Reveal>
                    <div className="flex gap-6 items-start">
                        <div className="p-4 bg-brand-red/5 rounded-2xl text-brand-red"><ShieldCheck size={32} /></div>
                        <div>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">30-Day Guarantee</h2>
                            <div className="prose text-gray-600">
                                <p>We stand behind the potency of our product. If you don't feel a difference in your energy and focus within 30 days, we'll refund your money.</p>
                                <p>To initiate a return, simply email <a href="mailto:support@himalayavitality.com" className="text-brand-red font-bold">support@himalayavitality.com</a> with your order number. You do not need to return the used jar.</p>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </Container>
    </div>
);

export const SitemapPage = () => (
    <div className="bg-gray-50 min-h-screen">
        <PageHeader title="Sitemap" />
        <Container className="py-24">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                <div>
                    <h3 className="font-heading font-bold text-brand-dark mb-6 text-lg border-b border-gray-200 pb-2">Shop</h3>
                    <ul className="space-y-3 text-gray-600 font-medium">
                        <li><Link to="/product/himalaya-shilajit-resin" className="hover:text-brand-red transition-colors">Premium Resin</Link></li>
                        <li><Link to="/cart" className="hover:text-brand-red transition-colors">Cart</Link></li>
                        <li><Link to="/checkout" className="hover:text-brand-red transition-colors">Checkout</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-heading font-bold text-brand-dark mb-6 text-lg border-b border-gray-200 pb-2">Learn</h3>
                    <ul className="space-y-3 text-gray-600 font-medium">
                        <li><Link to="/science" className="hover:text-brand-red transition-colors">The Science</Link></li>
                        <li><Link to="/how-to-use" className="hover:text-brand-red transition-colors">How To Use</Link></li>
                        <li><Link to="/about" className="hover:text-brand-red transition-colors">Our Story</Link></li>
                        <li><Link to="/blog" className="hover:text-brand-red transition-colors">Journal</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-heading font-bold text-brand-dark mb-6 text-lg border-b border-gray-200 pb-2">Support</h3>
                    <ul className="space-y-3 text-gray-600 font-medium">
                        <li><Link to="/contact" className="hover:text-brand-red transition-colors">Contact Us</Link></li>
                        <li><Link to="/faq" className="hover:text-brand-red transition-colors">FAQ</Link></li>
                        <li><Link to="/track" className="hover:text-brand-red transition-colors">Track Order</Link></li>
                        <li><Link to="/shipping-returns" className="hover:text-brand-red transition-colors">Shipping & Returns</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-heading font-bold text-brand-dark mb-6 text-lg border-b border-gray-200 pb-2">Legal</h3>
                    <ul className="space-y-3 text-gray-600 font-medium">
                        <li><Link to="/privacy" className="hover:text-brand-red transition-colors">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="hover:text-brand-red transition-colors">Terms of Service</Link></li>
                        <li><Link to="/admin" className="hover:text-brand-red transition-colors">Admin Login</Link></li>
                    </ul>
                </div>
            </div>
        </Container>
    </div>
);

// --- Track Order Page ---
export const TrackOrderPage = () => {
    const [orderId, setOrderId] = useState('');
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId) return;
        setLoading(true);
        setError('');
        setStatus(null);

        try {
            const data = await trackOrder(orderId);
            setStatus(data);
        } catch (e: any) {
            setError(e.message || "Order not found. Please check your ID and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
             <PageHeader title="Track Your Order" />
             <Container className="py-24 text-center flex-grow">
                 <Card className="max-w-md mx-auto p-10 shadow-2xl border-t-4 border-brand-red">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-dark animate-pulse-fast">
                        <Truck size={40} />
                    </div>
                    <h2 className="font-heading font-bold text-2xl text-brand-dark mb-2">Where is my package?</h2>
                    <p className="mb-8 text-gray-500">Enter your order ID found in your confirmation email.</p>
                    
                    <form onSubmit={handleTrack} className="space-y-4">
                        <div className="relative">
                            <input 
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="w-full p-4 pl-12 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red transition-all" 
                                placeholder="Order # (e.g. HV-1234)" 
                            />
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        <Button fullWidth size="lg" className="shadow-lg shadow-brand-red/20" disabled={loading}>
                            {loading ? 'Tracking...' : 'Track Order'}
                        </Button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-2 text-left text-sm animate-in fade-in">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {status && (
                        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl text-left animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-center mb-4 border-b border-green-200 pb-2">
                                <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Status</span>
                                <Badge color={status.status === 'Delivered' ? 'bg-green-600' : 'bg-blue-600'}>{status.status}</Badge>
                            </div>
                            <div className="space-y-2 text-sm text-brand-dark">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Order ID:</span>
                                    <span className="font-bold">{status.orderNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Order Date:</span>
                                    <span className="font-bold">{status.date}</span>
                                </div>
                                {status.trackingNumber && (
                                    <div className="pt-2 mt-2 border-t border-green-200">
                                        <div className="text-xs text-gray-500 mb-1">Tracking Number ({status.carrier})</div>
                                        <div className="font-mono font-bold text-lg select-all">{status.trackingNumber}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                 </Card>
             </Container>
        </div>
    );
};
