import React from 'react';
import avatar1 from '../images/Avatar1.svg';
import avatar2 from '../images/Avatar2.svg';
import avatar3 from '../images/Avatar3.svg';
import avatar4 from '../images/Avatar4.svg';
import avatar5 from '../images/Avatar5.svg';
import avatar6 from '../images/Avatar6.svg';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote: '"MatchMaker transformed my application!"',
      name: "Dr. Aisha R. – Matched in ",
      specialty: "Internal Medicine",
      testimonial: "I never knew how to showcase my strengths until I used MatchMaker. The AI-driven guidance was a game changer!",
      avatar: avatar1
    },
    {
      id: 2,
      quote: '"I felt confident hitting submit."',
      name: "Dr. James T. – Matched in ",
      specialty: "Surgery",
      testimonial: "Writing my personal statement was overwhelming, but MatchMaker helped me structure my story perfectly!",
      avatar: avatar2
    },
    {
      id: 3,
      quote: '"Its like having a personal residency coach."',
      name: "Dr. Sophia M. – Matched in ",
      specialty: "Pediatrics",
      testimonial: "From my CV to my research portfolio, everything was organized and polished thanks to MatchMaker.",
      avatar: avatar3
    },
    {
      id: 4,
      quote: '"The dashboard kept me on track"',
      name: "Dr. Rahul S. – Matched in ",
      specialty: "Psychiatry",
      testimonial: "Seeing my progress in real time made the application process way less stressful.",
      avatar: avatar4
    },
    {
      id: 5,
      quote: '"I got interview invites from my dream programs."',
      name: "Dr. Emily C. – Matched in ",
      specialty: "Radiology",
      testimonial: "MatchMaker helped me identify the best programs based on my preferences. It saved me so much time!",
      avatar: avatar5
    },
    {
      id: 6,
      quote: '"Finally, an application process that focuses on ME."',
      name: "Dr. Omar B. – Matched in ",
      specialty: "Family Medicine",
      testimonial: "I love that this platform prioritizes fit and potential rather than just scores. It really changed my perspective.",
      avatar: avatar6
    }
  ];

  return (
    <section className="bg-[#f0f5f8] py-16 px-4 md:px-6 lg:px-8 flex items-center justify-center">
      <div className="">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">What Our Users Say</h2>
          <p className="text-xl text-gray-500">Real Stories from Medical Students Like You</p>
        </div>
        
        <div className="grid place-items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <div 
              key={testimonial.id} 
              className="bg-white rounded-2xl shadow-xl p-6 flex flex-col justify-between"
              style={{ height: '286px',width:'325.33px' }}
            >
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{testimonial.quote}</h3>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center mt-4">
                  <img
                    src={testimonial.avatar}
                    alt={`${testimonial.name.split('-')[0]} avatar`}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-medium text-gray-600">{testimonial.name} 
                      <span className="font-medium text-gray-600">{testimonial.specialty}</span>
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-400">"{testimonial.testimonial}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;