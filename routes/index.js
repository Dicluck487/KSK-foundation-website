const express = require('express');
const router = express.Router();

// ---- Sample content data (swap with a database/CMS later) ----

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

// ---- Controllers ----

const programApplicationController = require('../controllers/programApplicationController');
const { getPublishedGallery, getRecentGalleryPhotos } = require('../controllers/galleryController');
const heroController = require('../controllers/heroController');
const alumniController = require('../controllers/alumniController');
const publicationController = require('../controllers/publicationController');


// ---- Routes ----

// Homepage
router.get('/', async (req, res, next) => {
  try {
    const recentPhotos = await getRecentGalleryPhotos(3);
    const heroImages = await heroController.getPublishedHero();
    const recentAlumni = await alumniController.getRecentAlumni();

    res.render('index', {
      title: 'Welcome',
      description: 'A youth program harnessing the power of peer-to-peer mentorship to nurture the next generation of leaders and entrepreneurs.',
      recentPhotos,
      heroImages,
      latestAlumni: recentAlumni || []
    });

  } catch (error) {
    next(error);
  }
});
// Full gallery page
router.get('/gallery', async (req, res, next) => {
  try {
    const photos = await getPublishedGallery();
    res.render('gallery', { title: 'Gallery', photos });
  } catch (error) {
    next(error);
  }
});

router.get('/who-we-are', (req, res) => {
  res.render('who-we-are', {
    title: 'Who We Are',
    description: 'Learn about our mission, story, and approach to peer-to-peer mentorship.'
  });
});

// Alumni page — 3 most recent show on homepage, everyone older shows here
router.get('/alumni', async (req, res) => {

    try {

        const { data: alumni, error } = await supabase
            .from('alumni')
            .select('*')
            .eq('status', 'published')
            .order('year', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading alumni voices:', error);
            throw error;
        }

        const programs = [
            'Making Students World Ready Program',
            'Kaizen Teen Boot Camp',
            'Financial Services Academy',
            'Scholarships'
        ];

        const years = [
            ...new Set(
                (alumni || [])
                    .map(a => Number(a.year))
                    .filter(year => !isNaN(year))
            )
        ].sort((a, b) => b - a);

        res.render('alumni', {
            alumni: alumni || [],
            years,
            programs
        });

    } catch (error) {

        console.error('Alumni page error:', error);

        res.status(500).send('Unable to load Alumni Voices.');

    }

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

router.get('/publications', async (req, res, next) => {
  try {
    const publications = await publicationController.getPublishedPublications();
    res.render('publications', {
      title: 'Publications',
      description: 'Publications from KSK Foundation.',
      publications
    });
  } catch (error) {
    next(error);
  }
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
  res.render('contact-us', { title: 'Contact KSK Foundation' });
});

router.get('/apply', (req, res) => {
  res.render('apply', {
    title: 'Apply',
    description: 'Apply to join the next mentorship cohort.',
    submitted: false
  });
});

router.post('/apply', programApplicationController.submitApplication);

// =========================================================
// PARTNER WITH US
// =========================================================

router.get('/partner-with-us', (req, res) => {
  res.render('partner-with-us', {
    title: 'Partner With Us',
    description: 'Partner with KSK Foundation to invest in Uganda’s next generation of leaders, innovators and entrepreneurs.'
  });
});

router.get('/partials/newsletter-signup', (req, res) => {
  res.render('partials/newsletter-signup');
});

router.get('/programs', (req, res) => {
  const programNewsEvents = [
    { title: 'MSWRP Graduation', description: 'Celebrating the achievements of young Ugandans.' },
    { title: 'Kaizen Teen Boot Camp', description: 'Empowering young people through skills and mentorship.' },
    { title: 'Financial Services Academy', description: 'Building financial knowledge and leadership skills.' }
  ];
  res.render('programs', { newsEvents: programNewsEvents });
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