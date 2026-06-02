import { JobApplication } from './types';

// Let's create exactly 47 jobs to simulate a mature job tracker.
// 15 APPLIED (Pending Response), 8 INTERVIEW, 1 OFFER, 23 REJECTED.

const customJobs: JobApplication[] = [
  // 1 Offer
  {
    id: 'offer-1',
    company: 'Swiggy',
    role: 'Junior Full Stack Engineer',
    source: 'LinkedIn',
    date_applied: '2026-05-12',
    status: 'OFFER',
    notes: 'Cleared 3 interview rounds! Offered base compensation of ₹12 LPA with equity options. Reviewing offer letter terms.'
  },

  // 8 Interviews
  {
    id: 'int-1',
    company: 'TCS Digital',
    role: 'Junior Django Developer',
    source: 'Naukri',
    date_applied: '2026-05-28',
    status: 'INTERVIEW',
    notes: 'HR Priya scheduled an interview on June 5th, 2pm via Google Meet. Topics to prepare: Django ORM, REST APIs.'
  },
  {
    id: 'int-2',
    company: 'Google',
    role: 'Frontend Associate',
    source: 'LinkedIn',
    date_applied: '2026-05-22',
    status: 'INTERVIEW',
    notes: 'Completed technical phone screen. Virtual on-site scheduled. Prepping React optimization & data structures.'
  },
  {
    id: 'int-3',
    company: 'Razorpay',
    role: 'Django Backend Intern',
    source: 'Naukri',
    date_applied: '2026-05-24',
    status: 'INTERVIEW',
    notes: 'Passed the HackerRank coding test. Technical Round 2 scheduled Next Monday. Prepare transactional isolation and payment API modeling.'
  },
  {
    id: 'int-4',
    company: 'Paytm',
    role: 'Software Engineer I',
    source: 'Indeed',
    date_applied: '2026-05-19',
    status: 'INTERVIEW',
    notes: 'Initial HR screening cleared. Next step: live programming challenge focusing on SQL DB optimization and custom indexing.'
  },
  {
    id: 'int-5',
    company: 'Zomato',
    role: 'Junior SDE (Backend)',
    source: 'Referral',
    date_applied: '2026-05-20',
    status: 'INTERVIEW',
    notes: 'Passed the machine coding round. System Design round coming up. Prepping Redis caching layer and API rate limit logic.'
  },
  {
    id: 'int-6',
    company: 'Zepto',
    role: 'Backend Developer',
    source: 'LinkedIn',
    date_applied: '2026-05-25',
    status: 'INTERVIEW',
    notes: 'Live pair programming session with a Senior Software Engineer. Prepping REST API concurrency handling and Celery task queues.'
  },
  {
    id: 'int-7',
    company: 'Cred',
    role: 'Software Engineer Associate',
    source: 'Careers Site',
    date_applied: '2026-05-18',
    status: 'INTERVIEW',
    notes: 'Completed the machine coding assignment (credit ledger service). Waiting for review schedule from the coordinator.'
  },
  {
    id: 'int-8',
    company: 'Nykaa',
    role: 'Django & React Developer',
    source: 'LinkedIn',
    date_applied: '2026-05-26',
    status: 'INTERVIEW',
    notes: 'Interviewer Priya asked about React/Django integration. Ready to showcase this JobTracker project in the next technical panel!'
  },

  // 15 Applied (Pending Responses)
  {
    id: 'app-1',
    company: 'Microsoft',
    role: 'Software Engineer',
    source: 'Careers Site',
    date_applied: '2026-05-29',
    status: 'APPLIED',
    notes: 'Applied via portal with a warm employee referral. Status: Under Review.'
  },
  {
    id: 'app-2',
    company: 'Cognizant',
    role: 'Programmer Analyst',
    source: 'Indeed',
    date_applied: '2026-05-28',
    status: 'APPLIED',
    notes: 'Applied via Indeed. Email auto-acknowledgment received.'
  },
  {
    id: 'app-3',
    company: 'Infosys',
    role: 'System Engineer',
    source: 'Naukri',
    date_applied: '2026-05-28',
    status: 'APPLIED',
    notes: 'Applied on Naukri. Profile viewed by recruiter 2 hours ago.'
  },
  {
    id: 'app-4',
    company: 'Wipro',
    role: 'Project Engineer',
    source: 'LinkedIn',
    date_applied: '2026-05-27',
    status: 'APPLIED',
    notes: 'Applied via LinkedIn Easy Apply. Fast response expected within 1 week.'
  },
  {
    id: 'app-5',
    company: 'Accenture',
    role: 'Application Developer',
    source: 'Naukri',
    date_applied: '2026-05-27',
    status: 'APPLIED',
    notes: 'Submitted resume via Naukri portal listing. Experience levels match criteria.'
  },
  {
    id: 'app-6',
    company: 'Capgemini',
    role: 'Software Associate',
    source: 'Indeed',
    date_applied: '2026-05-26',
    status: 'APPLIED',
    notes: 'Applied online. Automated profiling sequence completed.'
  },
  {
    id: 'app-7',
    company: 'Dell Technologies',
    role: 'Graduate SDE',
    source: 'LinkedIn',
    date_applied: '2026-05-25',
    status: 'APPLIED',
    notes: 'Applied via company LinkedIn page. Status: Application Received.'
  },
  {
    id: 'app-8',
    company: 'HP Enterprise',
    role: 'Systems Developer',
    source: 'Naukri',
    date_applied: '2026-05-24',
    status: 'APPLIED',
    notes: 'Profile sent for review in technical department.'
  },
  {
    id: 'app-9',
    company: 'HCLTech',
    role: 'Software Intern',
    source: 'LinkedIn',
    date_applied: '2026-05-24',
    status: 'APPLIED',
    notes: 'Sourced from recruiter post. Waiting for email test link.'
  },
  {
    id: 'app-10',
    company: 'Tech Mahindra',
    role: 'Developer (Python)',
    source: 'Indeed',
    date_applied: '2026-05-23',
    status: 'APPLIED',
    notes: 'Applied via Indeed. Sourced via Django keyword search.'
  },
  {
    id: 'app-11',
    company: 'Oracle India',
    role: 'Associate SDE - Cloud',
    source: 'Referral',
    date_applied: '2026-05-22',
    status: 'APPLIED',
    notes: 'Referred by senior. Application visible on internal dashboard.'
  },
  {
    id: 'app-12',
    company: 'Cisco',
    role: 'Network Software Engineer',
    source: 'Careers Site',
    date_applied: '2026-05-21',
    status: 'APPLIED',
    notes: 'Applied directly on Cisco Jobs portal.'
  },
  {
    id: 'app-13',
    company: 'Atlassian',
    role: 'Junior Django Engineer',
    source: 'LinkedIn',
    date_applied: '2026-05-20',
    status: 'APPLIED',
    notes: 'Applied through LinkedIn promotion. Custom cover letter uploaded.'
  },
  {
    id: 'app-14',
    company: 'PhonePe',
    role: 'Backend SDE',
    source: 'LinkedIn',
    date_applied: '2026-05-19',
    status: 'APPLIED',
    notes: 'Application submitted. Highlighted my Django JWT authentication setups.'
  },
  {
    id: 'app-15',
    company: 'JPMorgan Chase',
    role: 'Software Engineer Program',
    source: 'Indeed',
    date_applied: '2026-05-18',
    status: 'APPLIED',
    notes: 'Indeed application. Expecting HackerRank assessment link.'
  }
];

// Let's programmatically generate 23 Rejected applications to avoid bloated code, 
// yet keep the exact count and highly realistic descriptions!
const rejectionCompanies = [
  { name: 'Meta', role: 'Software Engineer Intern', source: 'Careers Site', note: 'Passed technical screens but team allocation filled up. Keep in touch.' },
  { name: 'Netflix', role: 'Backend Engineer', source: 'LinkedIn', note: 'Asked about deployment experience on AWS/Kubernetes — prepare Cloud/DevOps topics better next time.' },
  { name: 'Amazon', role: 'SDE 1', source: 'Referral', note: 'Passed the Online Assessment. Got rejected after the virtual on-site coding round. Study graphs and trees.' },
  { name: 'Stripe', role: 'Full Stack Engineer', source: 'Referral', note: 'Warm intro. Failed at API design round. Need to study robust rate limit strategies and REST standards.' },
  { name: 'Salesforce', role: 'Associate Developer', source: 'Indeed', note: 'Hiring freeze initiated for new graduate roles. Application withdrawn.' },
  { name: 'Adobe', role: 'Graduate Engineer', source: 'Naukri', note: 'Experience level was set for 1+ years. Recruiter filtered out resume.' },
  { name: 'Intel', role: 'Firmware Analyst', source: 'LinkedIn', note: 'Role canceled due to internal re-allocation.' },
  { name: 'Snap Inc.', role: 'Backend Intern', source: 'Careers Site', note: 'Automated rejection response after 4 weeks of pending review.' },
  { name: 'Uber', role: 'SDE-1', source: 'Referral', note: 'Passed LDT round, but rejected in L2 system design interview. Improve system scaling notes.' },
  { name: 'Slack', role: 'Frontend Engineer', source: 'LinkedIn', note: 'Not moving forward with immediate screening. Keep profile in talent pool.' },
  { name: 'Pinterest', role: 'Backend Dev', source: 'LinkedIn', note: 'Position closed before scheduling interviews.' },
  { name: 'MongoDB', role: 'Associate Solutions SDE', source: 'Indeed', note: 'Completed technical query assignment but solution was not optimal. Study indexing.' },
  { name: 'HubSpot', role: 'Django Associate', source: 'Naukri', note: 'Passed recruiter round. Coding task failed to handle edge cases properly.' },
  { name: 'Shopify', role: 'SDE-1 Intern', source: 'Indeed', note: 'Fast automated feedback. Moving ahead with other candidates who have React 19 experience.' },
  { name: 'GitHub', role: 'SDE 1', source: 'Referral', note: 'Did not match preferred skills (Ruby on Rails). Keep applying to Python/Django roles.' },
  { name: 'Coinbase', role: 'Associate Backend Engineer', source: 'LinkedIn', note: 'Hiring criteria modified mid-loop. Minimum 2 years commercial experience needed.' },
  { name: 'Zoom', role: 'Junior Web Dev', source: 'Naukri', note: 'No contact after initial application. Recruiter archived application.' },
  { name: 'Flipkart', role: 'SDE Junior', source: 'Referral', note: 'Failed round 1 data structures. Revise dynamic programming and arrays.' },
  { name: 'Freshworks', role: 'SDE-1 Python', source: 'LinkedIn', note: 'Resume rejected at initial screening.' },
  { name: 'BYJUS', role: 'Academic Developer', source: 'Indeed', note: 'Role closed due to restructuring.' },
  { name: 'Meesho', role: 'Frontend Engineer', source: 'Careers Site', note: 'Did not match criteria for full-stack deployment experience. Strengthen project portfolio.' },
  { name: 'Twilio', role: 'Backend Developer I', source: 'LinkedIn', note: 'Failed live Python algorithm test. Focus on sorting algorithms.' },
  { name: 'Unacademy', role: 'Backend Associate', source: 'Naukri', note: 'Passed first round. Team lead selected a candidate with pre-existing Vue experience.' }
];

const generatedRejections: JobApplication[] = rejectionCompanies.map((c, idx) => ({
  id: `rej-${idx + 1}`,
  company: c.name,
  role: c.role,
  source: c.source,
  date_applied: `2026-05-${Math.max(1, 20 - idx).toString().padStart(2, '0')}`,
  status: 'REJECTED',
  notes: c.note
}));

// Combine them to form exactly 47 entries.
// 1 Offer + 8 Interview + 15 Applied + 23 Rejected = 47.
export const INITIAL_APPLICATIONS: JobApplication[] = [
  ...customJobs,
  ...generatedRejections
];
