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
  {
    title: 'FOCUS Magazine — Current Issue',
    type: 'FOCUS Magazine',
    year: '2026',
    description: 'The latest issue of FOCUS Magazine from KSK Foundation.',
    slug: 'focus-magazine-2026',
    image: 'focus-2026.jpg'
  },

  {
    title: 'FOCUS Magazine — 2025',
    type: 'FOCUS Magazine',
    year: '2025',
    description: 'Stories, achievements and highlights from KSK Foundation.',
    slug: 'focus-magazine-2025',
    image: 'focus-2025.jpg'
  },

  {
    title: 'Year in Review — 2025',
    type: 'Annual Highlights',
    year: '2025',
    description: 'A celebration of KSK Foundation’s programs, cohorts and achievements.',
    slug: 'year-in-review-2025',
    image: 'year-review-2025.jpg'
  }
];

const newsEvents = [
  { title: 'Cohort 10 Applications Now Open', date: 'August 2026', excerpt: 'We are now accepting applications for the next cohort. Spaces are limited.', image: 'KSK-news1' },
  { title: 'Annual Mentorship Gala Recap', date: 'June 2026', excerpt: 'A look back at this year\'s gala, bringing together mentors, mentees, and alumni.', image: 'KSK-news2' },
  { title: 'Alumni Spotlight: From Mentee To Mentor', date: 'April 2026', excerpt: 'One of our earliest mentees returns as a mentor for the current cohort.', image: 'KSK-news3' }
];

const faq = [
  {
    q: 'How do I apply to a program?',
    a: 'Applications open on a rolling basis ahead of each program’s intake window. Secondary schools may nominate S6 leavers for the Making Students World Ready Program (MSWRP), while families can apply directly for Kaizen Teen Boot Camp. Please contact KSK Foundation to confirm the exact application process and any available application form before applying.'
  },

  {
    q: 'Is there a cost to participate?',
    a: 'Participation costs, sponsorship arrangements and any need-based waivers vary by program. Please contact KSK Foundation for the most current information about fees and available support before applying.'
  },

  {
    q: 'How can my organization sponsor a program?',
    a: 'Visit our Partner With Us page to learn about sponsorship opportunities, or contact us directly to discuss a partnership tailored to your organization’s interests.'
  },

  {
    q: 'How do I apply for a KSK Foundation scholarship?',
    a: 'KSK Foundation scholarship beneficiaries are identified through school nominations rather than applying directly for the scholarships. Please contact the Foundation if you would like to learn more about the scholarship partnerships and selection process.'
  },

  {
    q: 'Where can I read FOCUS Magazine?',
    a: 'Current and past digital issues of FOCUS Magazine are available on our Publications page as they become available. Hard-copy issues are available for UGX 20,000, subject to availability.'
  }
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

router.get('/faq', (req, res) => {
  res.render('faq', {
    title: 'FAQ',
    description: 'Frequently asked questions about the mentorship program.',
    faq
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
    description: 'Get in touch with KSK Foundation.',
    submitted: false
  });

});

router.post('/contact-us', (req, res) => {

  const {
    name,
    email,
    organization,
    reason,
    message
  } = req.body;


  console.log('New contact form submission:', {
    name,
    email,
    organization,
    reason,
    message
  });


  res.render('contact-us', {

    title: 'Contact Us',

    description:
      'Get in touch with KSK Foundation.',

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


// =========================================================
// PARTNER WITH US
// =========================================================

router.get('/partner-with-us', (req, res) => {
  res.render('partner-with-us', {
    title: 'Partner With Us',
    description: 'Partner with KSK Foundation to invest in Uganda’s next generation of leaders, innovators and entrepreneurs.'
  });
});


// =========================================================
// LEADERSHIP
// =========================================================

router.get('/leadership', (req, res) => {
  res.render('leadership', {
    title: 'Leadership',
    description: 'Meet the leadership and governance community guiding KSK Foundation.'
  });
});

module.exports = router;
