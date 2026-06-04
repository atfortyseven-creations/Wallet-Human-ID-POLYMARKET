import React from 'react';
import Link from 'next/link';

export default function ForumBadgesPage() {
  const BADGES = {
    'Getting Started': [
      { name: 'Autobiographer', desc: 'Filled out profile information', awarded: '180', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Certified', desc: 'Completed our new user tutorial', awarded: '294', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Editor', desc: 'First post edit', awarded: '122', color: '#050505', bg: 'bg-slate-100' },
      { name: 'First Emoji', desc: 'Used an Emoji in a Post', awarded: '98', color: '#050505', bg: 'bg-slate-100' },
      { name: 'First Flag', desc: 'Flagged a post', awarded: '4', color: '#050505', bg: 'bg-slate-100' },
      { name: 'First Like', desc: 'Liked a post', awarded: '1.9k', color: '#050505', bg: 'bg-slate-100' },
      { name: 'First Link', desc: 'Added a link to another topic', awarded: '95', color: '#050505', bg: 'bg-slate-100' },
      { name: 'First Mention', desc: 'Mentioned a user in a post', awarded: '87', color: '#050505', bg: 'bg-slate-100' },
      { name: 'First Onebox', desc: 'Posted a link that was oneboxed', awarded: '65', color: '#050505', bg: 'bg-slate-100' },
      { name: 'First Quote', desc: 'Quoted a post', awarded: '87', color: '#050505', bg: 'bg-slate-100' },
      { name: 'First Reaction', desc: 'Reacted to the post', awarded: '', color: '#050505', bg: 'bg-slate-100' },
      { name: 'First Reply By Email', desc: 'Replied to a post via email', awarded: '4', color: '#050505', bg: 'bg-slate-100' },
      { name: 'First Share', desc: 'Shared a post', awarded: '90', color: '#050505', bg: 'bg-slate-100' },
      { name: 'New User of the Month', desc: 'Outstanding contributions in their first month', awarded: '33', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Read Guidelines', desc: 'Read the community guidelines', awarded: '195', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Reader', desc: 'Read every reply in a topic with more than 100 replies', awarded: '', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Wiki Editor', desc: 'First wiki edit', awarded: '', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Licensed', desc: 'Completed our advanced user tutorial', awarded: '4', color: '#050505', bg: 'bg-slate-100' },
    ],
    'Community': [
      { name: 'Appreciated', desc: 'Received 1 like on 20 posts', awarded: '11', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Enthusiast', desc: 'Visited 10 consecutive days', awarded: '144', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Nice Share', desc: 'Shared a post with 25 unique visitors', awarded: '11', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Out of Love', desc: 'Used 50 likes in a day', awarded: '22', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Promoter', desc: 'Invited a user', awarded: '', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Thank You', desc: 'Has 20 liked posts and gave 10 likes', awarded: '9', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Welcome', desc: 'Received a like', awarded: '403', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Aficionado', desc: 'Visited 100 consecutive days', awarded: '2', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Anniversary', desc: 'Active member for a year, posted at least once', awarded: '343', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Campaigner', desc: 'Invited 3 basic users', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Gives Back', desc: 'Has 100 liked posts and gave 100 likes', awarded: '1', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Good Share', desc: 'Shared a post with 300 unique visitors', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Higher Love', desc: 'Used 50 likes in a day 5 times', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Respected', desc: 'Received 2 likes on 100 posts', awarded: '1', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Admired', desc: 'Received 5 likes on 300 posts', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Champion', desc: 'Invited 5 members', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Crazy in Love', desc: 'Used 50 likes in a day 20 times', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Devotee', desc: 'Visited 365 consecutive days', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Empathetic', desc: 'Has 500 liked posts and gave 1000 likes', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Great Share', desc: 'Shared a post with 1000 unique visitors', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
    ],
    'Posting': [
      { name: 'Nice Reply', desc: 'Received 10 likes on a reply', awarded: '616', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Nice Topic', desc: 'Received 10 likes on a topic', awarded: '215', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Popular Link', desc: 'Posted an external link with 50 clicks', awarded: '10', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Good Reply', desc: 'Received 25 likes on a reply', awarded: '418', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Good Topic', desc: 'Received 25 likes on a topic', awarded: '181', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Hot Link', desc: 'Posted an external link with 300 clicks', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Famous Link', desc: 'Posted an external link with 1000 clicks', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Great Reply', desc: 'Received 50 likes on a reply', awarded: '245', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Great Topic', desc: 'Received 50 likes on a topic', awarded: '133', color: '#D4AF37', bg: 'bg-amber-50' },
    ],
    'Trust Level': [
      { name: 'Basic', desc: 'Granted all essential community functions', awarded: '1.4k', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Member', desc: 'Granted invitations, group messaging, more likes', awarded: '75', color: '#050505', bg: 'bg-slate-100' },
      { name: 'Regular', desc: 'Granted recategorize, rename, followed links, wiki, more likes', awarded: '23', color: '#D4AF37', bg: 'bg-amber-50' },
      { name: 'Leader', desc: 'Granted global edit, pin, close, archive, split and merge, more likes', awarded: '', color: '#D4AF37', bg: 'bg-amber-50' },
    ]
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAF9] text-slate-900 w-full min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-[12px] font-sans font-bold text-slate-500">
            <Link href="/forum" className="transition-colors hover:text-[#0088cc]">Forum</Link>
            <span>/</span>
            <span className="text-slate-900">Badges</span>
          </div>
        </div>

        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-[28px] md:text-[36px] font-black tracking-tight text-slate-900 leading-none mb-2">Badges</h1>
            <p className="text-[14px] text-slate-500 font-medium max-w-2xl">
              Badges are awarded for participation and contributions in the community. Read the descriptions below to see how to earn them.
            </p>
          </div>
        </div>

        {Object.entries(BADGES).map(([category, badges]) => (
          <div key={category} className="mb-12">
            <h2 className="text-[14px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-200 pb-2">
              {category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {badges.map(b => (
                <div key={b.name} className="flex flex-col p-5 rounded-xl border border-slate-200 bg-white hover:border-[#0088cc] hover:shadow-sm transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${b.bg} flex items-center justify-center shrink-0`}>
                        <svg className="w-4 h-4" style={{ color: b.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="7"></circle>
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                        </svg>
                      </div>
                      <h3 className="font-bold text-[15px] text-slate-900 group-hover:text-[#0088cc] transition-colors">{b.name}</h3>
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-4 flex-1">
                    {b.desc}
                  </p>
                  {b.awarded && (
                    <div className="text-[12px] font-medium text-slate-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      {b.awarded} awarded
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
