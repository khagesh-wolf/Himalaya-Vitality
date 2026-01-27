
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, ArrowRight, ShieldCheck, Zap, Activity, Award, Droplet, Mountain, CheckCircle2, XCircle, Truck, Globe, Lock, Instagram } from 'lucide-react';
import { Button, Container, LazyImage, Reveal } from '../components/UI';
import { MAIN_PRODUCT, REVIEWS } from '../constants';
import { SEO } from '../components/SEO';

// Animated Letter Component
const AnimatedLetters = ({ text, delayStart = 0, className = "" }: { text: string, delayStart?: number, className?: string }) => {
  return (
    <span className={`inline-flex flex-wrap justify-center ${className}`}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="inline-block opacity-0 animate-letter-reveal"
          style={{ 
            animationDelay: `${delayStart + (index * 120)}ms`,
            minWidth: char === ' ' ? '0.4em' : 'auto'
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

const BenefitCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group h-full">
    <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mb-6 text-brand-red group-hover:bg-brand-red group-hover:text-white transition-colors duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-brand-red/30">
      <Icon size={28} />
    </div>
    <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
);

const ComparisonRow = ({ feature, us, them }: { feature: string, us: string | boolean, them: string | boolean }) => (
  <div className="grid grid-cols-3 gap-4 py-5 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors px-2 rounded-lg">
    <div className="font-bold text-xs md:text-sm text-gray-700">{feature}</div>
    <div className="text-center font-bold text-brand-dark flex justify-center">
        {us === true ? <CheckCircle2 size={20} className="text-green-600" /> : <span className="text-xs md:text-sm">{us}</span>}
    </div>
    <div className="text-center text-gray-400 text-xs md:text-sm flex justify-center">
        {them === false ? <XCircle size={20} className="text-gray-300" /> : <span className="text-xs md:text-sm">{them}</span>}
    </div>
  </div>
);

export const HomePage = () => {
  // Use hardcoded reviews
  const reviews = REVIEWS.slice(0, 3);

  // Simulated Instagram Feed (Using product images for visual consistency)
  const instagramPosts = MAIN_PRODUCT.images.slice(0, 4).map((img, i) => ({
    id: `insta-${i}`,
    image: img,
    link: 'https://www.instagram.com/himalaya_vitality/',
    caption: 'Unleash your potential with Himalaya Vitality.'
  }));

  return (
    <div className="bg-white">
      <SEO 
        title="Pure Himalayan Shilajit Resin | Gold Grade" 
        description="Experience the power of nature with ethically sourced, lab-tested Himalayan Shilajit. Boost energy, focus, and vitality naturally."
      />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black pb-20 pt-32 md:pt-40">
        
        {/* Background Image with Zoom Animation */}
        <div className="absolute inset-0 z-0">
            <LazyImage 
              src="https://yuzfkj.vercel.app/images/hero-bg.jpg" 
              alt="Himalayan Mountains" 
              className="w-full h-full object-cover opacity-60 animate-zoom-slow" 
            />
            {/* Gradient Overlays for Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        </div>

        <Container className="relative z-10 text-center flex flex-col items-center">
             {/* Animated Badge */}
             <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
                 <div className="inline-block mb-8 md:mb-10 group cursor-default">
                     <span className="inline-flex items-center gap-2 py-2 px-4 md:px-6 rounded-full border border-yellow-500/40 bg-black/40 backdrop-blur-xl text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.15)] group-hover:border-yellow-500/70 group-hover:shadow-[0_0_25px_rgba(250,204,21,0.25)] transition-all duration-500">
                        <Mountain size={14} className="text-yellow-400 mb-0.5" /> Nature's Ultimate Fuel
                     </span>
                 </div>
             </div>

             {/* Main Headline */}
             <div className="mb-8 md:mb-10 relative w-full">
                <h1 className="font-heading text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold leading-[0.9] text-white tracking-tighter drop-shadow-2xl">
                    <span className="block mb-2 text-white drop-shadow-xl animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
                        HIMALAYAN
                    </span>
                    <span className="block text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)] relative z-10 h-[1.1em] overflow-visible">
                        <AnimatedLetters text="SHILAJIT" delayStart={800} />
                    </span>
                </h1>
             </div>

             {/* Description */}
             <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-10 md:mb-12 font-medium max-w-xl md:max-w-2xl mx-auto drop-shadow-lg leading-relaxed animate-fade-in-up opacity-0 px-4" style={{ animationDelay: '1800ms' }}>
                 Unleash your primal potential with the purest <span className="text-yellow-400 font-bold border-b border-yellow-400/50 pb-0.5">Gold Grade</span> resin. 
                 Ethically sourced from the Ladakh range for peak performance.
             </p>

             {/* CTA Buttons */}
             <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-4 animate-fade-in-up opacity-0" style={{ animationDelay: '2000ms' }}>
                 <Link to="/product/himalaya-shilajit-resin" className="group relative w-full sm:w-auto">
                     <Button size="lg" className="relative h-14 md:h-16 px-8 md:px-12 text-lg bg-brand-red hover:bg-red-600 text-white border-none w-full sm:w-auto font-heading font-bold tracking-wide shadow-2xl flex items-center justify-center gap-3 overflow-hidden transform group-hover:-translate-y-0.5 transition-all">
                         <span className="relative z-10 flex items-center gap-2">Shop The Resin <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
                     </Button>
                 </Link>
                 <Link to="/science" className="w-full sm:w-auto group">
                     <Button size="lg" className="h-14 md:h-16 px-8 md:px-12 text-lg bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border border-white/20 w-full sm:w-auto font-heading font-bold tracking-wide transition-all shadow-lg hover:border-white/40 hover:shadow-white/5 transform group-hover:-translate-y-0.5">
                         Why It Works
                     </Button>
                 </Link>
             </div>
             
             {/* Bottom Trust Indicators with Float Animation */}
             <div className="mt-16 md:mt-20 flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-20 animate-fade-in-up opacity-0" style={{ animationDelay: '2200ms' }}>
                <div className="flex flex-col items-center gap-2 md:gap-3 group animate-float" style={{ animationDelay: '0s' }}>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-yellow-400 shadow-lg">
                        <CheckCircle2 size={20} className="text-yellow-400 md:w-6 md:h-6" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80">Lab Tested</span>
                </div>
                <div className="flex flex-col items-center gap-2 md:gap-3 group animate-float" style={{ animationDelay: '1.5s' }}>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-yellow-400 shadow-lg">
                        <Mountain size={20} className="text-yellow-400 md:w-6 md:h-6" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80">Authentic</span>
                </div>
                <div className="flex flex-col items-center gap-2 md:gap-3 group animate-float" style={{ animationDelay: '3s' }}>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-yellow-400 shadow-lg">
                        <Zap size={20} className="text-yellow-400 md:w-6 md:h-6" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80">Potent</span>
                </div>
             </div>
        </Container>
      </section>

      {/* --- BENEFITS GRID --- */}
      <section className="py-16 md:py-24 bg-stone-50 border-b border-stone-100 relative z-20 overflow-hidden">
        <Container>
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
                <span className="text-brand-red font-bold text-xs uppercase tracking-widest mb-2 block">Why Shilajit?</span>
                <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">Ancient Wisdom, Modern Science</h2>
                <p className="text-gray-500 text-sm md:text-base">Used for centuries in Ayurveda, now backed by clinical research for its profound impact on human health.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-brand-dark">
            <Reveal delay={0}>
                <BenefitCard 
                icon={Zap} 
                title="Natural Energy" 
                description="Boosts ATP production at the cellular level for sustained energy without the crash." 
                />
            </Reveal>
            <Reveal delay={150}>
                <BenefitCard 
                icon={Activity} 
                title="Hormonal Balance" 
                description="Supports healthy testosterone levels and regulates hormonal function naturally." 
                />
            </Reveal>
            <Reveal delay={300}>
                <BenefitCard 
                icon={ShieldCheck} 
                title="Immune Support" 
                description="Rich in Fulvic Acid (>80%) and antioxidants to strengthen your body's natural defenses." 
                />
            </Reveal>
            <Reveal delay={450}>
                <BenefitCard 
                icon={Award} 
                title="Cognitive Focus" 
                description="Clears brain fog and enhances memory retention through mineral nourishment." 
                />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* --- TRUST BADGES SECTION --- */}
      <section className="py-10 md:py-12 bg-white border-b border-gray-100">
        <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {[
                  { icon: Globe, title: "Ethical Sourcing", sub: "Direct from Himalayas" },
                  { icon: Droplet, title: "100% Pure Resin", sub: "No Fillers / Additives" },
                  { icon: ShieldCheck, title: "Lab Tested", sub: "Safety Certified" },
                  { icon: Lock, title: "Secure Checkout", sub: "256-bit SSL Encrypted" }
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 100}>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 text-center md:text-left group cursor-default hover:-translate-y-1 transition-transform duration-300 h-full">
                        <div className="p-3 rounded-full bg-stone-50 text-brand-dark group-hover:bg-brand-red group-hover:text-white transition-colors duration-300 shadow-sm shrink-0">
                            <item.icon size={20} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="font-heading font-bold text-sm text-brand-dark uppercase tracking-wide group-hover:text-brand-red transition-colors">{item.title}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden lg:block mt-0.5">{item.sub}</p>
                        </div>
                    </div>
                  </Reveal>
                ))}
            </div>
        </Container>
      </section>

      {/* --- COMPARISON SECTION (Dark Background) --- */}
      <section className="py-20 md:py-24 bg-stone-900 text-white relative overflow-hidden">
        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-6 leading-tight">Not All Shilajit is Created Equal</h2>
                <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                    The market is flooded with low-quality, solvent-extracted powders. 
                    Himalaya Vitality is strictly Gold Grade resin, purified using traditional 
                    Surya Tapi (sun-drying) methods for 60-90 days to preserve the delicate bioactive compounds.
                </p>
                
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-5 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 rounded-full bg-brand-red flex items-center justify-center shrink-0 shadow-lg shadow-brand-red/20 group-hover:scale-110 transition-transform">
                            <Mountain size={24} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg md:text-xl mb-1 text-white group-hover:text-brand-red transition-colors">High Altitude Sourcing</h4>
                            <p className="text-sm text-gray-400">Harvested exclusively above 18,000ft in the Himalayas.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 rounded-full bg-brand-red flex items-center justify-center shrink-0 shadow-lg shadow-brand-red/20 group-hover:scale-110 transition-transform">
                            <Droplet size={24} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg md:text-xl mb-1 text-white group-hover:text-brand-red transition-colors">Pure Resin Form</h4>
                            <p className="text-sm text-gray-400">Never dried into powder. Kept in its potent, living state.</p>
                        </div>
                    </div>
                </div>
              </div>
            </Reveal>

            {/* Comparison Card */}
            <Reveal delay={300}>
                <div className="bg-white rounded-3xl p-6 md:p-8 text-brand-dark shadow-2xl shadow-black/50 border border-gray-800 relative z-20 transform hover:-translate-y-2 transition-transform duration-500">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-gold-500 text-brand-dark font-bold px-4 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg whitespace-nowrap">
                        Proven Superiority
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div></div>
                        <div className="text-center">
                            <div className="font-heading font-extrabold text-base md:text-lg text-brand-dark mb-1">Himalaya</div>
                            <div className="text-[9px] md:text-[10px] font-bold text-brand-red uppercase tracking-widest">Vitality</div>
                        </div>
                        <div className="text-center opacity-50">
                            <div className="font-heading font-bold text-xs md:text-sm mb-1 text-gray-800">Generic</div>
                            <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-600">Brands</div>
                        </div>
                    </div>
                    
                    <div className="space-y-1 md:space-y-2 text-brand-dark">
                        <ComparisonRow feature="Form" us="Live Resin" them="Dried Powder" />
                        <ComparisonRow feature="Sourcing" us="18,000ft+" them="Low Altitude" />
                        <ComparisonRow feature="Fulvic Acid" us="> 80%" them="< 40%" />
                        <ComparisonRow feature="Drying" us="60-90 Days Sun" them="Heat Processed" />
                        <ComparisonRow feature="Lab Tested" us={true} them={false} />
                        <ComparisonRow feature="Additives" us="None" them="Fillers" />
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <Link to="/product/himalaya-shilajit-resin">
                            <Button fullWidth className="bg-brand-dark text-white hover:bg-black shadow-xl group">
                                Experience The Difference <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* --- HOW TO USE --- */}
      <section className="py-20 md:py-24 bg-white border-b border-gray-100">
        <Container>
            <Reveal>
                <div className="text-center mb-16">
                    <h2 className="font-heading text-3xl font-extrabold text-brand-dark mb-4">Simple Daily Ritual</h2>
                    <p className="text-gray-500">Consistency is key. Take it first thing in the morning.</p>
                </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { step: "01", title: "Measure", text: "Use the included golden spoon to scoop a pea-sized amount (300mg)." },
                    { step: "02", title: "Dissolve", text: "Stir into warm water, herbal tea, or coffee until fully dissolved." },
                    { step: "03", title: "Thrive", text: "Drink on an empty stomach to jumpstart your cellular energy." }
                ].map((item, i) => (
                    <Reveal key={i} delay={i * 200}>
                        <div className="bg-[#FDFBF7] p-8 rounded-3xl shadow-sm border border-stone-200 relative overflow-hidden group hover:shadow-lg hover:-translate-y-2 transition-all duration-300 h-full">
                            <div className="absolute top-0 right-0 p-6 text-7xl font-heading font-extrabold text-stone-200/50 z-0 group-hover:text-brand-red/10 transition-colors duration-500">{item.step}</div>
                            <div className="relative z-10">
                                <h3 className="font-heading font-bold text-xl text-brand-dark mb-3 group-hover:text-brand-red transition-colors">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed font-medium">{item.text}</p>
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </Container>
      </section>

      {/* --- REVIEWS SLIDER --- */}
      <section className="py-20 md:py-24 bg-gray-50">
        <Container>
            <Reveal>
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <h2 className="font-heading text-3xl font-extrabold text-brand-dark mb-2">Community Reviews</h2>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                            <div className="flex text-brand-gold-500">
                                <Star size={16} fill="currentColor" strokeWidth={0} />
                                <Star size={16} fill="currentColor" strokeWidth={0} />
                                <Star size={16} fill="currentColor" strokeWidth={0} />
                                <Star size={16} fill="currentColor" strokeWidth={0} />
                                <Star size={16} fill="currentColor" strokeWidth={0} />
                            </div>
                            <span>4.9 Average Rating</span>
                        </div>
                    </div>
                    <Link to="/reviews" className="flex items-center font-bold text-brand-red hover:text-brand-dark transition-colors group">
                        See All Reviews <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {reviews.map((review, i) => (
                    <Reveal key={review.id} delay={i * 150} className="h-full">
                        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 relative group h-full flex flex-col">
                            <div className="flex text-brand-gold-500 mb-6">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
                            </div>
                            <h4 className="font-bold text-lg text-brand-dark mb-3 leading-tight">"{review.title}"</h4>
                            <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-4 relative z-10 flex-grow">{review.content}</p>
                            <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                                <span className="font-bold text-sm text-brand-dark">{review.author}</span>
                                {review.verified && <span className="text-[10px] uppercase font-bold text-green-600 flex items-center tracking-wider bg-green-50 px-2 py-1 rounded-full"><CheckCircle2 size={12} className="mr-1"/> Verified</span>}
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </Container>
      </section>

      {/* --- INSTAGRAM FEED SECTION --- */}
      <section className="py-20 border-t border-gray-100 overflow-hidden bg-white">
        <Container>
            <Reveal>
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-2 text-brand-red font-bold uppercase tracking-widest text-xs">
                        <Instagram size={16} /> Social Community
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">
                        Follow @himalaya_vitality
                    </h2>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Join our community of high performers. Tag us to be featured.
                    </p>
                </div>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {instagramPosts.map((post, i) => (
                    <Reveal key={post.id} delay={i * 100}>
                        <a 
                            href={post.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="block relative aspect-square group overflow-hidden rounded-2xl cursor-pointer"
                        >
                            <LazyImage 
                                src={post.image} 
                                alt="Instagram Post" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                <Instagram className="text-white drop-shadow-lg transform scale-90 group-hover:scale-100 transition-transform" size={32} />
                            </div>
                        </a>
                    </Reveal>
                ))}
            </div>
            
            <div className="text-center mt-10">
                <a href="https://www.instagram.com/himalaya_vitality/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline-dark" className="gap-2 px-8">
                        <Instagram size={18} /> Follow on Instagram
                    </Button>
                </a>
            </div>
        </Container>
      </section>

      {/* --- PRODUCT SHOWCASE CTA --- */}
      <section className="relative py-24 md:py-32 bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-black"></div>
        
        <Container className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                <div className="w-full md:w-1/2">
                    <Reveal>
                        <div className="relative aspect-square max-w-sm mx-auto">
                            <div className="absolute inset-0 bg-brand-gold-500/20 rounded-full blur-3xl animate-pulse-fast"></div>
                            <LazyImage src={MAIN_PRODUCT.images[0]} alt="Himalaya Shilajit Jar" className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-700" />
                        </div>
                    </Reveal>
                </div>
                
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <Reveal delay={300}>
                        <span className="text-brand-gold-400 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">The Gold Standard</span>
                        <h2 className="font-heading text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
                            Invest In Your <br/>
                            <span className="text-white">Vitality Today.</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-xl mx-auto md:mx-0">
                            Join thousands of high performers who have optimized their biology. Risk-free with our 30-day "Feel the Difference" guarantee.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link to="/product/himalaya-shilajit-resin">
                                <Button size="lg" className="h-16 px-12 text-lg bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark font-extrabold shadow-[0_0_30px_rgba(234,179,8,0.3)] border-none w-full sm:w-auto">
                                    Get Started
                                </Button>
                            </Link>
                            <Link to="/reviews">
                                <Button size="lg" variant="outline" className="h-16 px-8 text-lg border-gray-600 text-gray-300 hover:text-white hover:border-white w-full sm:w-auto">
                                    Read Reviews
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 sm:gap-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <div className="flex items-center gap-2"><Truck size={16} /> Free Aus Shipping (2+)</div>
                            <div className="flex items-center gap-2"><ShieldCheck size={16} /> Money Back Guarantee</div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </Container>
      </section>
    </div>
  );
};
