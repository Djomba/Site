import heroImage from '../assets/space-hero-gymnast.png';

const benefits = [
  {
    title: 'Профессиональные тренеры',
    text: 'Команда специалистов с опытом подготовки детей к выступлениям и соревнованиям.',
  },
  {
    title: 'Индивидуальный подход',
    text: 'Мы учитываем возраст, уровень подготовки, темперамент и цели каждой спортсменки.',
  },
  {
    title: 'Современная программа',
    text: 'Занятия объединяют гимнастику, хореографию, ОФП, растяжку и работу с предметами.',
  },
  {
    title: 'Подготовка к выступлениям',
    text: 'Помогаем уверенно пройти путь от первых элементов до выразительного выхода на ковёр.',
  },
];

function HomePage({ onNavigate }) {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="section-kicker">SPACE rhythmic academy</span>
          <h1>Академия художественной гимнастики SPACE</h1>
          <p>Развиваем гибкость, силу, грацию и уверенность в каждом ребёнке</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onNavigate('trainers')}>
              Выбрать тренера
            </button>
            <button className="text-link" onClick={scrollToAbout}>
              Узнать об академии
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-label="Гимнастка с лентой в светлом зале">
          <img src={heroImage} alt="Гимнастка с лентой в светлом тренировочном зале" />
          <div className="hero-badge">
            <strong>4+</strong>
            <span>возраст начала занятий</span>
          </div>
        </div>
      </section>

      <section className="benefits-section">
        {benefits.map((benefit, index) => (
          <article className="benefit-card" key={benefit.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{benefit.title}</h3>
            <p>{benefit.text}</p>
          </article>
        ))}
      </section>

      <section className="about-section" id="about">
        <div>
          <span className="section-kicker">О академии</span>
          <h2>SPACE - место, где спорт становится красивой привычкой</h2>
        </div>
        <p>
          SPACE - современная академия художественной гимнастики для детей и подростков. Мы создаём спокойную,
          эстетичную и дисциплинированную среду, где ребёнок учится владеть телом, слышать музыку, уважать труд и
          смело проявлять себя. В тренировочном процессе важны не только элементы, но и уверенность, осанка, культура
          движения и радость от собственного прогресса.
        </p>
      </section>

      <section className="cta-section" id="contacts">
        <div>
          <span className="section-kicker">Первый шаг</span>
          <h2>Начните путь в художественной гимнастике уже сегодня</h2>
          <p>Выберите тренера, а администратор SPACE поможет подобрать удобную группу и время пробного занятия.</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate('trainers')}>
          Выбрать тренера
        </button>
      </section>
    </>
  );
}

export default HomePage;
