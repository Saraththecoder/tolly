import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-brand-dark text-gray-100">
      <Helmet>
        <title>About Us | CHITRAMBHALARE</title>
        <meta name="description" content="Learn more about CHITRAMBHALARE, our mission, vision, and the editorial team." />
      </Helmet>

      {/* Banner */}
      <div className="bg-brand-dark/50 border-b border-brand-red/20 text-gray-100 py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-red/5 blur-[100px]"></div>
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-poppins font-bold mb-4">About CHITRAMBHALARE</h1>
          <p className="text-xl text-gray-400 font-inter max-w-2xl mx-auto">
            Your most trusted source for Tollywood news, reviews, and box office tracking.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* About Company */}
          <section className="text-center">
            <h2 className="text-3xl font-poppins font-bold text-gray-100 mb-6">Who We Are</h2>
            <p className="text-gray-400 text-lg leading-relaxed font-inter">
              Founded in 2018, CHITRAMBHALARE has quickly grown to become the premier destination for all things related to the Telugu film industry. We are dedicated to providing our readers with accurate, timely, and engaging content, ranging from breaking news to in-depth analytical reviews and exclusive interviews.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="glass-card bg-brand-red/5 p-8 rounded-xl border border-brand-red/20 shadow-[0_0_30px_rgba(230,0,0,0.05)]">
              <h3 className="text-2xl font-poppins font-bold text-brand-red mb-4">Our Mission</h3>
              <p className="text-gray-400 leading-relaxed font-inter">
                To bridge the gap between Tollywood and its global audience by delivering authentic, high-quality journalism and celebrating the magic of Telugu cinema.
              </p>
            </div>

            {/* Vision */}
            <div className="glass-card p-8 rounded-xl border border-brand-red/20">
              <h3 className="text-2xl font-poppins font-bold text-gray-100 mb-4">Our Vision</h3>
              <p className="text-gray-400 leading-relaxed font-inter">
                To be the most reliable and influential entertainment news platform in India, setting the standard for digital journalism in the entertainment sector.
              </p>
            </div>
          </div>

          {/* Editorial Team */}
          <section>
            <h2 className="text-3xl font-poppins font-bold text-gray-100 mb-8 text-center">Our Editorial Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { name: 'Ravi Teja', role: 'Editor-in-Chief', img: 'https://i.pravatar.cc/150?u=1' },
                { name: 'Sita Ram', role: 'Senior Critic', img: 'https://i.pravatar.cc/150?u=2' },
                { name: 'Priya Sharma', role: 'Box Office Analyst', img: 'https://i.pravatar.cc/150?u=3' },
              ].map(member => (
                <div key={member.name} className="text-center group">
                  <img 
                    src={member.img} 
                    alt={member.name} 
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d1b30&color=f5c842&size=128`;
                    }}
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-brand-red/20 group-hover:border-brand-red transition-colors object-cover" 
                  />
                  <h4 className="text-xl font-bold font-poppins text-gray-100">{member.name}</h4>
                  <p className="text-brand-red font-medium">{member.role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Information */}
          <section className="glass-card text-gray-100 p-8 md:p-12 rounded-2xl border border-brand-red/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            <h2 className="text-3xl font-poppins font-bold mb-8 text-center relative z-10">Get In Touch</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4 text-brand-red shadow-[0_0_15px_rgba(230,0,0,0.3)]">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-2">Email</h4>
                <p className="text-gray-400">CHITRAMBHALARE1984@GMAIL.COM</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4 text-brand-red shadow-[0_0_15px_rgba(230,0,0,0.3)]">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-2">Phone</h4>
                <p className="text-gray-400">+91 98765 43210</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4 text-brand-red shadow-[0_0_15px_rgba(230,0,0,0.3)]">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-2">Office</h4>
                <p className="text-gray-400">Jubilee Hills, Hyderabad</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default About;
