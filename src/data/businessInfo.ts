export const businessInfo = {
  name: 'Punjabi Fashion',
  type: 'South Asian clothing store / Punjabi clothing boutique',
  shortType: 'South Asian clothing store',
  address: {
    street: '80 Pertosa Dr Unit #10',
    city: 'Brampton',
    province: 'ON',
    provinceName: 'Ontario',
    postalCode: 'L6X 5E9',
    country: 'Canada',
    full: '80 Pertosa Dr Unit #10, Brampton, ON L6X 5E9, Canada',
    short: '80 Pertosa Dr Unit #10, Brampton, ON L6X 5E9',
  },
  phone: {
    display: '(905) 452-0155',
    href: 'tel:+19054520155',
    raw: '+19054520155',
  },
  email: 'info@punjabifashion.ca',
  hours: [
    { day: 'Monday', open: '11:30 AM', close: '8:00 PM' },
    { day: 'Tuesday', open: '11:30 AM', close: '8:00 PM' },
    { day: 'Wednesday', open: '11:30 AM', close: '8:00 PM' },
    { day: 'Thursday', open: '11:30 AM', close: '8:00 PM' },
    { day: 'Friday', open: '11:30 AM', close: '8:00 PM' },
    { day: 'Saturday', open: '11:30 AM', close: '8:00 PM' },
    { day: 'Sunday', open: '11:30 AM', close: '8:00 PM' },
  ],
  hoursDisplay: '11:30 AM – 8:00 PM daily',
  description:
    'At Punjabi Fashion in Brampton, we bring you Punjabi and South Asian garments tailored for elegance. From festive lehengas to daily wear suits, we celebrate heritage with every piece. Discover timeless style and warm, personalized care.',
  shortDescription:
    'Punjabi Fashion is a Brampton South Asian clothing boutique offering Punjabi suits, lehengas, party wear, shararas, men’s wear, kids’ outfits, jewelry, and accessories.',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=80%20Pertosa%20Dr%20Unit%2010%20Brampton%20ON%20L6X%205E9',
};

export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: businessInfo.name,
  url: 'https://punjabifashion.ca',
  description: businessInfo.description,
  telephone: businessInfo.phone.raw,
  address: {
    '@type': 'PostalAddress',
    streetAddress: businessInfo.address.street,
    addressLocality: businessInfo.address.city,
    addressRegion: businessInfo.address.province,
    postalCode: businessInfo.address.postalCode,
    addressCountry: 'CA',
  },
  openingHoursSpecification: businessInfo.hours.map((hour) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: hour.day,
    opens: '11:30',
    closes: '20:00',
  })),
};
