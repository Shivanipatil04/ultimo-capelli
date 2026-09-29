import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';
import Link from 'next/link';
import MagneticButton from '@/components/MagneticButton';

export const metadata = {
  title: 'Our Services | Ultimo Capelli',
  description: 'Explore our bespoke non-surgical hair restoration services including Hair Patches, Hair Wigs, and Maintenance.',
};

export default async function ServicesPage() {
  await dbConnect();
  // Fetch active services
  const services = await Service.find({ isActive: true }).sort({ sortOrder: 1 }).lean();

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 bg-surface text-on-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
          <div className="mb-8 md:mb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group">
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span className="font-label-lg uppercase tracking-wider text-sm font-semibold">Back to Home</span>
            </Link>
          </div>
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="font-display-lg text-[40px] md:text-display-lg mb-6">Our Services</h1>
            <p className="font-body-lg text-on-surface-variant">
              Discover the pinnacle of bespoke hair restoration. Each of our services is precision-engineered to provide complete discretion, natural movement, and unshakeable confidence.
            </p>
          </div>

          <div className="space-y-16 lg:space-y-24">
            {services.map((service: any, index: number) => (
              <section 
                key={service._id} 
                id={service.slug}
                className="scroll-mt-32 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
              >
                <div className={`flex justify-center ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                  {service.image ? (
                    <img src={service.image} alt={service.title} className="w-full max-w-md aspect-square object-cover rounded-2xl shadow-soft" />
                  ) : (
                    <div className="w-full max-w-md aspect-square bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/30 shadow-soft">
                      <span className="material-symbols-outlined text-[120px] text-primary/20">
                        {service.icon}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className={index % 2 !== 0 ? 'lg:order-1' : ''}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-6">
                    <span className="material-symbols-outlined text-sm">{service.icon}</span>
                    <span className="font-label-md uppercase tracking-wider">{service.title}</span>
                  </div>
                  <h2 className="font-headline-lg text-3xl md:text-4xl font-bold mb-6">{service.title}</h2>
                  <p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <Link href="/#contact">
                    <MagneticButton className="bg-primary text-on-primary px-8 py-4 font-label-lg uppercase tracking-widest rounded-lg shadow-card hover:bg-primary/90 transition-all font-bold">
                      Book a Consultation
                    </MagneticButton>
                  </Link>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
