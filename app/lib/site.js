// Single source of truth for links, donate rails and team.
// Update here + content/*.md together so site and Leaderboard match.

export const site = {
  name: 'Bitcoin Kisumu',
  tagline: 'Free, open-source Bitcoin education for Kisumu, Kenya.',
  locale: 'Kisumu • Lake Victoria • Kenya',
  networkUrl: 'https://network.myfirstbitcoin.org/community/bitcoin-kisumu',
  email: 'bitcoinkisumu@gmail.com',
  lightningAddress: 'bitcoinkisumu@blink.sv',
  geyserUrl: '', // TODO: e.g. https://geyser.fund/project/bitcoinkisumu
  socials: [
    { label: 'X', href: '' },
    { label: 'Nostr', href: '' },
    { label: 'Telegram', href: '' },
    { label: 'WhatsApp', href: '' },
    { label: 'YouTube', href: '' },
    { label: 'GitHub', href: 'https://github.com/altradits/bitcoin-kisumu' }
  ]
};

export const team = [
  {
    name: 'Stanley',
    role: 'Community Lead',
    bio: 'Strategy, partnerships and lead educator. Founded Bitcoin Kisumu to bring practical Bitcoin knowledge to the lake region.',
    photo: ''
  },
  {
    name: 'Ivy',
    role: 'Education Coordinator',
    bio: 'Cohorts, curriculum and student support. Makes sure every learner finishes with a working wallet and real understanding.',
    photo: ''
  }
];

export const events = [
  {
    id: 'meetup-001',
    title: 'Kisumu Bitcoin Meetup — Intro Night',
    date: 'First Thursday of the month, 17:30 EAT',
    venue: 'Kisumu CBD (venue announced on socials)',
    blurb: 'Open beginner night: what Bitcoin is, live wallet setup, Q&A. No laptop needed.',
    capacity: 60
  },
  {
    id: 'workshop-wallet',
    title: 'First Wallet Workshop',
    date: 'Monthly, Saturday 10:00 EAT',
    venue: 'Community hall, Kisumu',
    blurb: 'Hands-on: install a wallet, back up seed words, send and receive on Lightning testnet.',
    capacity: 30
  },
  {
    id: 'cohort-01',
    title: 'Bitcoin Diploma Cohort 1',
    date: '8–10 weeks, applications open',
    venue: 'Hybrid — in person + study group',
    blurb: 'Full My First Bitcoin curriculum with trained educators. Free, graduation certified.',
    capacity: 40
  }
];

export function configuredSocials() {
  return site.socials.filter((s) => s.href);
}
