import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Contact | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'} - Contactați-ne`,
  description: `Contactați echipa ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'} pentru întrebări, sugestii sau notificări legale. Suntem aici să vă ajutăm și să răspundem la toate solicitările dumneavoastră.`,
  alternates: {
    canonical: `${process.env.SITE_URL || 'https://HentaiUnited.ro'}/contact`
  },
  openGraph: {
    title: `Contact | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'}`,
    description: `Contactați echipa ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited'} pentru întrebări, sugestii sau notificări legale. Suntem aici să vă ajutăm.`,
    url: `${process.env.SITE_URL || 'https://HentaiUnited.ro'}/contact`,
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

const ContactUsPage: React.FC = () => {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Contact Us / Contactați-ne</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>English Version</h2>
        <p>
          If you have any inquiries, require further information about our services, or need to submit legal notices or other official correspondence, please do not hesitate to reach out to us. Our dedicated team is committed to providing prompt and professional responses to all valid communications.
        </p>
        <p>
          The information provided on this page is offered solely for informational purposes and does not create an attorney–client relationship. For legal advice or specific concerns regarding intellectual property or contractual matters, please consult a qualified legal professional.
        </p>
        <p>
          You may contact us using the details below:
        </p>
        <ul>
          <li><strong>Email:</strong> {process.env.NEXT_PUBLIC_CONTACT_EMAIL || `contact@${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited').toLowerCase()}.ro`}</li>
        </ul>
        <p>
          We appreciate your interest in our services and value your feedback. All communications will be handled in strict confidence and in accordance with our privacy policies.
        </p>
      </section>
      
      <hr style={{ margin: '40px 0' }} />
      
      <section>
        <h2>Versiunea în limba română</h2>
        <p>
          Dacă aveți întrebări, aveți nevoie de informații suplimentare despre serviciile noastre sau doriți să trimiteți notificări legale sau alte corespondențe oficiale, vă rugăm să nu ezitați să ne contactați. Echipa noastră dedicată se angajează să răspundă prompt și profesionist la toate comunicările justificate.
        </p>
        <p>
          Informațiile furnizate pe această pagină sunt oferite exclusiv în scop informativ și nu constituie o relație de consiliere juridică. Pentru consultanță juridică sau preocupări specifice legate de proprietatea intelectuală sau alte aspecte contractuale, vă rugăm să apelați la un specialist în drept.
        </p>
        <p>
          Ne puteți contacta utilizând următoarele detalii:
        </p>
        <ul>
          <li><strong>Email:</strong> contact@{(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited').toLowerCase()}.ro</li>

        </ul>
        <p>
          Apreciem interesul acordat serviciilor noastre și valorificăm feedback-ul dumneavoastră. Toate comunicările vor fi tratate cu cea mai mare confidențialitate și în conformitate cu politicile noastre de confidențialitate.
        </p>
      </section>
    </div>
  );
};

export default ContactUsPage;
