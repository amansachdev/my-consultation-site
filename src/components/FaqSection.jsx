import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is Antaran?',
    answer: (
      <>
        <p>
          Antaran is a pan-India online mental-health clinic. With Antaran, you
          can book appointments and begin care with Dr Medha, a consultant
          psychiatrist.
        </p>
        <p>
          Our clinic team helps you find the right next step for your concerns
          and is here to guide you from 8 am to 11 pm IST every day (including
          weekends) on WhatsApp chat.
        </p>
      </>
    ),
  },
  {
    question: 'How does Antaran work?',
    answer: (
      <>
        <p>
          Antaran helps you connect with a registered psychiatrist from the
          comfort of your home.
        </p>
        <p>
          <strong>To book an appointment</strong>, visit our website, choose the
          consultation type you need, and submit a booking request with your
          preferred date and time. The clinic team will confirm your slot.
        </p>
        <p>
          For your comfort, video appointments are conducted over secure
          platforms such as Google Meet or Zoom. If there is anything you need,
          please get in touch and it shall be our pleasure to assist.
        </p>
      </>
    ),
  },
  {
    question: 'Can I reschedule or cancel my appointment?',
    answer: (
      <p>
        Yes. You can reschedule your appointment up to 30 minutes before the
        scheduled time. If you need to cancel, that is completely fine too — just
        let us know as soon as possible.
      </p>
    ),
  },
  {
    question: 'How can I talk to someone at Antaran?',
    answer: (
      <p>
        To speak to someone at Antaran, please email us at{' '}
        <a href="mailto:antaran.health@gmail.com">antaran.health@gmail.com</a>{' '}
        or message us on WhatsApp at{' '}
        <a href="https://wa.me/918088892105">+91 80888 92105</a>.
      </p>
    ),
  },
  {
    question: 'Will all my sessions / consultations remain confidential?',
    answer: (
      <p>
        Yes. All the information shared in your consultation / session with the
        healthcare provider remains confidential and is only available to you and
        your healthcare provider.
      </p>
    ),
  },
  {
    question: 'As a doctor / mental health professional, how can I join Antaran’s team?',
    answer: (
      <p>
        Please reach out to us on WhatsApp at{' '}
        <a href="https://wa.me/918088892105">+91 80888 92105</a> or email{' '}
        <a href="mailto:antaran.health@gmail.com">antaran.health@gmail.com</a>{' '}
        with your profile and we will get back to you.
      </p>
    ),
  },
  {
    question: 'Can I take an online consultation for emergencies?',
    answer: (
      <p>
        No. In case of emergencies, we do not advise or offer online
        consultations. In all cases of emergency, we strongly recommend an
        in-person interaction with a Registered Medical Practitioner at the
        earliest.
      </p>
    ),
  },
  {
    question: 'How much do online visits cost?',
    answer: (
      <>
        <p>
          At Antaran, we want quality mental healthcare to be available to
          everyone. Our fees are at par with in-person consultation charges and
          there are no hidden costs.
        </p>
        <p>
          Online consultations also help you save as there are no travelling
          costs or waiting time for appointments.
        </p>
      </>
    ),
  },
  {
    question: 'Can I avail of Antaran’s services from abroad?',
    answer: (
      <>
        <p>
          Yes. You can avail consultations at Antaran from anywhere in the world.
        </p>
        <p>
          Your provider shall connect with you over Google Meet / Zoom or might
          request you to make a phone call.
        </p>
      </>
    ),
  },
  {
    question: 'How can I change my doctor or therapist?',
    answer: (
      <>
        <p>
          At Antaran, you can request a different provider whenever you want.
          Just let the clinic team know and they will guide you to the right
          specialist.
        </p>
        <p>
          Your journey of healing is important to us, and you have a right to
          continue looking for the right therapist until you feel comfortable and
          safe.
        </p>
      </>
    ),
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answerToText(answer),
        },
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    script.id = 'faq-schema';
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('faq-schema');
      if (existing) existing.remove();
    };
  }, []);

  return (
    <section id="faqs" className="section bg-white">
      <div className="section-heading">
        <p className="eyebrow">FAQs</p>
        <h2>Questions we often hear.</h2>
      </div>

      <div className="mx-auto max-w-3xl divide-y divide-line rounded-lg border border-line bg-white shadow-sm">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-ink transition hover:bg-mist/50 sm:px-6"
              >
                <span>{item.question}</span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-clay transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ${
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-3 px-5 pb-5 text-ink/70 leading-7 sm:px-6">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function answerToText(answerNode) {
  if (typeof answerNode === 'string') return answerNode;
  if (Array.isArray(answerNode)) {
    return answerNode.map(answerToText).join(' ');
  }
  const { props } = answerNode;
  if (!props) return '';

  if (props.dangerouslySetInnerHTML) {
    return props.dangerouslySetInnerHTML.__html || '';
  }

  const children = Array.isArray(props.children)
    ? props.children
    : [props.children];

  if (props.href && typeof children[0] === 'string') {
    return children[0];
  }

  return children.map(answerToText).join(' ').replace(/\s+/g, ' ').trim();
}
