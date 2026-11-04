import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Eyebrow, Img, LineReveal, PageHeader, Reveal } from '../components/primitives';
import { PHOTO, unsplash } from '../data/images';
import { useStore } from '../data/store';
import { usePageTitle } from '../lib/hooks';

const CHAPTERS = [
  { year: '2010', title: 'The first of eleven', text: 'The batch that set the bar: the first to wear the new house colours, and the last to remember the old canteen.' },
  { year: '2012', title: 'The library years', text: 'A renovated library became the unofficial common room. Some of us still owe fines.' },
  { year: '2015', title: 'The Big Match', text: 'A last-over finish at the inter-school encounter that is still argued about at weddings.' },
  { year: '2017', title: 'A new auditorium', text: 'The Main Auditorium opened its doors — the very room we will gather in this December.' },
  { year: '2020', title: 'The last bell, unrung', text: 'A final year cut short. For the class of 2020, this reunion is also the farewell they never had.' },
];

const COMMITTEE = [
  ['Dulani Wijeratne', 'Reunion Coordinator', 'Batch of 2012'],
  ['Ruwan Hettige', 'Treasurer', 'Batch of 2010'],
  ['Amaya Kodikara', 'Programme & Stage', 'Batch of 2016'],
  ['Sajith Peiris', 'Logistics & Transport', 'Batch of 2014'],
  ['Nethmi Ratnayake', 'Memories Archive', 'Batch of 2019'],
  ['Kusal Dharmasena', 'Alumni Outreach', 'Batch of 2011'],
];

export default function Story() {
  const { data } = useStore();
  const e = data.event;
  usePageTitle('Our Story');
  return (
    <>
      <PageHeader num="II" kicker="Our Story" title={[<>Eleven batches.</>, <><em className="gold-on-dark">One unfinished</em></>, <>conversation.</>]} image={unsplash(PHOTO.libraryShelves, 1800)}
        intro={<>Why we are coming back, who is bringing us together, and the decade that made {e.schoolName} ours.</>} />

      <section className="section on-paper grain">
        <div className="container story-open">
          <Reveal className="story-open__lede">
            <p className="display story-open__quote">“A school is not its buildings. It is the people who keep coming back to them.”</p>
          </Reveal>
          <Reveal className="story-open__body prose" delay={.1}>
            <p className="dropcap">The idea began, as the best ideas at school always did, in a group chat. A photograph of the old Grade 11 classroom — repainted, but with the same crooked blackboard — prompted a hundred replies in an hour. Someone wrote: <em>we should all go back.</em></p>
            <p>Eighteen months later, a committee of volunteers from every batch between {e.batchFrom} and {e.batchTo} has turned that message into {e.eventTitle}: a full day on the grounds where we grew up, with the teachers who raised us and the friends we have missed.</p>
            <p>We are not trying to recreate the past. We are trying to honour it — and to see who we have all become.</p>
          </Reveal>
        </div>
      </section>

      <section className="section on-dark grain grain--dark">
        <div className="container">
          <Eyebrow num="No. 01" className="gold-on-dark">A Decade in Five Chapters</Eyebrow>
          <ol className="chapters">
            {CHAPTERS.map((c, i) => (
              <Reveal as="li" key={c.year} className="chapter" delay={i * .05}>
                <span className="chapter__year display">{c.year}</span>
                <div>
                  <h3 className="h3">{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section on-paper grain">
        <div className="container story-split">
          <Reveal className="story-split__img">
            <Img src={unsplash(PHOTO.graduatesLawn, 1200)} alt="Graduates gathered on the school lawn" ratio="4/5" sizes="(max-width: 900px) 100vw, 45vw" />
            <figcaption className="caption"><span className="mono">Fig. 08</span> Leavers’ day on the main lawn.</figcaption>
          </Reveal>
          <div className="story-split__text">
            <Eyebrow num="No. 02">The Committee</Eyebrow>
            <LineReveal className="h1" lines={[<>Organised by</>, <><em>old students,</em></>, <>for old students.</>]} />
            <ul className="committee">
              {COMMITTEE.map(([n, r, b]) => (
                <li key={n}><span className="committee__name">{n}</span><span className="ui committee__role">{r}</span><span className="mono muted">{b}</span></li>
              ))}
            </ul>
            <Link to="/register" className="btn">Reserve your place <ArrowRight className="arrow" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
