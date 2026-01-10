
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, User, ArrowRight, Facebook, Twitter, Linkedin, Link as LinkIcon, Share2, List, Clock } from 'lucide-react';
import { Container, Button, Card, Reveal } from '../components/UI';
import { BLOG_POSTS } from '../constants';
import { SEO } from '../components/SEO';

// --- Blog Index (Listing) ---
export const BlogIndex = () => {
  return (
    <div className="bg-gray-50 py-20 min-h-screen">
      <SEO title="Vitality Blog" description="Latest news, health tips, and ayurvedic wisdom from Himalaya Vitality." />
      <Container>
        <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-brand-red font-bold text-sm uppercase tracking-widest mb-2 block">The Journal</span>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-brand-dark mb-6">Ayurvedic Wisdom for Modern Life</h1>
            <p className="text-gray-500 text-lg">Deep dives into performance, health, and the science of nature.</p>
            </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, i) => (
            <Reveal key={post.id} delay={i * 150} className="h-full">
                <Link to={`/blog/${post.slug}`} className="group h-full block">
                <article className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                    <div className="aspect-video overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        <span className="text-brand-red">{post.category}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-brand-dark mb-3 group-hover:text-brand-red transition-colors">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3">{post.excerpt}</p>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">{post.author}</span>
                        <span className="text-brand-red font-bold text-xs flex items-center">Read More <ArrowRight size={14} className="ml-1" /></span>
                    </div>
                    </div>
                </article>
                </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
};

// --- Single Blog Post Page ---

// Helper to calculate reading time
const calculateReadingTime = (text: string) => {
    const wpm = 225;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wpm);
};

// Helper for Social Share Links
const SocialShare = ({ title, url }: { title: string, url: string }) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="flex flex-col gap-4 sticky top-32">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 hidden lg:block">Share</span>
            <div className="flex lg:flex-col gap-3">
                <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                    title="Share on Facebook"
                >
                    <Facebook size={18} />
                </a>
                <a 
                    href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                    title="Share on Twitter"
                >
                    <Twitter size={18} />
                </a>
                <a 
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                    title="Share on LinkedIn"
                >
                    <Linkedin size={18} />
                </a>
                <button 
                    onClick={copyToClipboard}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-brand-red hover:text-white transition-all shadow-md"
                    title="Copy Link"
                >
                    <LinkIcon size={18} />
                </button>
            </div>
        </div>
    );
};

export const BlogPostPage = () => {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.slug === slug);
  
  // URL construction for sharing/schema (Simulated)
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://himalayavitality.com/blog/${slug}`;

  // Process Content: Inject IDs into <h3> tags for TOC navigation
  const { processedContent, toc } = useMemo(() => {
    if (!post) return { processedContent: '', toc: [] };

    let content = post.content;
    const tocItems: { id: string, title: string }[] = [];
    
    // Regex to find h3 tags and inject IDs
    const regex = /<h3>(.*?)<\/h3>/g;
    content = content.replace(regex, (match, title) => {
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        tocItems.push({ id, title });
        return `<h3 id="${id}" class="scroll-mt-32 relative group"><a href="#${id}" class="absolute -left-6 opacity-0 group-hover:opacity-100 text-brand-red transition-opacity">#</a>${title}</h3>`;
    });

    return { processedContent: content, toc: tocItems };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link to="/blog"><Button>Back to Blog</Button></Link>
      </div>
    );
  }

  const readingTime = calculateReadingTime(post.content);

  // Construct Robust Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": [post.image],
    "datePublished": new Date(post.date).toISOString(), // Formatted ISO date
    "dateModified": new Date(post.date).toISOString(), // Assuming modified same as published for now
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Himalaya Vitality",
      "logo": {
        "@type": "ImageObject",
        "url": "https://himalayavitality.com/logo.png"
      }
    },
    "description": post.excerpt,
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": currentUrl
    }
  };

  return (
    <div className="bg-white pb-20">
      <SEO title={post.title} description={post.excerpt} image={post.image} type="article" />
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>
      
      <article>
        {/* Header Section */}
        <div className="bg-brand-dark text-white pt-32 pb-24 relative overflow-hidden mb-12">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            {/* Background blur accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <Container className="relative z-10 max-w-4xl text-center">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <span className="bg-brand-red text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-brand-red/20">{post.category}</span>
                    </div>
                    <h1 className="font-heading text-4xl md:text-6xl font-extrabold mb-8 leading-tight tracking-tight">{post.title}</h1>
                    
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 font-medium bg-white/5 inline-flex px-8 py-4 rounded-2xl backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white font-bold">{post.author.charAt(0)}</div>
                            <span className="text-white">{post.author}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600 hidden sm:block"></div>
                        <div className="flex items-center gap-2"><Calendar size={16} /> {post.date}</div>
                        <div className="w-px h-4 bg-gray-600 hidden sm:block"></div>
                        <div className="flex items-center gap-2"><Clock size={16} /> {readingTime} min read</div>
                    </div>
                </div>
            </Container>
        </div>

        <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
                
                {/* Left: Social Share (Desktop Sticky) */}
                <div className="lg:col-span-1 hidden lg:block h-full">
                     <SocialShare title={post.title} url={currentUrl} />
                </div>

                {/* Center: Content */}
                <div className="lg:col-span-8">
                    <Reveal>
                        {/* Mobile Social Share */}
                        <div className="lg:hidden mb-8 flex justify-center">
                             <div className="flex gap-4">
                                <Facebook className="text-blue-600" />
                                <Twitter className="text-sky-500" />
                                <Linkedin className="text-blue-700" />
                                <Share2 className="text-gray-600" />
                             </div>
                        </div>

                        {/* Article Content */}
                        <div 
                            className="prose prose-lg prose-slate prose-red mx-auto text-gray-600 leading-loose prose-headings:font-heading prose-headings:font-bold prose-headings:text-brand-dark prose-p:mb-6 prose-li:mb-2 prose-img:rounded-3xl prose-img:shadow-xl prose-img:my-8 prose-blockquote:border-l-4 prose-blockquote:border-brand-red prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-brand-dark font-medium" 
                            dangerouslySetInnerHTML={{ __html: processedContent }} 
                        />
                    </Reveal>

                    {/* Post-Footer */}
                    <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <Link to="/blog" className="text-brand-dark font-bold flex items-center hover:text-brand-red transition-colors group">
                            <ArrowRight className="rotate-180 mr-2 group-hover:-translate-x-1 transition-transform" size={20} /> Back to Journal
                        </Link>
                        <div className="flex gap-2">
                             <span className="text-sm font-bold text-gray-500 mr-2 self-center">Share this article:</span>
                             <div className="flex gap-2">
                                <Facebook size={20} className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"/>
                                <Twitter size={20} className="text-gray-400 hover:text-sky-500 cursor-pointer transition-colors"/>
                                <Linkedin size={20} className="text-gray-400 hover:text-blue-700 cursor-pointer transition-colors"/>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right: Table of Contents (Sticky) */}
                <div className="lg:col-span-3 hidden lg:block">
                    {toc.length > 0 && (
                        <div className="sticky top-32 animate-in slide-in-from-right-4 fade-in duration-700">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-4 text-brand-dark font-bold text-sm uppercase tracking-wide border-b border-gray-200 pb-2">
                                    <List size={16} /> Table of Contents
                                </div>
                                <nav className="flex flex-col space-y-3">
                                    {toc.map((item) => (
                                        <a 
                                            key={item.id} 
                                            href={`#${item.id}`}
                                            className="text-sm text-gray-500 hover:text-brand-red transition-colors hover:translate-x-1 duration-200 block border-l-2 border-transparent hover:border-brand-red pl-3"
                                        >
                                            {item.title}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                            
                            {/* Promo Box in Sidebar */}
                            <div className="mt-8 bg-brand-dark text-white p-6 rounded-2xl text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                                <h4 className="font-heading font-bold text-lg mb-2">Boost Your Vitality</h4>
                                <p className="text-xs text-gray-400 mb-4">Experience the power of Himalayan Shilajit today.</p>
                                <Link to="/product/himalaya-shilajit-resin">
                                    <Button size="sm" fullWidth className="bg-brand-red border-none">Shop Now</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
      </article>
    </div>
  );
};
