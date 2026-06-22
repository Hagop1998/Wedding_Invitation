import heroPhoto from '../assets/wedding19.JPG'
import heroLogo from '../assets/LogoHA1.svg'
import invitationPhotoLeft from '../assets/LEFT.jpeg'
import invitationPhotoRight from '../assets/Wedding8.JPG'
import churchPhoto from '../assets/wedding21.jpeg'
import receptionLeftPhoto from '../assets/wedding1.JPG'
import receptionCenterPhoto from '../assets/Wedding6.JPG'
import receptionRightPhoto from '../assets/wedding22.JPG'

export const weddingConfig = {
  groom: 'Hagop',
  bride: 'Ashkhen',
  weddingDate: '2026-08-22T16:00:00',
  displayDate: '22.08.2026',
  rsvpDeadline: '2026-07-31',
  rsvpDeadlineDisplay: '31.07.2026',
  heroLabel: {
    hy: 'Հարսանյաց հրավեր',
    en: 'Wedding Invitation',
  },
  heroLogo,
  heroTagline: {
    hy: 'Մեր հավերժությունը սկսվում է այսօր',
    en: 'Our forever begins today',
  },
  countdownTitle: {
    hy: 'Մնաց',
    en: 'Remaining',
  },
  youtubeMusic: 'https://www.youtube.com/watch?v=_ZKliUdu4T0&list=PL3jBkgkR2PVFt61n5j9m_7TRnj3bPn8cO',
  invitationText: {
    quote: {
      en: '"So they are no longer two, but one flesh. Therefore, what God has joined together, let no one separate."',
    },
    citation: {
      en: 'Matthew 19:6',
    },
  },
  scheduleGallery: [
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1465495976277-038e168e1260?auto=format&fit=crop&w=400&q=80',
  ],
  schedule: [
    {
      title: {
        hy: 'Պսակադրություն',
        en: 'Church Ceremony',
      },
      icon: 'church',
      time: '16:00',
      venue: {
        hy: 'Սուրբ Մարիամ Աստվածածին եկեղեցի',
        en: 'Saint Cross Church',
      },
      venueSub: {
        hy: '',
        en: '',
      },
      address: {
        hy: 'ք․ Երևան, Արմենակյան 225',
        en: 'Yerevan, Komitas Avenue, 64',
      },
      mapUrl:
        'https://yandex.com/maps/org/surb_khach_yekeghetsi/181241766103/?ll=44.524413%2C40.205785&z=16',
      images: [churchPhoto],
    },
    {
      title: {
        hy: 'Հարսանեկան հանդիսություն',
        en: 'Wedding Reception',
      },
      icon: 'cheers',
      time: '17:30',
      venue: {
        hy: 'Lianna Garden Hall',
        en: 'Lianna Garden Hall',
      },
      venueSub: {
        hy: '',
        en: '',
      },
      address: {
        hy: 'Village of Parakar, Eritasardutyun Street, 34',
        en: 'Village of Parakar, Eritasardutyun Street, 34',
      },
      mapUrl:
        'https://yandex.com/maps/org/liana_garden_holl/75872747374/?ll=44.391472%2C40.164666&z=16',
      images: [
        receptionLeftPhoto,
        receptionCenterPhoto,
        receptionRightPhoto,
      ],
    },
  ],
  heroImage: heroPhoto,
  invitationPhotos: {
    left: invitationPhotoLeft,
    right: invitationPhotoRight,
  },
  contactPhones: [
    { name: 'Hagop', phone: '+374 41241911' },
    { name: 'Ashkhen', phone: '+374 41241910' },
  ],
  contactNote: {
    hy: 'Հարցերի դեպքում',
    en: 'For any questions',
  },
  footerText: {
    hy: 'Սիրով սպասում ենք Ձեզ',
    en: 'We are waiting for you with love',
  },
}
