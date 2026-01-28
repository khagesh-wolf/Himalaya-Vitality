
import React, { useState } from 'react';
import { 
  ShieldCheck, Globe, Truck, Beaker, FileText, Mail, Phone, MapPin, 
  ChevronDown, ChevronUp, Search, ArrowRight, Sun, Coffee, Droplet, Clock, PlayCircle, Loader2, Circle, CheckCircle, Package, Mountain, Heart, Zap, Brain, Activity, HelpCircle, AlertTriangle
} from 'lucide-react';
import { Container, Button, Card, Reveal, LazyImage, Badge } from '../components/UI';
import { Link } from 'react-router-dom';
import { BLOG_POSTS, MAIN_PRODUCT, FAQ_DATA } from '../constants';
import { trackOrder } from '../services/api';

// --- Shared Components ---
const PageHeader = ({ title, subtitle, image }: { title: string, subtitle?: string, image?: string }) => (
    <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-brand-dark">
        {/* Background */}
        <div className="absolute inset-0 z-0">
            {image && (
                <LazyImage 
                    src={image} 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-30 animate-zoom-slow" 
                    loading="eager"
                    fetchPriority="high"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        <Container className="relative z-10 text-center text-white pt-20 pb-20">
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

// Define static data
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
                            <Mountain size={18} className="text-brand-red" /> 18,000ft Elevation
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-brand-dark bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                            <Sun size={18} className="text-brand-gold-500" /> Surya Tapi Method
                        </div>
                    </div>
                </div>
            </Reveal>
            
            <Reveal delay={200}>
                <div className="relative">
                    <div className="absolute -inset-4 bg-brand-red/5 rounded-3xl transform rotate-3"></div>
                    <LazyImage 
                        src="https://images.unsplash.com/photo-1589820296156-2454bb8a4d50?q=80&w=800&auto=format&fit=crop" 
                        alt="Himalayan Mountains" 
                        className="relative rounded-2xl shadow-2xl w-full h-auto object-cover" 
                    />
                </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="font-heading text-3xl font-extrabold text-brand-dark mb-4">Our Process</h2>
                <p className="text-gray-500">We adhere to the traditional purification methods to ensure the bio-active compounds remain intact.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PROCESS_STEPS.map((step, i) => (
                    <div key={i} className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all text-center group">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${step.color} group-hover:scale-110 transition-transform`}>
                            <step.icon size={32} />
                        </div>
                        <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">{step.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>
          </Reveal>
        </Container>
      </div>
    );
};

// --- Science Page ---
export const SciencePage = () => {
    return (
        <div className="bg-white">
            <PageHeader 
                title="The Science" 
                subtitle="Research-backed benefits of Fulvic Acid and trace minerals on human physiology."
                image="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1200&auto=format&fit=crop"
            />
            
            <Container className="py-24">
                <Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                        {SCIENCE_BENEFITS.map((benefit, i) => (
                            <div key={i} className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
                                <benefit.icon size={40} className="text-brand-red mb-6" />
                                <h3 className="font-heading font-bold text-2xl text-brand-dark mb-4">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{benefit.text}</p>
                            </div>
                        ))}
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <Reveal>
                        <h2 className="font-heading text-4xl font-extrabold text-brand-dark mb-6">Fulvic Acid: The Miracle Molecule</h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Fulvic acid is the primary active compound in Shilajit. It acts as a powerful carrier molecule, 
                            capable of transporting minerals directly into cells where they are needed most.
                        </p>
                        <ul className="space-y-4">
                            {FULVIC_BENEFITS.map((item, i) => (
                                <li key={i} className="flex items-start">
                                    <CheckCircle size={20} className="text-green-500 mr-3 mt-1 shrink-0" />
                                    <span className="text-gray-700 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                    <Reveal delay={200}>
                         <div className="relative aspect-square bg-gray-900 rounded-3xl overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-brand-red/20 animate-pulse"></div>
                            <Beaker size={120} className="text-white/20" />
                            <div className="absolute bottom-8 left-8 right-8 text-center text-white/60 text-xs uppercase tracking-widest">
                                Molecular Structure Representation
                            </div>
                         </div>
                    </Reveal>
                </div>
            </Container>
        </div>
    );
};

// --- How To Use Page ---
export const HowToUsePage = () => {
    return (
        <div className="bg-white">
            <PageHeader 
                title="Daily Ritual" 
                subtitle="Integrating Shilajit into your routine is simple. Consistency is the key to results."
                image="https://images.unsplash.com/photo-1544233726-284691db686e?q=80&w=1200&auto=format&fit=crop"
            />
            <Container className="py-24">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <Reveal delay={0}>
                        <div className="p-8">
                            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-red">
                                <span className="font-heading font-bold text-2xl">01</span>
                            </div>
                            <h3 className="font-heading font-bold text-xl mb-4">Measure</h3>
                            <p className="text-gray-600">Using the included spoon, take a pea-sized amount (300-500mg) of resin.</p>
                        </div>
                    </Reveal>
                    <Reveal delay={150}>
                        <div className="p-8 relative">
                            <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
                            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-red bg-white">
                                <span className="font-heading font-bold text-2xl">02</span>
                            </div>
                            <h3 className="font-heading font-bold text-xl mb-4">Dissolve</h3>
                            <p className="text-gray-600">Mix into warm water, tea, or coffee. Do not use boiling water. Stir until dissolved.</p>
                        </div>
                    </Reveal>
                    <Reveal delay={300}>
                        <div className="p-8">
                            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-red">
                                <span className="font-heading font-bold text-2xl">03</span>
                            </div>
                            <h3 className="font-heading font-bold text-xl mb-4">Consume</h3>
                            <p className="text-gray-600">Drink once or twice daily, preferably on an empty stomach in the morning.</p>
                        </div>
                    </Reveal>
                 </div>

                 <Reveal className="mt-16 text-center">
                    <div className="bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto border border-gray-200">
                        <h4 className="font-bold text-brand-dark mb-2 flex items-center justify-center gap-2"><AlertTriangle size={18} className="text-yellow-500"/> Pro Tip</h4>
                        <p className="text-sm text-gray-500">
                            The resin may harden in cold temperatures. If it's difficult to scoop, warm the jar in your hands or a bowl of warm water for a few minutes.
                        </p>
                    </div>
                 </Reveal>
            </Container>
        </div>
    );
};

// --- FAQ Page ---
export const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="bg-gray-50 min-h-screen">
            <PageHeader 
                title="Frequently Asked" 
                subtitle="Answers to common questions about Shilajit, shipping, and usage."
            />
            <Container className="py-24 max-w-4xl">
                <div className="space-y-4">
                    {FAQ_DATA.map((item, i) => (
                        <Reveal key={i} delay={i * 50}>
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <button 
                                    className="w-full flex items-center justify-between p-6 text-left font-bold text-brand-dark hover:bg-gray-50 transition-colors"
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                >
                                    <span>{item.question}</span>
                                    {openIndex === i ? <ChevronUp className="text-brand-red" /> : <ChevronDown className="text-gray-400" />}
                                </button>
                                {openIndex === i && (
                                    <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        </Reveal>
                    ))}
                </div>
                
                <div className="mt-16 text-center">
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
    return (
        <div className="bg-white">
            <PageHeader 
                title="Get in Touch" 
                subtitle="We are here to help with your order, product questions, or wholesale inquiries."
            />
            <Container className="py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <Reveal>
                        <h2 className="font-heading text-3xl font-bold text-brand-dark mb-6">Send us a message</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="First Name" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red" />
                                <input type="text" placeholder="Last Name" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red" />
                            </div>
                            <input type="email" placeholder="Email Address" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red" />
                            <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red text-gray-500">
                                <option>Order Support</option>
                                <option>Product Question</option>
                                <option>Wholesale</option>
                                <option>Other</option>
                            </select>
                            <textarea rows={5} placeholder="How can we help?" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red"></textarea>
                            <Button size="lg" fullWidth>Send Message</Button>
                        </form>
                    </Reveal>
                    
                    <Reveal delay={200}>
                        <div className="bg-brand-dark text-white p-10 rounded-3xl h-full flex flex-col justify-between relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                             
                             <div>
                                 <h3 className="font-heading font-bold text-2xl mb-8">Contact Info</h3>
                                 <div className="space-y-6">
                                     <div className="flex items-start gap-4">
                                         <div className="bg-white/10 p-3 rounded-lg"><Mail className="text-brand-red"/></div>
                                         <div>
                                             <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Email</div>
                                             <div className="font-medium text-lg">support@himalayavitality.com</div>
                                         </div>
                                     </div>
                                     <div className="flex items-start gap-4">
                                         <div className="bg-white/10 p-3 rounded-lg"><MapPin className="text-brand-red"/></div>
                                         <div>
                                             <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Headquarters</div>
                                             <div className="font-medium text-lg">Sydney, Australia</div>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             <div className="mt-12">
                                 <h4 className="font-bold mb-4">Follow Us</h4>
                                 <div className="flex gap-4">
                                     {/* Social Icons would go here */}
                                     <div className="w-10 h-10 bg-white/10 rounded-full hover:bg-brand-red transition-colors cursor-pointer"></div>
                                     <div className="w-10 h-10 bg-white/10 rounded-full hover:bg-brand-red transition-colors cursor-pointer"></div>
                                 </div>
                             </div>
                        </div>
                    </Reveal>
                </div>
            </Container>
        </div>
    );
};

// --- Track Order Page ---
export const TrackOrderPage = () => {
    const [orderId, setOrderId] = useState('');
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!orderId) return;
        setLoading(true);
        setError('');
        setStatus(null);
        try {
            const data = await trackOrder(orderId);
            setStatus(data);
        } catch (err: any) {
            setError(err.message || 'Order not found. Please check your ID.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-20">
            <Container className="max-w-md w-full">
                <Card className="p-8 shadow-xl">
                    <div className="text-center mb-8">
                        <Truck size={48} className="text-brand-dark mx-auto mb-4" />
                        <h1 className="font-heading font-bold text-2xl text-brand-dark mb-2">Track Your Order</h1>
                        <p className="text-gray-500 text-sm">Enter your Order ID (e.g., HV-1234) to see the current status.</p>
                    </div>

                    <form onSubmit={handleTrack} className="space-y-4">
                        <input 
                            type="text" 
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Order ID" 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red font-mono text-center uppercase" 
                        />
                        <Button fullWidth size="lg" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Track Order'}
                        </Button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-500 rounded-xl text-center text-sm font-bold border border-red-100 flex items-center justify-center gap-2">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}

                    {status && (
                        <div className="mt-8 p-6 bg-white border border-green-100 rounded-xl shadow-sm text-center animate-in fade-in slide-in-from-bottom-2">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Status</div>
                            <div className="text-2xl font-heading font-bold text-brand-dark mb-4">{status.status}</div>
                            
                            {status.trackingNumber && (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1">{status.carrier} Tracking:</div>
                                    <div className="font-mono font-bold text-brand-dark select-all">{status.trackingNumber}</div>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </Container>
        </div>
    );
};

// --- Legal & Misc Pages ---

export const PrivacyPage = () => (
    <ContentBlock title="Privacy Policy">
        <p>At Himalaya Vitality, we respect your privacy...</p>
        <h3>Data Collection</h3>
        <p>We collect information you provide directly to us when you make a purchase...</p>
        <h3>Cookies</h3>
        <p>We use cookies to improve your experience...</p>
    </ContentBlock>
);

export const TermsPage = () => (
    <ContentBlock title="Terms of Service">
        <p>Welcome to Himalaya Vitality. By accessing our site, you agree to these terms...</p>
        <h3>Use of Site</h3>
        <p>You may not use our products for any illegal or unauthorized purpose...</p>
        <h3>Refunds</h3>
        <p>We offer a 30-day money back guarantee...</p>
    </ContentBlock>
);

export const ShippingReturnsPage = () => (
    <ContentBlock title="Shipping & Returns">
        <h3>Shipping Policy</h3>
        <p>We ship worldwide from our warehouse in Australia. Orders are processed within 24 hours.</p>
        <ul>
            <li>Australia: 2-5 Business Days (Free over 2 jars)</li>
            <li>International: 6-12 Business Days</li>
        </ul>
        <h3>Returns</h3>
        <p>If you aren't satisfied with your first jar, contact us within 30 days for a full refund.</p>
    </ContentBlock>
);

export const SitemapPage = () => (
    <div className="py-20 bg-gray-50">
        <Container>
            <h1 className="font-heading font-bold text-3xl mb-8">Sitemap</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold mb-4">Shop</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><Link to="/product/himalaya-shilajit-resin" className="hover:text-brand-red">Resin</Link></li>
                        <li><Link to="/cart" className="hover:text-brand-red">Cart</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Learn</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><Link to="/science" className="hover:text-brand-red">Science</Link></li>
                        <li><Link to="/how-to-use" className="hover:text-brand-red">How To Use</Link></li>
                        <li><Link to="/blog" className="hover:text-brand-red">Blog</Link></li>
                        <li><Link to="/faq" className="hover:text-brand-red">FAQ</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Company</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><Link to="/about" className="hover:text-brand-red">About Us</Link></li>
                        <li><Link to="/contact" className="hover:text-brand-red">Contact</Link></li>
                        <li><Link to="/track" className="hover:text-brand-red">Track Order</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Legal</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><Link to="/privacy" className="hover:text-brand-red">Privacy</Link></li>
                        <li><Link to="/terms" className="hover:text-brand-red">Terms</Link></li>
                    </ul>
                </div>
            </div>
        </Container>
    </div>
);
