
import React, { useState } from 'react';
import { 
  ShieldCheck, Globe, Truck, Beaker, FileText, Mail, Phone, MapPin, 
  ChevronDown, ChevronUp, Search, ArrowRight, Sun, Coffee, Droplet, Clock, PlayCircle, Loader2, Circle, CheckCircle, Package, Mountain, Heart, Zap, Brain, Activity, HelpCircle
} from 'lucide-react';
import { Container, Button, Card, Reveal, LazyImage, Badge } from '../components/UI';
import { Link } from 'react-router-dom';
import { BLOG_POSTS, MAIN_PRODUCT, FAQ_DATA } from '../constants';

// --- Shared Page Header Component ---
const PageHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-brand-dark pt-20">
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-black to-brand-dark"></div>
            {/* Abstract pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        <Container className="relative z-10 text-center text-white pt-10 pb-20">
            <Reveal>
                <h1 className="font-heading text-4xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed px-4">
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
            title="The Gold of Nepal" 
            subtitle="Sourced from the pristine Himalayan landscape, specifically Dolpa, Mugu, Jajarkot, Humla, Rukum, and Gorkha."
        />

        <Container className="py-16 md:py-24">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center mb-24 md:mb-32">
            <Reveal>
                <div>
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-6">Conqueror of Mountains</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                        The term "Shilajit" is derived from Sanskrit, meaning "conqueror of rocks or mountains". 
                        It is a natural substance ranging in color from pale brown to blackish-brown that exudes from rocks in mountain ranges, especially in the Himalayas.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        It has been formed for centuries from compressed plant materials under high pressure and temperature. Due to the sun's heat on mountains, 
                        the Shilajit material seeps out of rock cracks. Our premium Shilajit is sourced specifically from the 
                        <strong> Dolpa, Mugu, Jajarkot, Humla, Rukum, and Gorkha</strong> districts of Nepal.
                    </p>
                </div>
            </Reveal>
            <Reveal delay={200}>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[400px] md:h-[500px] bg-stone-100 flex items-center justify-center">
                    <img src={MAIN_PRODUCT.images[0]} alt="Himalaya Shilajit" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
                        <div className="flex items-center text-white gap-2 font-bold uppercase tracking-widest text-xs mb-2">
                            <MapPin size={16} className="text-brand-red" /> Dolpa District, Nepal
                        </div>
                        <div className="text-white opacity-80 text-sm">Altitude: 18,000 ft</div>
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
                          We strictly follow the traditional Ayurvedic purification methods described in ancient texts like the <em>Charaka Samhita</em>.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                      {[
                          { title: "Filtration", text: "The raw resin is dissolved in pure spring water and filtered through cotton cloth to remove rocks and grit." },
                          { title: "Sun Drying", text: "The filtered solution is placed in stainless steel trays and exposed to the Himalayan sun for 60-90 days." },
                          { title: "Testing", text: "Quality assurance certified by IAS, G-CERT2, FDA, and DDA to ensure purity." }
                      ].map((step, i) => (
                          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="text-4xl font-heading font-extrabold text-brand-red/10 mb-4">0{i+1}</div>
                                <h3 className="font-bold text-lg text-brand-dark mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-500">{step.text}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </Reveal>
        </Container>
      </div>
    );
};

export const SciencePage = () => (
    <div className="bg-white">
        <PageHeader 
            title="The Science of Shilajit" 
            subtitle="Rich in Humic (80-85%) and Non-humic (15-20%) compounds."
        />
        <Container className="py-20">
            <div className="max-w-4xl mx-auto">
                <Reveal>
                    <div className="prose prose-lg prose-red text-gray-600">
                        <h2>Composition</h2>
                        <p>
                            Shilajit is a natural substance rich in humic (80-85%) and non-humic (15-20%) compounds. 
                            It includes dibenzo-a-pyrones, triterpenes, amino acids, and essential vitamins formed through the humification of organic matter over centuries.
                            It contains more than 84 minerals including copper, silver, zinc, iron, and lead in their ionic forms (Ghosal & Lal, n.d).
                        </p>

                        <h2>Cellular Energy & Anti-Aging</h2>
                        <p>
                            Essential nutrients like vitamins B1 and B12 contribute to its antioxidant properties and therapeutic efficacy by enhancing 
                            cellular energy and combating oxidative stress <strong>(Wilson et al., 2011)</strong>.
                        </p>
                        
                        <h2>Cognitive Benefits</h2>
                        <p>
                            Shilajit also has cognitive benefits due to its ability to prevent tau protein buildup in the brain, 
                            which is a marker for Alzheimer's disease <strong>(Fontaine et al., 2024)</strong>.
                        </p>

                        <h2>Therapeutic Indications</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0">
                            {[
                                "Urinary disorders", "Digestive disorders", 
                                "Abdominal bloating", "Constipation & Piles", 
                                "Anemia", "Tuberculosis", 
                                "General weakness", "Chronic bronchitis",
                                "Kidney stones (urolithiasis)", "Jaundice"
                            ].map(item => (
                                <li key={item} className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-brand-red shrink-0" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Reveal>
            </div>
        </Container>
    </div>
);

export const FAQPage = () => (
    <div className="bg-gray-50 min-h-screen">
        <PageHeader title="Frequently Asked Questions" subtitle="Common questions about usage, shipping, and purity." />
        <Container className="py-20">
             <div className="max-w-3xl mx-auto space-y-6">
                {FAQ_DATA.map((item, i) => (
                    <Reveal key={i} delay={i * 100}>
                        <Card className="p-6">
                            <h3 className="font-bold text-lg text-brand-dark mb-2 flex items-start gap-3">
                                <HelpCircle size={20} className="text-brand-red shrink-0 mt-0.5"/> 
                                {item.question}
                            </h3>
                            <p className="text-gray-600 pl-8">{item.answer}</p>
                        </Card>
                    </Reveal>
                ))}
             </div>
        </Container>
    </div>
);

export const ContactPage = () => (
    <div className="bg-white">
         <PageHeader title="Contact Us" subtitle="We're here to support your journey to vitality." />
         <Container className="py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-brand-dark">Get in Touch</h2>
                    <p className="mb-8 text-gray-600 leading-relaxed">
                        Whether you have a question about your order, the product, or just want to say hi, our team is ready to help.
                    </p>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-brand-red text-white flex items-center justify-center rounded-full"><Mail size={18}/></div>
                            <div>
                                <div className="text-xs font-bold uppercase text-gray-400">Email</div>
                                <div className="font-bold text-brand-dark">support@himalayavitality.com</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-brand-dark text-white flex items-center justify-center rounded-full"><MapPin size={18}/></div>
                            <div>
                                <div className="text-xs font-bold uppercase text-gray-400">Headquarters</div>
                                <div className="font-bold text-brand-dark">Melbourne, Australia</div>
                            </div>
                        </div>
                    </div>
                </div>
                <Card className="p-8 shadow-lg">
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red" placeholder="Name" />
                            <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red" placeholder="Email" type="email" />
                        </div>
                        <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red" placeholder="Subject" />
                        <textarea className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red" rows={4} placeholder="How can we help?"></textarea>
                        <Button fullWidth>Send Message</Button>
                    </form>
                </Card>
            </div>
         </Container>
    </div>
);

export const TrackOrderPage = () => (
    <div className="min-h-screen bg-gray-50">
         <PageHeader title="Track Your Order" />
         <Container className="py-20 text-center">
             <Card className="max-w-md mx-auto p-10 shadow-xl">
                <Truck size={48} className="text-brand-dark mx-auto mb-6" />
                <p className="mb-6 text-gray-600">Enter your order number to check the status of your Australia Post shipment.</p>
                <div className="space-y-4">
                    <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red" placeholder="Order # (e.g. HV-1234)" />
                    <Button fullWidth>Track Order</Button>
                </div>
             </Card>
         </Container>
    </div>
);

export const HowToUsePage = () => (
    <div className="bg-white">
        <PageHeader title="How To Use" subtitle="Master your daily ritual for optimal results." />
        <Container className="py-20">
            <div className="max-w-3xl mx-auto space-y-16">
                {[
                    { step: "01", title: "Measure", desc: "Using the included golden spoon, take a pea-sized amount (250-500mg).", icon: Circle },
                    { step: "02", title: "Dissolve", desc: "Dissolve the resin in lukewarm water, milk, or herbal tea. It should dissolve completely within minutes.", icon: Droplet },
                    { step: "03", title: "Consume", desc: "Take it twice a day: once in the morning and once between meals.", icon: Coffee },
                    { step: "04", title: "Consistency", desc: "Taking 250 mg of Shilajit twice a day for 90 consecutive days increases total testosterone (Pandit & Biswas, 2015).", icon: Clock }
                ].map((item, i) => (
                    <div key={i} className="flex gap-8 items-start">
                         <div className="text-5xl font-heading font-extrabold text-brand-red/10 shrink-0">{item.step}</div>
                         <div>
                             <h3 className="text-2xl font-bold text-brand-dark mb-2 flex items-center gap-3">
                                 <item.icon size={24} className="text-brand-red" /> {item.title}
                             </h3>
                             <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
                         </div>
                    </div>
                ))}
            </div>
        </Container>
    </div>
);

export const PrivacyPage = () => (
    <div className="bg-white">
        <Container className="py-20 prose prose-lg mx-auto text-gray-600">
            <h1>Privacy Policy</h1>
            <p>Last updated: October 2023</p>
            <p>At Himalaya Vitality, we respect your privacy and are committed to protecting your personal data.</p>
            <h3>1. Data Collection</h3>
            <p>We collect information you provide directly to us when you make a purchase, create an account, or sign up for our newsletter.</p>
            <h3>2. How We Use Your Data</h3>
            <p>We use your data to process orders, communicate with you, and improve our store.</p>
            <h3>3. Security</h3>
            <p>We implement appropriate technical and organizational measures to protect your data.</p>
        </Container>
    </div>
);

export const TermsPage = () => (
    <div className="bg-white">
        <Container className="py-20 prose prose-lg mx-auto text-gray-600">
            <h1>Terms of Service</h1>
            <p>By accessing this website, you agree to be bound by these terms of service.</p>
            <h3>1. Usage</h3>
            <p>You may not use our products for any illegal or unauthorized purpose.</p>
            <h3>2. Accuracy</h3>
            <p>We reserve the right to modify the contents of this site at any time, but we have no obligation to update any information on our site.</p>
        </Container>
    </div>
);

export const ShippingReturnsPage = () => (
    <div className="bg-white">
        <PageHeader title="Shipping & Returns" />
        <Container className="py-20 max-w-4xl mx-auto space-y-12">
            <div>
                <h2 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-3"><Truck size={24} className="text-brand-red"/> Shipping Policy</h2>
                <div className="prose text-gray-600">
                    <p>We are Australian operated and ship worldwide. All orders are processed within 24 hours.</p>
                    <ul>
                        <li><strong>Australia (AusPost):</strong> 2-5 Business Days</li>
                        <li><strong>International:</strong> 6-12 Business Days</li>
                    </ul>
                    <p>Free shipping is available on all multi-jar bundles.</p>
                </div>
            </div>
            
            <hr className="border-gray-100"/>

            <div>
                <h2 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-3"><ShieldCheck size={24} className="text-brand-red"/> Return Policy</h2>
                <div className="prose text-gray-600">
                    <p>We offer a 30-day "Feel the Difference" money-back guarantee.</p>
                    <p>If you aren't satisfied with your purchase, simply contact support@himalayavitality.com within 30 days of receiving your order to initiate a return.</p>
                </div>
            </div>
        </Container>
    </div>
);

export const SitemapPage = () => (
    <div className="bg-gray-50 min-h-screen">
        <PageHeader title="Sitemap" />
        <Container className="py-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm">Shop</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li><Link to="/product/himalaya-shilajit-resin" className="hover:text-brand-red">Premium Resin</Link></li>
                        <li><Link to="/cart" className="hover:text-brand-red">Cart</Link></li>
                        <li><Link to="/checkout" className="hover:text-brand-red">Checkout</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm">Learn</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li><Link to="/science" className="hover:text-brand-red">The Science</Link></li>
                        <li><Link to="/how-to-use" className="hover:text-brand-red">How To Use</Link></li>
                        <li><Link to="/about" className="hover:text-brand-red">Our Story</Link></li>
                        <li><Link to="/blog" className="hover:text-brand-red">Blog</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm">Support</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li><Link to="/contact" className="hover:text-brand-red">Contact Us</Link></li>
                        <li><Link to="/faq" className="hover:text-brand-red">FAQ</Link></li>
                        <li><Link to="/track" className="hover:text-brand-red">Track Order</Link></li>
                        <li><Link to="/shipping-returns" className="hover:text-brand-red">Shipping & Returns</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm">Legal</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li><Link to="/privacy" className="hover:text-brand-red">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="hover:text-brand-red">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
        </Container>
    </div>
);
