const express = require('express');
const router = express.Router();

// ---- Sample content data (swap with a database/CMS later) ----

const impactStats = [
  { number: '400+', label: 'More Employable', text: 'Our focus on continuous personal improvement, teamwork, and interpersonal skills equips mentees with qualities employers look for.' },
  { number: '40+', label: 'Businesses Started', text: 'Our program fosters an entrepreneurial spirit, showing mentees are capable of innovating and driving economic growth.' },
  { number: '150+', label: 'In Leadership Positions', text: 'We take pride in mentees who have gone on to take up leadership roles across different sectors.' },
  { number: '25+', label: 'Cohorts Completed', text: 'Years of running structured, peer-to-peer mentorship cycles for young leaders.' }
];

const testimonials = [
  { name: 'Amina K.', role: 'Alumni, Cohort 8', quote: 'This program pushed me to understand who I am before it ever tried to teach me how to lead.' },
  { name: 'David O.', role: 'Alumni, Cohort 6', quote: 'The peer mentorship model meant I was learning from people just a few steps ahead of me — it made growth feel possible.' },
  { name: 'Grace N.', role: 'Alumni, Cohort 9', quote: 'I started my first small business during my mentorship year. The confidence I built here made that leap easier.' }
];

const teamMembers = [
  { name: 'Program Director', role: 'Director', bio: 'Oversees the mentorship curriculum and cohort operations.' },
  { name: 'Head of Mentorship', role: 'Mentorship Lead', bio: 'Matches mentors and mentees and runs monthly topic sessions.' },
  { name: 'Community & Alumni Lead', role: 'Alumni Relations', bio: 'Keeps the alumni network active and connected to current cohorts.' },
  { name: 'Operations Coordinator', role: 'Operations', bio: 'Manages logistics, partnerships, and events.' }
];

const cohorts = [
  { name: 'Cohort 10', status: 'Applications Open', period: '2026' },
  { name: 'Cohort 9', status: 'Completed', period: '2025' },
  { name: 'Cohort 8', status: 'Completed', period: '2024' }
];

const publications = [
  { title: 'Prospectus 2026', description: 'Program overview, structure, and how to apply.', slug: 'prospectus-2026' },
  { title: 'Magazine 2025', description: 'Highlights, stories, and alumni features from the year.', slug: 'magazine-2025' },
  { title: 'Magazine 2024', description: 'A look back at cohort activities and milestones.', slug: 'magazine-2024' }
];

const newsEvents = [
  { title: 'Cohort 10 Applications Now Open', date: 'August 2026', excerpt: 'We are now accepting applications for the next cohort. Spaces are limited.', image: 'KSK-news1' },
  { title: 'Annual Mentorship Gala Recap', date: 'June 2026', excerpt: 'A look back at this year\'s gala, bringing together mentors, mentees, and alumni.', image: 'KSK-news2' },
  { title: 'Alumni Spotlight: From Mentee To Mentor', date: 'April 2026', excerpt: 'One of our earliest mentees returns as a mentor for the current cohort.', image: 'KSK-news3' }
];

const faqs = [
  { q: 'Who can apply to the program?', a: 'The program is open to young people interested in leadership, personal growth, and entrepreneurship. Specific eligibility details are shared in each cohort\'s application form.' },
  { q: 'Is there a cost to join?', a: 'Fee structures vary by cohort and are detailed in the prospectus and application materials.' },
  { q: 'How long does a cohort run?', a: 'Each cohort typically runs across a defined mentorship cycle built around monthly themes and sessions.' },
  { q: 'How do I become a mentor?', a: 'Reach out via the contact page and our team will walk you through the mentor onboarding process.' }
];

// ---- Routes ----

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Welcome',
    description: 'A youth program harnessing the power of peer-to-peer mentorship to nurture the next generation of leaders and entrepreneurs.',
    impactStats,
    testimonials
  });
});

router.get('/who-we-are', (req, res) => {
  res.render('who-we-are', {
    title: 'Who We Are',
    description: 'Learn about our mission, story, and approach to peer-to-peer mentorship.'
  });
});

router.get('/alumni', (req, res) => {
  res.render('alumni', {
    title: 'Alumni',
    description: 'Meet mentees who have gone through the program and are ready to share, learn, and support.',
    testimonials
  });
});

router.get('/our-team', (req, res) => {
  res.render('our-team', {
    title: 'Our Team',
    description: 'The team behind the mentoring and coaching.',
    teamMembers
  });
});

router.get('/cohorts', (req, res) => {
  res.render('cohorts', {
    title: 'Cohort',
    description: 'Current and past mentorship cohorts.',
    cohorts
  });
});

router.get('/publications', (req, res) => {
  res.render('publications', {
    title: 'Publications',
    description: 'Prospectuses and magazines published by the program.',
    publications
  });
});

router.get('/publications/:slug', (req, res, next) => {
  const pub = publications.find(p => p.slug === req.params.slug);
  if (!pub) return next();
  res.render('publication-detail', {
    title: pub.title,
    description: pub.description,
    publication: pub
  });
});

router.get('/news-events', (req, res) => {
  res.render('news-events', {
    title: 'News & Events',
    description: 'Latest news, stories, and events from the mentorship program.',
    newsEvents
  });
});

router.get('/terms-conditions', (req, res) => {
  res.render('terms-conditions', {
    title: 'Terms & Conditions',
    description: 'Terms and conditions for using this website and program.'
  });
});

router.get('/faqs', (req, res) => {
  res.render('faqs', {
    title: 'FAQs',
    description: 'Frequently asked questions about the mentorship program.',
    faqs
  });
});

router.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', {
    title: 'Privacy Policy',
    description: 'How we handle your data.'
  });
});

router.get('/contact-us', (req, res) => {
  res.render('contact-us', {
    title: 'Contact Us',
    description: 'Get in touch with the mentorship program team.',
    submitted: false
  });
});

router.post('/contact-us', (req, res) => {
  const { name, email, message } = req.body;
  // TODO: wire this up to an email service or database
  console.log('New contact form submission:', { name, email, message });
  res.render('contact-us', {
    title: 'Contact Us',
    description: 'Get in touch with the mentorship program team.',
    submitted: true
  });
});

router.get('/apply', (req, res) => {
  res.render('apply', {
    title: 'Apply',
    description: 'Apply to join the next mentorship cohort.',
    submitted: false
  });
});

router.post('/apply', (req, res) => {
  const { name, email, phone, motivation } = req.body;
  console.log('New application submission:', { name, email, phone, motivation });
  res.render('apply', {
    title: 'Apply',
    description: 'Apply to join the next mentorship cohort.',
    submitted: true
  });
});

module.exports = router;
