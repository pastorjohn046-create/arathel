import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote, User } from 'lucide-react';
import { Card } from '../ui/Card';

const REVIEWS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Institutional Trader',
    text: 'Arathel Network has completely transformed my workflow. The institutional-grade tools and real-time data are unparalleled in the market.',
    rating: 5,
    avatar: 'https://picsum.photos/seed/sarah/100/100'
  },
  {
    id: 2,
    name: 'David Chen',
    role: 'Portfolio Manager',
    text: 'The security and reliability of this platform are what keep me coming back. I trust Arathel with my most significant assets.',
    rating: 5,
    avatar: 'https://picsum.photos/seed/david/100/100'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Retail Investor',
    text: 'I love the user interface. It makes complex trading decisions feel simple and intuitive. The P/L tracking is a game-changer.',
    rating: 4,
    avatar: 'https://picsum.photos/seed/emily/100/100'
  },
  {
    id: 4,
    name: 'Michael Thompson',
    role: 'Crypto Analyst',
    text: 'The integration of traditional stocks and digital assets is seamless. Arathel is the future of multi-asset trading.',
    rating: 5,
    avatar: 'https://picsum.photos/seed/michael/100/100'
  }
];

export const Reviews = () => {
  return (
    <section className="py-20 bg-surface/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-ink mb-4 tracking-tighter uppercase">
            Trusted by <span className="text-brand">Global Investors</span>
          </h2>
          <p className="text-ink-muted max-w-2xl mx-auto font-medium">
            Join over 500,000 traders worldwide who rely on Arathel Network for their daily trading and investment needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full flex flex-col p-8 hover:border-brand/30 transition-all group">
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? 'text-brand fill-brand' : 'text-border'}
                    />
                  ))}
                </div>
                
                <div className="flex-grow relative">
                  <Quote className="absolute -top-4 -left-4 text-brand/10" size={48} />
                  <p className="text-sm text-ink leading-relaxed font-medium mb-8 relative z-10">
                    "{review.text}"
                  </p>
                </div>

                <div className="flex items-center space-x-4 pt-6 border-t border-border mt-auto">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-surface">
                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink leading-none mb-1">{review.name}</h4>
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{review.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
