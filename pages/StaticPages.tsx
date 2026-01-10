
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Globe, Truck, Beaker, FileText, Mail, Phone, MapPin, 
  ChevronDown, ChevronUp, Search, ArrowRight, Sun, Coffee, Droplet, Clock, PlayCircle, Loader2, Circle, CheckCircle, Package, Mountain, Heart, Zap, Brain, Activity, HelpCircle
} from 'lucide-react';
import { Container, Button, Card, Reveal, LazyImage, Badge } from '../components/UI';
import { Link } from 'react-router-dom';
import { BLOG_POSTS, MAIN_PRODUCT, FAQ_DATA } from '../constants';

// --- Shared Page Header Component ---
const PageHeader = ({ title, subtitle, bgImage }: { title: string, subtitle?: string, bgImage?: string }) => (
    <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-brand-dark pt-20">
        <div className="absolute inset-0">
            {bgImage && (
                <LazyImage 
                src={bgImage} 
                alt="Background" 
                className="w-full h-full object-cover opacity-40"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60"></div>
        </div>
        
        <Container className="relative z-10 text-center text-white pt-10 pb-20">
            <Reveal>
                <h1 className="font-heading text-4xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                        {subtitle}
                    </p>
                )}
            </Reveal>
        </Container>
    </div>
);

// --- About Page (Story) ---
export const AboutPage = () => {
    return (
      <div className="bg-white">
        <PageHeader 
            title="The Gold of Dolpa" 
            subtitle="Sourced from the remote cliffs of the Nepali Himalayas at 18,000ft. Where ancient geology meets traditional wisdom."
            bgImage="https://images.unsplash.com/photo-1544367563-12123d832e34?q=80&w=1920&auto=format&fit=crop"
        />

        <Container className="py-16 md:py-24">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center mb-24 md:mb-32">
            <Reveal>
                <div>
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-6">Beyond The Harvest</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                        In the high-altitude region of Dolpa, Nepal, the indigenous Sherpa communities have known the secret of "Shilajit" (Conqueror of Mountains) for centuries. During the summer months, as the sun warms the frozen cliffs, a golden-black resin seeps from the cracks of the rock.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        We partner directly with these local harvesting families. Unlike large industrial operations that use dynamite to blast rocks, our harvesters scale the cliffs by hand, collecting only the purest resin that naturally exudes from the mountain. This sustainable method protects the delicate ecosystem of the Himalayas.
                    </p>
                </div>
            </Reveal>
            <Reveal delay={200}>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[400px] md:h-[500px]">
                    <LazyImage 
                        src="https://images.unsplash.com/photo-1596522354728-66228784b293?q=80&w=800&auto=format&fit=crop" 
                        alt="Sherpa harvesting" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
                        <div className="flex items-center text-white gap-2 font-bold uppercase tracking-widest text-xs mb-2">
                            <MapPin size={16} className="text-brand-red" /> Dolpa District, Nepal
                        </div>
                        <div className="text-white opacity-80 text-sm">Altitude: 17,500 ft</div>
                    </div>
                </div>
            </Reveal>
          </div>

          {/* Purification Process */}
          <Reveal>
              <div className="bg-stone-50 rounded-3xl p-8 md:p-16 mb-24 md:mb-32 border border-stone-100">
                  <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                      <span className="text-brand-red font-bold text-xs uppercase tracking-widest mb-2 block">The Process</span>
                      <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">The Surya Tapi Method</h2>
                      <p className="text-gray-600 text-sm md:text-base">
                          Most commercial Shilajit is boiled at high heat to speed up production, which destroys delicate bioactive enzymes. 
                          We use the traditional <strong>Surya Tapi</strong> (Sun Dried) method.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                      {[
                          { title: "Filtration", text: "The raw resin is dissolved in pure spring water and filtered through 7 layers of cotton cloth to remove rocks and grit." },
                          { title: "Sun Drying", text: "The purified liquid is placed in stainless steel vessels under the direct Himalayan sun for 45-60 days." },
                          { title: "Potency Check", text: "Slow evaporation preserves the bioactive fulvic acid and ionic minerals, resulting in a resin of unmatched potency." }
                      ].map((step, i) => (
                          <div key={i} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                              <div className="absolute -right-4 -top-4 text-8xl md:text-9xl font-heading font-extrabold text-gray-50 z-0 group-hover:text-brand-red/5 transition-colors">{i + 1}</div>
                              <div className="relative z-10">
                                  <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">{step.title}</h3>
                                  <p className="text-gray-500 leading-relaxed text-sm">{step.text}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </Reveal>

          {/* Impact Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
             <Reveal>
                 <div className="grid grid-cols-2 gap-3 md:gap-4">
                     <div className="space-y-3 md:space-y-4 mt-8">
                         <LazyImage src="https://images.unsplash.com/photo-1572093849363-2227d66dc09c?q=80&w=400&auto=format&fit=crop" alt="Nepal Community" className="rounded-2xl shadow-lg w-full h-40 md:h-64 object-cover" />
                         <LazyImage src="https://images.unsplash.com/photo-1540544660406-6a69dacb2804?q=80&w=400&auto=format&fit=crop" alt="School" className="rounded-2xl shadow-lg w-full h-32 md:h-40 object-cover" />
                     </div>
                     <div className="space-y-3 md:space-y-4">
                         <LazyImage src="https://images.unsplash.com/photo-1582650630737-b6737190d64d?q=80&w=400&auto=format&fit=crop" alt="Mountains" className="rounded-2xl shadow-lg w-full h-32 md:h-40 object-cover" />
                         <LazyImage src="https://images.unsplash.com/photo-1533237264983-3663b6238b7e?q=80&w=400&auto=format&fit=crop" alt="Prayer Flags" className="rounded-2xl shadow-lg w-full h-40 md:h-64 object-cover" />
                     </div>
                 </div>
             </Reveal>
             <Reveal delay={200}>
                 <h2 className="font-heading text-3xl font-bold text-brand-dark mb-6">Giving Back to the Himalayas</h2>
                 <p className="text-gray-600 mb-6 leading-relaxed">
                     Your purchase does more than optimize your health. It supports the remote villages of Dolpa.
                 </p>
                 <ul className="space-y-4 mb-8">
                     <li className="flex items-start">
                         <div className="bg-brand-red/10 p-2 rounded-full mr-4 text-brand-red"><Heart size={20} /></div>
                         <div>
                             <h4 className="font-bold text-brand-dark">Fair Wages</h4>
                             <p className="text-sm text-gray-500">We pay 20% above market rates directly to harvesters, bypassing middlemen.</p>
                         </div>
                     </li>
                     <li className="flex items-start">
                         <div className="bg-brand-red/10 p-2 rounded-full mr-4 text-brand-red"><Mountain size={20} /></div>
                         <div>
                             <h4 className="font-bold text-brand-dark">Education Initiatives</h4>
                             <p className="text-sm text-gray-500">A portion of profits funds local schools and educational materials for Sherpa children.</p>
                         </div>
                     </li>
                 </ul>
                 <Link to="/product/himalaya-shilajit-resin">
                     <Button>Support The Mission</Button>
                 </Link>
             </Reveal>
          </div>

        </Container>
      </div>
    );
};

// --- Science Page ---
export const SciencePage = () => (
  <div className="bg-white">
    <PageHeader 
        title="Bio-Chemistry of Peak Performance" 
        subtitle="Shilajit isn't magic. It's complex earth chemistry. Understanding Fulvic Acid, DBPs, and Trace Minerals."
    />

    <Container className="py-20">
      
      {/* Fulvic Acid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-24 items-center">
        <Reveal>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 relative">
                <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-20 h-20 md:w-24 md:h-24 bg-brand-red rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-float text-sm md:text-base text-center">
                    60%+ <br/>Fulvic
                </div>
                <LazyImage src="https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop" alt="Molecular Structure" className="rounded-xl w-full h-auto" />
                <p className="text-center text-xs text-gray-400 mt-2 italic">Conceptual visualization of Fulvic Acid molecular transport</p>
            </div>
        </Reveal>
        <Reveal delay={200}>
            <h2 className="font-heading text-3xl font-bold text-brand-dark mb-6">Fulvic Acid: The Master Carrier</h2>
            <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                The primary active compound in Shilajit is Fulvic Acid. In the modern world, our soil is depleted, and our food lacks the minerals we evolved to need. Even if you eat clean, your cells might be starving.
            </p>
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-brand-dark flex items-center gap-2 text-lg"><Activity size={20} className="text-brand-red"/> Nutrient Transport</h4>
                    <p className="text-gray-500 text-sm mt-1">Fulvic acid has a unique low molecular weight that allows it to bond with minerals and transport them directly <i>through</i> cell membranes, increasing bioavailability by up to 400%.</p>
                </div>
                <div>
                    <h4 className="font-bold text-brand-dark flex items-center gap-2 text-lg"><Zap size={20} className="text-brand-red"/> ATP Production</h4>
                    <p className="text-gray-500 text-sm mt-1">It feeds the mitochondria (powerhouse of the cell), fueling the production of Adenosine Triphosphate (ATP) – your body's energy currency.</p>
                </div>
            </div>
        </Reveal>
      </div>

      {/* DBP Section */}
      <Reveal>
          <div className="bg-stone-900 text-white rounded-3xl p-8 md:p-16 mb-24 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-red opacity-10 skew-x-12"></div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                      <h2 className="font-heading text-3xl font-bold mb-6">Dibenzo-alpha-pyrones (DBPs)</h2>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                          Often overlooked, DBPs are the "energizers" within Shilajit. They act as electron reservoirs, replenishing the electron transport chain in mitochondria during intense physical exertion.
                      </p>
                      <ul className="space-y-3">
                          <li className="flex items-center text-sm font-bold text-gray-200"><CheckCircle className="text-brand-red mr-3" size={18} /> Prevents CoQ10 breakdown</li>
                          <li className="flex items-center text-sm font-bold text-gray-200"><CheckCircle className="text-brand-red mr-3" size={18} /> Sustains energy levels during workouts</li>
                          <li className="flex items-center text-sm font-bold text-gray-200"><CheckCircle className="text-brand-red mr-3" size={18} /> Accelerates physical recovery</li>
                      </ul>
                  </div>
                  <div className="flex justify-center">
                      <div className="w-56 h-56 md:w-64 md:h-64 border-4 border-brand-red/30 rounded-full flex items-center justify-center relative">
                          <div className="w-40 h-40 md:w-48 md:h-48 border-4 border-brand-red/60 rounded-full flex items-center justify-center animate-pulse">
                              <div className="text-center">
                                  <div className="text-3xl md:text-4xl font-heading font-extrabold">85+</div>
                                  <div className="text-xs font-bold uppercase tracking-wider">Ionic Minerals</div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </Reveal>

      {/* Lab Reports */}
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-bold text-brand-dark mb-4">Trust Through Transparency</h2>
            <p className="text-gray-600">We test every single batch in ISO-certified laboratories in the USA for heavy metals, microbial contaminants, and fulvic acid content.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { name: "Heavy Metals Analysis", date: "Oct 24, 2023", status: "PASSED" },
                { name: "Microbiological Screen", date: "Oct 24, 2023", status: "PASSED" },
                { name: "Fulvic Content (64.2%)", date: "Oct 25, 2023", status: "EXCEPTIONAL" }
            ].map((report, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 p-6 rounded-xl hover:border-brand-dark transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                        <FileText className="text-gray-400 group-hover:text-brand-red transition-colors" size={32} />
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">{report.status}</span>
                    </div>
                    <h4 className="font-bold text-brand-dark mb-1">{report.name}</h4>
                    <p className="text-xs text-gray-500 mb-4">Batch #HV-2938 • {report.date}</p>
                    <div className="text-brand-red text-xs font-bold flex items-center uppercase tracking-wider">
                        Download PDF <ArrowRight size={14} className="ml-1" />
                    </div>
                </div>
            ))}
        </div>
      </Reveal>

    </Container>
  </div>
);

// --- FAQ Page ---
export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = [
      { id: 'general', label: 'General' },
      { id: 'usage', label: 'Usage & Dosage' },
      { id: 'shipping', label: 'Shipping' }
  ];
  const [activeCategory, setActiveCategory] = useState('general');

  // Extended FAQ Data
  const extendedFAQs = [
      { category: 'general', q: "What does it taste like?", a: "Pure Shilajit has a strong, earthy, smoky flavor. It is not sweet. Some describe it as a complex herbal coffee taste. It signifies high purity and lack of added sweeteners or fillers." },
      { category: 'general', q: "Is it safe? What about heavy metals?", a: "Safety is our #1 priority. Raw Shilajit naturally contains heavy metals, which is why purification is essential. Our 'Surya Tapi' method removes impurities, and every batch is 3rd-party lab tested in the USA to ensure lead, arsenic, and mercury levels are far below strict California Prop 65 limits." },
      { category: 'usage', q: "When should I take it?", a: "For maximum absorption, take it first thing in the morning on an empty stomach. If you have a sensitive stomach, you can take it with a light meal." },
      { category: 'usage', q: "Can women take Shilajit?", a: "Absolutely. While often marketed for male vitality, Shilajit is incredible for women's hormonal balance, bone density, and iron levels (treating anemia)." },
      { category: 'usage', q: "Can I mix it with hot coffee?", a: "Yes! While we recommend warm water to preserve all enzymes, many customers love it in coffee. Just ensure the coffee isn't boiling hot (wait 2 minutes after brewing)." },
      { category: 'shipping', q: "Where do you ship from?", a: "We ship all orders from our fulfillment center in Austin, Texas, ensuring fast delivery to US customers." },
      { category: 'shipping', q: "Do you ship internationally?", a: "Yes, we ship to most countries including UK, Canada, Australia, and Europe. International shipping usually takes 6-12 business days." },
  ];

  const filtered = extendedFAQs.filter(f => f.category === activeCategory);

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="Frequently Asked Questions" subtitle="Common questions about dosage, shipping, and purity." />

      <Container className="max-w-3xl py-16">
        <Reveal>
            <div className="flex justify-center gap-2 mb-10 flex-wrap">
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat.id ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </Reveal>

        <div className="space-y-4">
            {filtered.map((item, idx) => (
                <Reveal key={idx} delay={idx * 50}>
                    <div className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md bg-white">
                        <button 
                            className="w-full flex justify-between items-center p-5 md:p-6 text-left focus:outline-none"
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        >
                            <span className="font-heading font-bold text-brand-dark text-base md:text-lg pr-4">{item.q}</span>
                            {openIndex === idx ? <ChevronUp className="text-brand-red shrink-0" /> : <ChevronDown className="text-gray-400 shrink-0" />}
                        </button>
                        <div className={`px-5 md:px-6 text-gray-600 leading-relaxed overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                            {item.a}
                        </div>
                    </div>
                </Reveal>
            ))}
        </div>

        <Reveal delay={400}>
            <div className="mt-16 bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
                <h4 className="font-bold text-brand-dark mb-2">Still have questions?</h4>
                <p className="text-gray-500 mb-6">Our dedicated support team usually responds within 2 hours.</p>
                <a href="mailto:support@himalayavitality.com">
                    <Button variant="outline-dark" className="bg-white">Contact Support</Button>
                </a>
            </div>
        </Reveal>
      </Container>
    </div>
  );
};

// --- How To Use Page ---
export const HowToUsePage = () => {
    return (
        <div className="bg-white">
            <PageHeader title="Master the Elements" subtitle="Consistency is the key to transformation. Integrate Shilajit into your daily performance routine." />

            <Container className="py-20">
                {/* Standard Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative items-start mb-24">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-1 bg-gray-100 z-0"></div>

                    {[
                        { 
                            icon: Coffee, 
                            title: "1. Measure", 
                            text: "Using the golden spoon, scoop a pea-sized amount (300mg).", 
                            detail: "Precision is key.",
                            animate: "group-hover:rotate-12"
                        },
                        { 
                            icon: Droplet, 
                            title: "2. Dissolve", 
                            text: "Stir into lukewarm water or tea. Watch the golden resin disperse.", 
                            detail: "Avoid boiling water.",
                            animate: "group-hover:translate-y-1"
                        },
                        { 
                            icon: Sun, 
                            title: "3. Ignite", 
                            text: "Drink on an empty stomach to fuel your mitochondria instantly.", 
                            detail: "Feel the surge.",
                            animate: "group-hover:scale-110"
                        }
                    ].map((step, idx) => (
                        <Reveal key={idx} delay={idx * 200}>
                            <div className="relative z-10 group cursor-default text-center">
                                <div className={`w-28 h-28 md:w-32 md:h-32 mx-auto bg-white rounded-full flex items-center justify-center text-brand-dark border-4 border-gray-100 shadow-xl mb-6 transition-colors duration-300 group-hover:border-brand-red`}>
                                    <step.icon size={40} className={`text-brand-dark transition-transform duration-500 ${step.animate}`} />
                                </div>
                                <div className="px-4">
                                    <h3 className="font-heading font-bold text-2xl text-brand-dark mb-3">{step.title}</h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed font-medium text-sm">{step.text}</p>
                                    <div className="inline-block bg-gray-100 text-brand-dark text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                        {step.detail}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                {/* Stacking Protocols */}
                <div className="mb-24">
                    <Reveal>
                        <h2 className="font-heading text-3xl font-bold text-center mb-12 text-brand-dark">Pro Stacking Protocols</h2>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Reveal>
                            <div className="bg-amber-50 p-6 md:p-8 rounded-3xl border border-amber-100 h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-white p-3 rounded-full shadow-sm text-amber-600"><Zap size={24}/></div>
                                    <h3 className="font-heading font-bold text-xl text-brand-dark">The Morning Fire Stack</h3>
                                </div>
                                <p className="text-gray-600 mb-4">Combine for sustained energy without the caffeine crash.</p>
                                <ul className="space-y-3 bg-white p-4 md:p-6 rounded-2xl shadow-sm">
                                    <li className="flex justify-between font-bold text-sm text-gray-700 border-b border-gray-50 pb-2"><span>Shilajit Resin</span> <span>300mg</span></li>
                                    <li className="flex justify-between font-bold text-sm text-gray-700 border-b border-gray-50 pb-2"><span>Black Coffee</span> <span>1 Cup</span></li>
                                    <li className="flex justify-between font-bold text-sm text-gray-700"><span>MCT Oil</span> <span>1 tsp</span></li>
                                </ul>
                            </div>
                        </Reveal>
                        <Reveal delay={200}>
                            <div className="bg-blue-50 p-6 md:p-8 rounded-3xl border border-blue-100 h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-white p-3 rounded-full shadow-sm text-blue-600"><Brain size={24}/></div>
                                    <h3 className="font-heading font-bold text-xl text-brand-dark">The Deep Focus Stack</h3>
                                </div>
                                <p className="text-gray-600 mb-4">Ideal for deep work sessions and cognitive demands.</p>
                                <ul className="space-y-3 bg-white p-4 md:p-6 rounded-2xl shadow-sm">
                                    <li className="flex justify-between font-bold text-sm text-gray-700 border-b border-gray-50 pb-2"><span>Shilajit Resin</span> <span>300mg</span></li>
                                    <li className="flex justify-between font-bold text-sm text-gray-700 border-b border-gray-50 pb-2"><span>Lion's Mane</span> <span>500mg</span></li>
                                    <li className="flex justify-between font-bold text-sm text-gray-700"><span>Green Tea</span> <span>1 Cup</span></li>
                                </ul>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </Container>
        </div>
    );
};

// --- Contact Page ---
export const ContactPage = () => (
  <div className="bg-gray-50">
    <PageHeader title="Get in Touch" subtitle="Have a question about your order or our products? Our team is here to help." />
    <div className="py-20">
    <Container>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Reveal>
            <div>
            <div className="space-y-6">
                <div className="flex items-start bg-white p-6 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red mr-4 shrink-0">
                    <Mail size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-brand-dark mb-1">Email Support</h3>
                    <p className="text-gray-500 mb-1 text-sm">We usually reply within 2 hours.</p>
                    <a href="mailto:support@himalayavitality.com" className="text-brand-red font-bold hover:underline">support@himalayavitality.com</a>
                </div>
                </div>
                <div className="flex items-start bg-white p-6 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red mr-4 shrink-0">
                    <Truck size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-brand-dark mb-1">Wholesale Inquiries</h3>
                    <p className="text-gray-500 mb-1 text-sm">Partner with us for your store.</p>
                    <a href="mailto:wholesale@himalayavitality.com" className="text-brand-red font-bold hover:underline">wholesale@himalayavitality.com</a>
                </div>
                </div>
            </div>
            </div>
        </Reveal>

        <Reveal delay={200}>
            <div className="bg-white p-8 rounded-3xl shadow-lg shadow-gray-200/50">
            <form className="space-y-4">
                <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name</label>
                <input type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none" />
                </div>
                <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email</label>
                <input type="email" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none" />
                </div>
                <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Message</label>
                <textarea rows={4} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none"></textarea>
                </div>
                <Button fullWidth className="bg-brand-dark">Send Message</Button>
            </form>
            </div>
        </Reveal>
      </div>
    </Container>
    </div>
  </div>
);

// --- Track Order Page ---
export const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if(!orderId) return;

    setIsLocalLoading(true);
    setStatus(null);

    // Simulate API call
    setTimeout(() => {
        setIsLocalLoading(false);
        setStatus('In Transit');
    }, 1500);
  };

  return (
    <div className="bg-white">
      <PageHeader title="Track Your Order" subtitle="Enter your order number to see live updates." />
      <div className="py-20 min-h-[50vh]">
      <Container className="max-w-xl">
        <Reveal>
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
            <form onSubmit={handleTrack} className="flex gap-4 mb-8">
                <div className="relative flex-grow">
                <input 
                    type="text" 
                    placeholder="Order # (e.g., HV-1029)" 
                    className="w-full p-4 pl-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red outline-none"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <Button type="submit" className="px-8 min-w-[100px]" disabled={isLocalLoading}>
                    {isLocalLoading ? <Loader2 className="animate-spin" size={20} /> : 'Track'}
                </Button>
            </form>

            {status && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white p-6 rounded-xl border border-green-100 flex items-center mb-8 shadow-sm">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4 shrink-0">
                        <Truck size={24} />
                        </div>
                        <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Current Status</div>
                        <div className="font-bold text-brand-dark text-lg">In Transit - Arriving Tomorrow</div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </Reveal>
      </Container>
      </div>
    </div>
  );
};

// --- Legal Pages ---
export const PrivacyPage = () => (
    <div className="bg-white pb-20">
        <PageHeader title="Privacy Policy" />
        <Container className="max-w-3xl prose prose-red pt-16">
            <Reveal>
                <h3>Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, place an order, or sign up for our newsletter. This may include your name, email address, shipping address, and payment information.</p>
                <h3>How We Use Your Information</h3>
                <p>We use the information we collect to process your orders, communicate with you, improve our services, and prevent fraud.</p>
            </Reveal>
        </Container>
    </div>
);

export const TermsPage = () => (
    <div className="bg-white pb-20">
        <PageHeader title="Terms of Service" />
        <Container className="max-w-3xl prose prose-red pt-16">
            <Reveal>
                <h3>Use of Site</h3>
                <p>You may use our site only for lawful purposes. You are prohibited from violating or attempting to violate the security of the site.</p>
                <h3>Product Descriptions</h3>
                <p>We attempt to be as accurate as possible. However, we do not warrant that product descriptions or other content of this site is accurate, complete, reliable, current, or error-free.</p>
            </Reveal>
        </Container>
    </div>
);

export const ShippingReturnsPage = () => (
    <div className="bg-white pb-20">
        <PageHeader title="Shipping & Returns" />
        <Container className="max-w-3xl prose prose-red pt-16">
            <Reveal>
                <div className="flex items-center gap-4 not-prose mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="bg-white p-3 rounded-full shadow-sm text-brand-red"><Truck size={24} /></div>
                    <div>
                        <h4 className="font-bold text-brand-dark m-0">Free Global Shipping</h4>
                        <p className="text-sm text-gray-500 m-0">On all orders over $80 or 2+ item bundles.</p>
                    </div>
                </div>

                <h3>Shipping Policy</h3>
                <p>We process all orders within 24 hours of purchase. Standard shipping times are as follows:</p>
                <ul>
                    <li><strong>United States:</strong> 2-4 Business Days</li>
                    <li><strong>Europe & UK:</strong> 4-8 Business Days</li>
                    <li><strong>Canada & Australia:</strong> 6-12 Business Days</li>
                </ul>

                <h3>30-Day Money Back Guarantee</h3>
                <p>We stand behind the potency of our resin. If you don't feel a difference in your vitality within 30 days, simply contact us for a full refund.</p>
            </Reveal>
        </Container>
    </div>
);

// --- Sitemap Page ---
export const SitemapPage = () => {
    const sitemapLinks = [
        { section: 'Main', links: [
            { name: 'Home', path: '/' },
            { name: 'Shop Products', path: '/product/himalaya-shilajit-resin' },
            { name: 'Pure Himalayan Shilajit Resin', path: `/product/${MAIN_PRODUCT.id}` },
            { name: 'Customer Reviews', path: '/reviews' },
        ]},
        { section: 'Support', links: [
            { name: 'Track Order', path: '/track' },
            { name: 'Contact Us', path: '/contact' },
            { name: 'FAQ', path: '/faq' },
            { name: 'Shipping & Returns', path: '/shipping-returns' },
        ]},
        { section: 'Learn', links: [
            { name: 'Our Story', path: '/about' },
            { name: 'The Science', path: '/science' },
            { name: 'How To Use', path: '/how-to-use' },
            { name: 'Blog', path: '/blog' },
        ]},
        { section: 'Legal', links: [
            { name: 'Privacy Policy', path: '/privacy' },
            { name: 'Terms of Service', path: '/terms' },
        ]},
        { section: 'Blog Posts', links: BLOG_POSTS.map(post => ({ name: post.title, path: `/blog/${post.slug}` }))}
    ];

    return (
        <div className="bg-gray-50 pb-20">
            <PageHeader title="Sitemap" />
            <Container className="pt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sitemapLinks.map((section, idx) => (
                        <Reveal key={idx} delay={idx * 100} className="h-full">
                            <Card className="p-8 border-none shadow-sm h-full">
                                <h3 className="font-heading font-bold text-xl text-brand-dark mb-6 border-b border-gray-100 pb-2">{section.section}</h3>
                                <ul className="space-y-3">
                                    {section.links.map((link, i) => (
                                        <li key={i}>
                                            <Link to={link.path} className="text-gray-600 hover:text-brand-red transition-colors flex items-center group">
                                                <ArrowRight size={14} className="mr-2 text-gray-300 group-hover:text-brand-red transition-colors" />
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </Reveal>
                    ))}
                </div>
            </Container>
        </div>
    );
};
