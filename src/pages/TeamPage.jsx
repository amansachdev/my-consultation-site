import teamImage from '../../assets/dr medha profile.png';
import { doctor } from '../constants';

export function TeamPage() {
  return (
    <section className="section bg-white">
      <div className="section-heading">
        <p className="eyebrow">Know your team</p>
        <h2>Meet the clinician behind Antaran.</h2>
        <p>
          Psychiatric care grounded in careful listening, clinical experience,
          and thoughtful planning.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 rounded-2xl border border-line bg-mist p-6 shadow-sm sm:p-10 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.4fr)] lg:gap-14 lg:p-12 lg:items-start">
        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-white">
          <img
            src={teamImage}
            alt={`${doctor.name}, ${doctor.qualification}`}
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-3xl font-semibold text-ink">
              {doctor.name}
            </h3>
            <p className="text-lg font-medium text-moss">{doctor.qualification}</p>
          </div>
          <div className="space-y-4 leading-7 text-ink/70">
            <p>
              Dr. Medha is a psychiatrist committed to providing compassionate,
              evidence-based, and affordable mental healthcare. She completed
              her MBBS from Bellary Medical College and Research Centre and her
              MD in Psychiatry from Kempegowda Institute of Medical Sciences,
              Bengaluru.
            </p>
            <p>
              She secured Rank 2 in Psychiatry under RGUHS with distinction and
              has gained clinical experience at NIMHANS, Bengaluru, along with
              experience providing psychiatric consultations through multiple
              online healthcare platforms.
            </p>
            <p>
              Her approach is centred on understanding each individual beyond
              their symptoms and creating a comfortable, non-judgmental space
              where patients can openly discuss their concerns.
            </p>
            <p>
              Through Antaran, she aims to make quality psychiatric care more
              accessible and affordable, while helping individuals take a
              meaningful step towards better mental well-being.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
